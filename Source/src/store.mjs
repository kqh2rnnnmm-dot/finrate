import Dexie from 'dexie';
import {fail,uid,now} from './model.mjs';
// Called only after the IndexedDB transaction rejects, so rollback is established.
function transactionFailure(error){if(error?.name==='QuotaExceededError'||error?.inner?.name==='QuotaExceededError')fail('STORAGE_QUOTA_ABORTED');throw error;}
export function createStore(name='finrate-local-v1',dependencies){
  const db=new Dexie(name,dependencies);db.version(1).stores({vault:'id',safety:'id,createdAt'});
  db.on('versionchange',()=>db.close());
  const sameVersion=(a,b)=>a?.generation===b?.generation&&a?.vault?.datasetId===b?.vault?.datasetId;
  const same=(a,b)=>sameVersion(a,b)&&a?.vault?.revision===b?.vault?.revision&&a?.vault?.savedAt===b?.vault?.savedAt&&a?.vault?.iv===b?.vault?.iv&&a?.vault?.data===b?.vault?.data&&JSON.stringify(a?.vault?.slots)===JSON.stringify(b?.vault?.slots);
  return {
    db, async read(){return db.vault.get('active');},
    async readAccess(){return db.vault.get('device-access');},
    async assertCurrent(expected){const current=await db.vault.get('active');if(!current||!sameVersion(current,expected))fail('STALE');},
    async commit(vault,expected,{beforeRestore=false,beforeMigration=false,access,resetAccess=false}={}){
      return db.transaction('rw',db.vault,db.safety,async()=>{
        const current=await db.vault.get('active');if(!same(current,expected))fail('STALE');
        if((beforeRestore||beforeMigration)&&current)await db.safety.add({id:uid(),createdAt:now(),vault:current.vault,reason:beforeMigration?'before-schema-3':'before-restore'});
        const record={id:'active',generation:(current?.generation||0)+1,vault};await db.vault.put(record);
        if(resetAccess)await db.vault.delete('device-access');else if(access)await db.vault.put(access);return record;
      }).catch(transactionFailure);
    },
    async accessAttempt(expected,id){return db.transaction('rw',db.vault,async()=>{const current=await db.vault.get('active'),a=await db.vault.get('device-access');if(!same(current,expected)||a?.accessId!==id)fail('STALE');if(!Number.isInteger(a.failed)||a.failed<0||a.failed>=5)fail('PIN_LOCKED');a.failed++;await db.vault.put(a);return {...a,failed:a.failed-1};});},
    async resetAttempts(expected,id){return db.transaction('rw',db.vault,async()=>{const current=await db.vault.get('active'),a=await db.vault.get('device-access');if(!same(current,expected)||a?.accessId!==id)fail('STALE');if(a.failed){a.failed=0;await db.vault.put(a);}});},
    async clearFinancial(vault,expected){
      return db.transaction('rw',db.vault,db.safety,async()=>{
        const current=await db.vault.get('active');if(!current||!same(current,expected))fail('STALE');
        const record={id:'active',generation:current.generation+1,vault};
        await db.vault.put(record);await db.safety.clear();return record;
      }).catch(transactionFailure);
    },
    async safety(){return db.safety.orderBy('createdAt').reverse().toArray();},
    async reset(expected,{validate}={}){
      return db.transaction('rw',db.vault,db.safety,async()=>{
        const current=await db.vault.get('active');if(!current||!same(current,expected))fail('STALE');
        validate?.(current);await db.safety.clear();validate?.(current);await db.vault.clear();validate?.(current);
        if(validate&&(await db.vault.count()!==0||await db.safety.count()!==0))fail('STALE');validate?.(current);
      }).catch(transactionFailure);
    },
    async close(){db.close();}
  };
}
