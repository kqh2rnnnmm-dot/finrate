import test from 'node:test';
import assert from 'node:assert/strict';
import {indexedDB,IDBKeyRange} from 'fake-indexeddb';
import {FinRate} from '../src/service.mjs';
import {createStore} from '../src/store.mjs';
import {secret,auditDocument} from './a1-fixture.mjs';
import {createVault,openVault,parseBackup} from '../src/crypto.mjs';
const rejects=(promise,code)=>assert.rejects(promise,e=>e.code===code);
async function fixture(fn){
 const store=createStore('a3-'+crypto.randomUUID(),{indexedDB,IDBKeyRange}),password=secret(),replacement=secret(),made=await createVault(auditDocument(),password),app=new FinRate(store);
 try{await store.commit(made.vault);await app.unlock(password);await fn({app,store,password,replacement,recovery:made.recoveryKey});}finally{await store.close();}
}
for(const mode of ['password','recovery'])test('A3 same current password is rejected by service using '+mode,()=>fixture(async({app,store,password,recovery})=>{
 const before=await store.read(),doc=structuredClone(app.document);
 await rejects(app.changeSecurity({action:'password',secret:mode==='password'?password:recovery,mode,password}),'PASSWORD_SAME');
 assert.deepEqual(await store.read(),before);assert.deepEqual(app.document,doc);assert.equal(await store.readAccess(),undefined);assert.deepEqual(await store.safety(),[]);
}));

const payload=d=>{const {revision,updatedAt,events,...data}=d;return data;};
const pin=length=>String(crypto.getRandomValues(new Uint32Array(1))[0]%10**length).padStart(length,'0');
for(const entry of ['password','pin','none'])for(const mode of ['password','recovery'])test(`A3 password change by ${mode} preserves ${entry}, full financial payload, old/new backups`,()=>fixture(async({app,store,password,replacement,recovery})=>{
 const code=pin(6);if(entry!=='password')await app.changeSecurity({action:'entry',secret:password,entry,pin:code});
 const before=structuredClone(app.document),old=await app.backup(),oldAccess=await store.readAccess(),oldSlots=structuredClone(app.record.vault.slots);
 await app.changeSecurity({action:'password',secret:mode==='password'?password:recovery,mode,password:replacement});
 assert.deepEqual(payload(app.document),payload(before));assert.deepEqual(app.document.events.slice(0,-1),before.events);assert.deepEqual(app.record.vault.slots.recovery,oldSlots.recovery);
 assert.equal((await app.entryStatus()).mode,entry);const fresh=await app.backup(),vault=await parseBackup(fresh);
 await rejects(openVault(vault,password),'DECRYPT');assert.deepEqual((await openVault(vault,replacement)).doc,app.document);assert.deepEqual((await openVault(vault,recovery,'recovery')).doc,app.document);assert.deepEqual((await openVault(await parseBackup(old),password)).doc,before);
 if(entry!=='password'){assert.equal((await store.readAccess()).accessId,oldAccess.accessId);app.lock();await app.unlockLocal(entry==='pin'?code:undefined);assert.deepEqual(payload(app.document),payload(before));}
 // A real independent IndexedDB fixture restores the downloaded Blob bytes.
 const clean=createStore('a3-restore-'+crypto.randomUUID(),{indexedDB,IDBKeyRange});try{const other=new FinRate(clean),prepared=await other.prepareRestore(new Blob([await fresh.arrayBuffer()]),replacement);await other.applyRestore(prepared,true);assert.deepEqual(other.document,app.document);assert.equal(await clean.readAccess(),undefined);other.lock();await rejects(other.unlockLocal(code),'ACCESS_LOST');await other.unlock(recovery,'recovery');}finally{await clean.close();}
 const event=JSON.stringify(app.document.events.at(-1).details);for(const value of [password,replacement,recovery,code])assert.equal(event.includes(value),false,'history excludes credentials');
}));

test('A3 password boundaries 12 and 1024; weak, excessive and wrong secrets leave all state unchanged',()=>fixture(async({app,store,password})=>{
 for(const length of [0,11,1025]){const before=await store.read();await rejects(app.changeSecurity({action:'password',secret:password,password:'x'.repeat(length)}),'PASSWORD');assert.deepEqual(await store.read(),before);}
 const before=await store.read();await rejects(app.changeSecurity({action:'password',secret:secret(),password:secret()}),'DECRYPT');assert.deepEqual(await store.read(),before);
 for(const length of [12,1024]){const next=(secret().repeat(16)).slice(0,length);await app.changeSecurity({action:'password',secret:password,password:next});password=next;app.lock();await app.unlock(next);}
}));

test('A3 PIN4 → password → PIN6 → none → password removes previous local capabilities',()=>fixture(async({app,store,password,recovery})=>{
 const short=pin(4),long=pin(6),before=payload(app.document);
 await app.changeSecurity({action:'entry',secret:password,entry:'pin',pin:short});app.lock();await app.unlockLocal(short);
 await app.changeSecurity({action:'entry',secret:password,entry:'password'});assert.equal(await store.readAccess(),undefined);app.lock();await rejects(app.unlockLocal(short),'ACCESS_LOST');await app.unlock(recovery,'recovery');
 await app.changeSecurity({action:'entry',secret:recovery,mode:'recovery',entry:'pin',pin:long});app.lock();await rejects(app.unlockLocal(short),'PIN');await app.unlockLocal(long);
 await app.changeSecurity({action:'entry',secret:password,entry:'none'});app.lock();await app.unlockLocal();assert.equal((await store.readAccess()).mode,'none');
 await app.changeSecurity({action:'entry',secret:password,entry:'password'});app.lock();await rejects(app.unlockLocal(long),'ACCESS_LOST');await app.unlock(password);assert.deepEqual(payload(app.document),before);
}));

for(const entry of ['pin','none'])test('A3 failed password transaction rolls back active/access/safety and preserves '+entry,()=>fixture(async({app,store,password,replacement})=>{
 const code=pin(4);await app.changeSecurity({action:'entry',secret:password,entry,pin:code});const before=await store.read(),access=await store.readAccess(),document=structuredClone(app.document);
 const hook=(_mods,key)=>{if(key==='device-access')throw new DOMException('isolated quota','QuotaExceededError');};store.db.vault.hook('updating',hook);
 try{await rejects(app.changeSecurity({action:'password',secret:password,password:replacement}),'STORAGE_QUOTA_ABORTED');}finally{store.db.vault.hook('updating').unsubscribe(hook);}
 assert.deepEqual(await store.read(),before);assert.deepEqual(await store.readAccess(),access);assert.deepEqual(await store.safety(),[]);assert.deepEqual(app.document,document);app.lock();await app.unlockLocal(entry==='pin'?code:undefined);await rejects(openVault(app.record.vault,replacement),'DECRYPT');
}));

test('A3 stale password/recovery change cannot replace newer PIN or password',()=>fixture(async({app,store,password,replacement,recovery})=>{
 const peer=new FinRate(store);await peer.unlock(password);await app.changeSecurity({action:'password',secret:password,password:replacement});await app.changeSecurity({action:'entry',secret:replacement,entry:'pin',pin:pin(6)});const before=await store.read(),access=await store.readAccess();
 await rejects(peer.changeSecurity({action:'password',secret:recovery,mode:'recovery',password:secret()}),'STALE');assert.deepEqual(await store.read(),before);assert.deepEqual(await store.readAccess(),access);
}));

for(const length of [4,6])test('A3 PIN'+length+' failed attempt limit survives cold service, recovery alone resets counters',()=>fixture(async({app,store,password,recovery})=>{
 const code=pin(length),wrong=String((Number(code)+1)%10**length).padStart(length,'0');await app.changeSecurity({action:'entry',secret:password,entry:'pin',pin:code});const before=await store.read();app.lock();
 for(let i=0;i<5;i++){const cold=new FinRate(store);await rejects(cold.unlockLocal(wrong),'PIN_WRONG');assert.equal((await store.readAccess()).failed,i+1);assert.deepEqual(await store.read(),before);}
 await rejects(app.unlockLocal(code),'PIN_LOCKED');await rejects(app.unlock(secret()),'DECRYPT');assert.equal((await store.readAccess()).failed,5);await app.unlock(recovery,'recovery');assert.equal((await store.readAccess()).failed,0);app.lock();await app.unlockLocal(code);assert.deepEqual(await store.read(),before);
}));

for(const entry of ['pin','none'])for(const reset of ['financial','categories','all'])test(`A3 changed password + ${entry} retains A2 ${reset} behavior and restores external file`,()=>fixture(async({app,store,password,replacement,recovery})=>{
 const code=pin(6);await app.changeSecurity({action:'entry',secret:password,entry,pin:code});await app.changeSecurity({action:'password',secret:password,password:replacement});const doc=structuredClone(app.document),access=await store.readAccess(),slots=structuredClone(app.record.vault.slots),blob=await app.backup();
 const intent=await app.resetPreview(reset),proof=await app.prepareReset(recovery,'recovery',intent,new Blob([await blob.arrayBuffer()]));await app.resetData(proof,true);
 if(reset==='all'){assert.equal(await store.read(),undefined);assert.equal(await store.readAccess(),undefined);assert.equal(app.document,null);}else{assert.deepEqual(app.record.vault.slots,slots);assert.deepEqual(await store.readAccess(),access);assert.equal(app.document.settings.autoLock,doc.settings.autoLock);app.lock();await app.unlockLocal(entry==='pin'?code:undefined);assert.deepEqual(app.document.operations,[]);assert.equal(app.document.categories.length,reset==='financial'?doc.categories.length:0);}
 const clean=createStore('a3-reset-restore-'+crypto.randomUUID(),{indexedDB,IDBKeyRange});try{const other=new FinRate(clean);await other.applyRestore(await other.prepareRestore(blob,replacement),true);assert.deepEqual(other.document,doc);assert.equal((await other.entryStatus()).mode,'password');assert.equal(await clean.readAccess(),undefined);}finally{await clean.close();}
}));
