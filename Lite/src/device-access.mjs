// Local-only credentials. Never include this row or CryptoKey in backupBlob.
import {ITERATIONS,base64,openWithKey} from './crypto.mjs';
import {fail,uid} from './model.mjs';
const te=new TextEncoder(),bytes=n=>crypto.getRandomValues(new Uint8Array(n)),decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const serial=a=>te.encode(JSON.stringify([a.format,a.accessId,a.datasetId,a.tag,a.mode,a.length,a.salt,a.iterations,a.pinIV]));
const pinAAD=a=>te.encode(JSON.stringify([a.format,a.accessId,a.datasetId,a.mode,a.length]));
const aes=raw=>crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
async function derive(pin,a){const material=await crypto.subtle.importKey('raw',te.encode(pin),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:decode(a.salt),iterations:ITERATIONS},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function credentialTag(v){return base64(await crypto.subtle.digest('SHA-256',te.encode(JSON.stringify([v.datasetId,v.slots.password,v.slots.recovery]))));}
export async function validAccess(v,a){try{return !!a&&a.id==='device-access'&&a.format==='finrate-device-access/1'&&a.datasetId===v.datasetId&&a.tag===await credentialTag(v)&&typeof a.accessId==='string'&&a.accessId.length<=100&&['pin','none'].includes(a.mode)&&a.deviceKey?.extractable===false&&a.deviceKey?.algorithm?.name==='AES-GCM'&&a.deviceKey.algorithm.length===256&&a.deviceKey.type==='secret'&&Number.isInteger(a.failed)&&a.failed>=0&&a.failed<=5&&typeof a.data==='string'&&a.data.length<200&&decode(a.data).length===(a.mode==='pin'?64:48)&&decode(a.iv).length===12&&(a.mode==='none'||[4,6].includes(a.length)&&a.iterations===ITERATIONS&&decode(a.salt).length===16&&decode(a.pinIV).length===12);}catch{return false;}}
export async function createAccess(v,raw,mode,pin){
 if(!['pin','none'].includes(mode))fail('FORMAT');if(mode==='pin'&&!/^(?:[0-9]{4}|[0-9]{6})$/.test(pin))fail('PIN');
 const a={id:'device-access',format:'finrate-device-access/1',accessId:uid(),datasetId:v.datasetId,tag:await credentialTag(v),mode,length:mode==='pin'?pin.length:null,salt:mode==='pin'?base64(bytes(16)):null,iterations:mode==='pin'?ITERATIONS:null,pinIV:mode==='pin'?base64(bytes(12)):null,failed:0,deviceKey:await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']),iv:base64(bytes(12))};
 let payload=raw;
 try{if(mode==='pin')payload=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:decode(a.pinIV),additionalData:pinAAD(a)},await derive(pin,a),raw));a.data=base64(await crypto.subtle.encrypt({name:'AES-GCM',iv:decode(a.iv),additionalData:serial(a)},a.deviceKey,payload));return a;}finally{if(payload!==raw)payload.fill(0);}
}
export async function openAccess(v,a,pin){
 if(!await validAccess(v,a))fail('ACCESS_LOST');if(a.mode==='pin'&&a.failed>=5)fail('PIN_LOCKED');let payload,raw;
 try{payload=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(a.iv),additionalData:serial(a)},a.deviceKey,decode(a.data)));
  if(a.mode==='pin'){if(typeof pin!=='string'||!new RegExp('^[0-9]{'+a.length+'}$').test(pin))fail('PIN');raw=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(a.pinIV),additionalData:pinAAD(a)},await derive(pin,a),payload));}else raw=payload;
  const key=await aes(raw),doc=await openWithKey(v,key);return {key,doc};
 }catch(e){if(e.code==='PIN')throw e;fail(a.mode==='pin'?'PIN_WRONG':'ACCESS_LOST');}finally{raw?.fill(0);payload?.fill(0);}
}
export async function rebindAccess(a,v){
 const payload=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(a.iv),additionalData:serial(a)},a.deviceKey,decode(a.data)));
 try{const next={...a,tag:await credentialTag(v),iv:base64(bytes(12))};next.data=base64(await crypto.subtle.encrypt({name:'AES-GCM',iv:decode(next.iv),additionalData:serial(next)},next.deviceKey,payload));return next;}finally{payload.fill(0);}
}
