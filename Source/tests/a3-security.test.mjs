import test from 'node:test';
import assert from 'node:assert/strict';
import {indexedDB,IDBKeyRange} from 'fake-indexeddb';
import {FinRate} from '../src/service.mjs';
import {createStore} from '../src/store.mjs';
import {secret,auditDocument,financialState} from './a1-fixture.mjs';
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
