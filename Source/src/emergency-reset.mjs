// Destruction/export authority only. No key, document, unlock, KDF or decryption.
import {fail} from './model.mjs';
import {validateVault,backupBlob} from './crypto.mjs';
import {sameContainer} from './reset-policy.mjs';
const MAX_CONTAINER=12*1024*1024;
function snapshot(record){
 if(!record)fail('EMPTY');const v=record.vault;
 if(record.id!=='active'||!Number.isSafeInteger(record.generation)||record.generation<1||!v||typeof v!=='object'||Array.isArray(v)||typeof v.datasetId!=='string'||!v.datasetId||v.datasetId.length>100)fail('FORMAT');
 let encoded;try{encoded=JSON.stringify(v);}catch{fail('FORMAT');}if(new TextEncoder().encode(encoded).length>MAX_CONTAINER)fail('SIZE');
 return {id:'active',generation:record.generation,vault:structuredClone(v)};
}
function exportable(v){
 const known=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))fail('FORMAT');};
 known(v,['format','datasetId','revision','savedAt','slots','iv','data']);known(v.slots,['password','recovery']);known(v.slots.password,['kdf','iterations','salt','iv','data']);known(v.slots.recovery,['kdf','iv','data']);validateVault(v);
}
const same=(a,b)=>!!a&&a.generation===b.generation&&a.vault?.datasetId===b.vault.datasetId&&sameContainer(a.vault,b.vault);
export function createEmergencyReset(store,isLocked){
 let epoch=0,intents=new WeakMap(),proofs=new WeakMap();
 const closed=()=>{if(!isLocked())fail('EMERGENCY_LOCKED');};
 const discard=()=>{epoch++;intents=new WeakMap();proofs=new WeakMap();};
 const intentRequest=token=>{closed();const r=intents.get(token);if(!r||r.epoch!==epoch)fail('EMERGENCY_EXPIRED');return r;};
 async function current(request){const row=await store.read();if(!same(row,request.expected))fail('STALE');closed();if(request.epoch!==epoch)fail('EMERGENCY_EXPIRED');return row;}
 return {
  discard,
  async preview(){closed();discard();const ticket=epoch,expected=snapshot(await store.read());closed();if(ticket!==epoch)fail('EMERGENCY_EXPIRED');const token=Object.freeze({});intents.set(token,{epoch:ticket,expected,exported:false});return token;},
  async backup(token){const r=intentRequest(token),row=await current(r);if(intents.get(token)!==r)fail('EMERGENCY_EXPIRED');exportable(row.vault);const blob=backupBlob(row.vault);r.exported=true;return blob;},
  async prepare(token,{choice,fileChecked,acceptWithoutCopy}={}){const r=intentRequest(token);await current(r);if(intents.get(token)!==r)fail('EMERGENCY_EXPIRED');
   if(choice==='saved'){if(!r.exported||fileChecked!==true)fail('EMERGENCY_COPY');}else if(choice==='without-copy'){if(acceptWithoutCopy!==true)fail('CONFIRM');}else fail('CONFIRM');
   const proof=Object.freeze({});intents.delete(token);proofs.set(proof,{...r,choice});return proof;
  },
  async reset(proof,{ack,word}={}){closed();const r=proofs.get(proof);if(!r||r.epoch!==epoch)fail('EMERGENCY_EXPIRED');if(ack!==true||word!=='СБРОСИТЬ FINRATE')fail('CONFIRM');proofs.delete(proof);
   const validate=row=>{closed();if(r.epoch!==epoch)fail('EMERGENCY_EXPIRED');if(!same(row,r.expected))fail('STALE');};
   await store.reset(r.expected,{validate});discard();return r.expected.vault.datasetId;
  }
 };
}
