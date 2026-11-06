import {createEmergencyReset} from './emergency-reset.mjs';
import {resetSummary,clearedDocument,sameContainer} from './reset-policy.mjs';
import {defaultPlanning} from './planning.mjs';
import {copy,changed,validateDocument,newDocument,addAccount,addCategory,totals,fail,SCHEMA} from './model.mjs';
import {createVault,openVault,openWithKey,authorizeVault,newPasswordSlot,seal,backupBlob,parseBackup} from './crypto.mjs';
import {createAccess,openAccess,validAccess,rebindAccess} from './device-access.mjs';
import {migrateDocument} from './operations.mjs';
import {captureActivity} from './activity.mjs';
export class FinRate {
  #emergency;
  #resetProofs=new WeakMap();
  #resetIntents=new WeakMap();
  constructor(store){this.store=store;this.document=null;this.key=null;this.record=null;this.busy=false;this.entry={mode:'password'};this.#emergency=createEmergencyReset(store,()=>!this.document&&!this.key&&!this.record);}
  async exclusive(action){if(this.busy)fail('BUSY');this.busy=true;try{return await action();}finally{this.busy=false;}}
  lock(){if(this.busy)fail('BUSY');this.discardReset();this.discardEmergencyReset();this.document=null;this.key=null;this.record=null;}
  discardEmergencyReset(){this.#emergency.discard();}
  emergencyPreview(){return this.exclusive(()=>this.#emergency.preview());}
  emergencyBackup(intent){return this.exclusive(()=>this.#emergency.backup(intent));}
  prepareEmergencyReset(intent,choice){return this.exclusive(()=>this.#emergency.prepare(intent,choice));}
  emergencyReset(proof,confirmation){return this.exclusive(async()=>{const dataset=await this.#emergency.reset(proof,confirmation);this.document=null;this.key=null;this.record=null;this.entry={mode:'password'};this.needsMigration=false;this.discardReset();return dataset;});}
  async setup({currency,name,kind,opening,password}){return this.exclusive(async()=>{
    this.discardEmergencyReset();
    if(await this.store.read())fail('EXISTS');const d=newDocument(currency);d.planning=defaultPlanning();for(const name of ['Продукты','Кафе и рестораны','Жильё','Транспорт','Связь','Здоровье','Дети','Покупки'])addCategory(d,{name});for(const name of ['Зарплата','Дополнительный доход','Прочие поступления'])addCategory(d,{name,type:'income'});for(const [parent,children]of [['Зарплата',['Аванс','Основная часть']],['Дополнительный доход',['Подработка','Премия']],['Жильё',['ЖКХ','Аренда']]])for(const name of children)addCategory(d,{name,type:d.categories.find(c=>c.name===parent).type,parentId:d.categories.find(c=>c.name===parent).id});addAccount(d,{name:name||'Основной счёт',kind:kind||'wallet',opening:opening||0});changed(d,'setup');d.events.at(-1).details=captureActivity({...d,accounts:[]},d,'setup');
    const result=await createVault(d,password),record=await this.store.commit(result.vault,undefined);
    this.document=d;this.key=result.key;this.record=record;return result.recoveryKey;
  });}
  async unlock(secret,mode='password'){return this.exclusive(async()=>{
    this.discardEmergencyReset();
    const record=await this.store.read();if(!record)fail('EMPTY');const result=await openVault(record.vault,secret,mode);
    const access=await this.store.readAccess();if(await validAccess(record.vault,access))await this.store.resetAttempts(record,access.accessId);
    await this.store.assertCurrent(record);
    this.document=migrateDocument(result.doc);this.key=result.key;this.record=record;this.needsMigration=result.doc.schema<SCHEMA;return copy(this.document);
  });}
  async entryStatus(){const record=await this.store.read(),a=await this.store.readAccess();this.entry=record&&await validAccess(record.vault,a)?{mode:a.mode,length:a.length,failed:a.failed}:{mode:'password'};return this.entry;}
  async unlockLocal(pin){return this.exclusive(async()=>{
    this.discardEmergencyReset();
    const record=await this.store.read();if(!record)fail('EMPTY');let a=await this.store.readAccess();if(!await validAccess(record.vault,a))fail('ACCESS_LOST');
    if(a.mode==='pin')a=await this.store.accessAttempt(record,a.accessId);
    const result=await openAccess(record.vault,a,pin);await this.store.resetAttempts(record,a.accessId);
    this.document=migrateDocument(result.doc);this.key=result.key;this.record=record;this.needsMigration=result.doc.schema<SCHEMA;return copy(this.document);
  });}
  async changeSecurity({action,secret,mode='password',password,pin,entry}){return this.exclusive(async()=>{
    if(!this.document||!this.key||!['password','entry'].includes(action))fail('LOCKED');
    const auth=await authorizeVault(this.record.vault,secret,mode);
    try{
      let slots=this.record.vault.slots,access=await this.store.readAccess(),resetAccess=false;
      const previous=await validAccess(this.record.vault,access)?access.mode:'password';
      if(action==='password'){
        if(typeof password!=='string'||password.length<12||password.length>1024)fail('PASSWORD');
        // Recovery can authorize a change too: enforce the same rule at the
        // service boundary without retaining a password or changing the DEK.
        let unchanged=mode==='password'&&password===secret;
        if(mode==='recovery'){try{await openVault(this.record.vault,password);unchanged=true;}catch(e){if(e.code!=='DECRYPT')throw e;}}
        if(unchanged)fail('PASSWORD_SAME');
        slots={...slots,password:await newPasswordSlot(auth.raw,this.document.datasetId,password)};
      }
      else{if(!['pin','none','password'].includes(entry))fail('FORMAT');if(entry==='password'){access=undefined;resetAccess=true;}else access=await createAccess(this.record.vault,auth.raw,entry,pin);}
      const next=copy(this.document),label=action==='password'?'Основной пароль изменён':entry==='pin'?'Вход по PIN включён':entry==='none'?'Вход без проверки включён':'Вход по основному паролю включён';
      changed(next,'security.'+(action==='password'?'password':entry));next.events.at(-1).details={version:1,counts:{settings:1},items:[{type:'settings',id:'security',title:'Пароль и вход',action:label,changes:action==='password'?[]:[{key:'entryMode',before:previous,after:entry},...(entry==='pin'?[{key:'pinLength',before:null,after:pin.length}]:[])]}]};
      const vault=await seal(next,auth.key,slots);
      if(action==='password'){if(await validAccess(this.record.vault,access))access=await rebindAccess({...access,failed:0},vault);else{access=undefined;resetAccess=true;}}
      const record=await this.store.commit(vault,this.record,{access,resetAccess,beforeMigration:!!this.needsMigration});
      this.document=next;this.key=auth.key;this.record=record;this.needsMigration=false;this.entry={mode:action==='password'?previous:entry,...(access?.mode==='pin'?{length:access.length,failed:0}:{})};
    }finally{auth.raw.fill(0);}
  });}
  async mutate(action,fn){return this.exclusive(async()=>{
    if(!this.document||!this.key)fail('LOCKED');const next=copy(this.document),result=fn(next);
    if(result===false)return false;const details=captureActivity(this.document,next,action);changed(next,action);next.events.at(-1).details=details;validateDocument(next);
    const vault=await seal(next,this.key,this.record.vault.slots),record=await this.store.commit(vault,this.record,{beforeMigration:!!this.needsMigration});
    this.document=next;this.record=record;this.needsMigration=false;return result;
  });}
  async backup(expected=this.record){return this.exclusive(async()=>{
    if(!this.document||!this.key||!this.record)fail('LOCKED');
    const record=await this.store.read();
    if(!record||record.generation!==expected?.generation||record.vault.datasetId!==expected?.vault.datasetId||record.generation!==this.record.generation||record.vault.datasetId!==this.record.vault.datasetId)fail('STALE');
    try{await openWithKey(record.vault,this.key);}catch{fail('BACKUP_INVALID');}
    await this.store.assertCurrent(record);return backupBlob(record.vault);
  });}
  discardReset(){this.#resetProofs=new WeakMap();this.#resetIntents=new WeakMap();}
  async resetPreview(mode){return this.exclusive(async()=>{
    if(!this.document||!this.key)fail('LOCKED');await this.store.assertCurrent(this.record);
    const summary=resetSummary(this.document,mode,(await this.store.safety()).length,await this.entryStatus());
    await this.store.assertCurrent(this.record);
    const intent=Object.freeze({mode,summary:Object.freeze(summary)});this.#resetIntents.set(intent,{mode,expected:this.record});return intent;
  });}
  async prepareReset(secret,mode='password',intent,file){return this.exclusive(async()=>{
    if(!this.document||!this.key)fail('LOCKED');if(!['password','recovery'].includes(mode))fail('FORMAT');
    const request=this.#resetIntents.get(intent);if(!request)fail('CONFIRM');
    await this.store.assertCurrent(request.expected);
    const persisted=await this.store.read();if(!persisted||!sameContainer(persisted.vault,request.expected.vault))fail('BACKUP_INVALID');
    const vault=await parseBackup(file);if(!sameContainer(vault,request.expected.vault))fail('BACKUP_MISMATCH');
    const auth=await openVault(vault,secret,mode),document=migrateDocument(auth.doc);
    resetSummary(document,request.mode,0,this.entry);await this.store.assertCurrent(request.expected);
    if(this.#resetIntents.get(intent)!==request)fail('CONFIRM');
    const proof=Object.freeze({mode:request.mode,verifiedWith:mode});
    this.#resetProofs.set(proof,{expected:request.expected,mode:request.mode,document});return proof;
  });}
  async resetData(proof,confirmed){return this.exclusive(async()=>{
    if(!this.document||!this.key)fail('LOCKED');const request=this.#resetProofs.get(proof);
    if(confirmed!==true||!request)fail('CONFIRM');
    if(request.mode==='all'){
      await this.store.reset(request.expected);this.document=null;this.key=null;this.record=null;this.entry={mode:'password'};
    }else{
      const next=clearedDocument(request.document,request.mode),vault=await seal(next,this.key,request.expected.vault.slots);
      if(this.#resetProofs.get(proof)!==request)fail('CONFIRM');
      const record=await this.store.clearFinancial(vault,request.expected);
      this.document=next;this.record=record;
    }
    this.discardReset();this.needsMigration=false;return request.mode;
  });}
  async prepareRestore(file,secret,mode='password'){return this.exclusive(async()=>{
    const vault=await parseBackup(file),{doc,key}=await openVault(vault,secret,mode),expected=await this.store.read();
    return {vault,doc,key,expected,summary:{verifiedWith:mode,currency:doc.currency,accounts:doc.accounts.length,categories:doc.categories.length,operations:doc.operations.length,drafts:doc.drafts?.length||0,total:totals(migrateDocument(doc)).total,savedAt:doc.updatedAt,different:!!expected&&expected.vault.datasetId!==doc.datasetId,older:!!expected&&expected.vault.datasetId===doc.datasetId&&vault.revision<expected.vault.revision,replaces:!!expected}};
  });}
  async applyRestore(prepared,confirmed){return this.exclusive(async()=>{
    this.discardEmergencyReset();
    if(confirmed!==true)fail('CONFIRM');validateDocument(prepared.doc);
    const record=await this.store.commit(prepared.vault,prepared.expected,{beforeRestore:true,resetAccess:true});this.entry={mode:'password'};
    this.document=migrateDocument(prepared.doc);this.key=prepared.key;this.record=record;this.needsMigration=prepared.doc.schema<SCHEMA;return copy(this.document);
  });}
}
