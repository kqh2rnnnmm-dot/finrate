import {fail,validateDocument} from './model.mjs';
export const ITERATIONS=600000, MAX_BYTES=8*1024*1024;
const te=new TextEncoder(),td=new TextDecoder('utf-8',{fatal:true});
const bytes=n=>crypto.getRandomValues(new Uint8Array(n));
export function base64(b){let s='';for(const x of new Uint8Array(b))s+=String.fromCharCode(x);return btoa(s);}
function decode(s,min,max=min){if(typeof s!=='string'||s.length>Math.ceil(max/3)*4||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))fail('FORMAT');const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));if(b.length<min||b.length>max)fail('FORMAT');return b;}
const header=v=>({format:v.format,datasetId:v.datasetId,revision:v.revision,savedAt:v.savedAt});
const aad=x=>te.encode(JSON.stringify(x));
const slotAAD=(id,type,slot)=>aad({format:'finrate-key/1',datasetId:id,type,kdf:slot.kdf,iterations:slot.iterations||null,salt:slot.salt||null});
const importAES=raw=>crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
async function passwordKey(password,salt,iterations){
  if(typeof password!=='string'||password.length<12||password.length>1024)fail('PASSWORD');
  const input=await crypto.subtle.importKey('raw',te.encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},input,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
function recoveryBytes(secret){if(typeof secret!=='string')fail('RECOVERY');const s=secret.replace(/[\s-]/g,'').toLowerCase();if(!/^[0-9a-f]{64}$/.test(s))fail('RECOVERY');return Uint8Array.from(s.match(/../g),x=>parseInt(x,16));}
async function wrap(raw,key,id,type,meta){const s={...meta,iv:base64(bytes(12))};s.data=base64(await crypto.subtle.encrypt({name:'AES-GCM',iv:decode(s.iv,12),additionalData:slotAAD(id,type,s)},key,raw));return s;}
export function validateVault(v){
  if(!v||v.format!=='finrate-vault/1'||typeof v.datasetId!=='string'||v.datasetId.length>100||!v.datasetId||!Number.isSafeInteger(v.revision)||v.revision<0||typeof v.savedAt!=='string'||v.savedAt.length>40||!Number.isFinite(Date.parse(v.savedAt)))fail('FORMAT');
  if(!v.slots||v.slots.password?.kdf!=='PBKDF2-SHA256'||v.slots.password.iterations!==ITERATIONS||v.slots.recovery?.kdf!=='raw-AES-256')fail('FORMAT');
  decode(v.slots.password.salt,16);for(const s of [v.slots.password,v.slots.recovery]){decode(s.iv,12);decode(s.data,48);}
  decode(v.iv,12);decode(v.data,16,MAX_BYTES+16);return v;
}
export async function seal(doc,key,slots){
  validateDocument(doc);const plain=te.encode(JSON.stringify(doc));if(plain.length>MAX_BYTES)fail('SIZE');
  const v={format:'finrate-vault/1',datasetId:doc.datasetId,revision:doc.revision,savedAt:doc.updatedAt,slots,iv:base64(bytes(12))};
  v.data=base64(await crypto.subtle.encrypt({name:'AES-GCM',iv:decode(v.iv,12),additionalData:aad(header(v))},key,plain));return v;
}
export async function createVault(doc,password){
  const raw=bytes(32),recover=bytes(32);let secret=Array.from(recover,b=>b.toString(16).padStart(2,'0')).join('').match(/.{4}/g).join('-');
  const salt=bytes(16),pk=await passwordKey(password,salt,ITERATIONS),rk=await importAES(recover),key=await importAES(raw);
  const slots={password:await wrap(raw,pk,doc.datasetId,'password',{kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:base64(salt)}),recovery:await wrap(raw,rk,doc.datasetId,'recovery',{kdf:'raw-AES-256'})};
  raw.fill(0);recover.fill(0);const vault=await seal(doc,key,slots);return {vault,key,recoveryKey:secret};
}
export async function authorizeVault(v,secret,mode='password'){
  validateVault(v);if(!['password','recovery'].includes(mode))fail('FORMAT');const slot=v.slots[mode];
  let raw;
  try{
    const wrapKey=mode==='password'?await passwordKey(secret,decode(slot.salt,16),slot.iterations):await importAES(recoveryBytes(secret));
    raw=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(slot.iv,12),additionalData:slotAAD(v.datasetId,mode,slot)},wrapKey,decode(slot.data,48)));
    const key=await importAES(raw),doc=await openWithKey(v,key);return {doc,key,raw};
  }catch{raw?.fill(0);fail('DECRYPT');}
}
export async function openWithKey(v,key){
  validateVault(v);const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(v.iv,12),additionalData:aad(header(v))},key,decode(v.data,16,MAX_BYTES+16));
  const doc=JSON.parse(td.decode(plaintext));validateDocument(doc);
  if(doc.datasetId!==v.datasetId||doc.revision!==v.revision||doc.updatedAt!==v.savedAt)fail('FORMAT');return doc;
}
export async function openVault(v,secret,mode='password'){
  const result=await authorizeVault(v,secret,mode);result.raw.fill(0);return {doc:result.doc,key:result.key};
}
export async function newPasswordSlot(raw,datasetId,password){
  const salt=bytes(16),key=await passwordKey(password,salt,ITERATIONS);return wrap(raw,key,datasetId,'password',{kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:base64(salt)});
}
export function backupBlob(v){validateVault(v);return new Blob([JSON.stringify({format:'finrate-backup/1',vault:v})],{type:'application/json'});}
export async function parseBackup(file){
  if(!file||file.size>12*1024*1024||file.size<10)fail('SIZE');let x;try{x=JSON.parse(await file.text());}catch{fail('FORMAT');}
  if(x.format!=='finrate-backup/1')fail('FORMAT');validateVault(x.vault);return x.vault;
}
