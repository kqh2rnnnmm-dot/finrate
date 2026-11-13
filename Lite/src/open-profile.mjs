// Test profile with device-local automatic access. No login password or PIN.
// A separate database preserves every record of the previous protected build.
import {createStore} from './store.mjs';
import {createDocument,validateDocument,now} from './model.mjs';
import {createVault,authorizeVault,seal} from './crypto.mjs';
import {createAccess,openAccess} from './device-access.mjs';
export const OPEN_TEST_DB='finrate-lite-open-test-v1';
export function createOpenProfile({store=createStore(OPEN_TEST_DB)}={}) {
  let record,doc,key,writing=false;
  async function prepare(next) {
    const secret=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
    const result=await createVault(next,secret);
    const authorized=await authorizeVault(result.vault,secret);
    try {return {vault:result.vault,key:result.key,access:await createAccess(result.vault,authorized.raw,'none')};}
    finally {authorized.raw.fill(0);}
  }
  async function open() {
    record=await store.read();
    if(record) {const result=await openAccess(record.vault,await store.readAccess());doc=result.doc;key=result.key;}
    else {const next=createDocument(),ready=await prepare(next);record=await store.commit(ready.vault,undefined,{access:ready.access});doc=next;key=ready.key;}
    return doc;
  }
  return {
    store,open,get:()=>doc,
    async save(next) {
      if(writing)throw Error('Запись уже выполняется');writing=true;
      try {validateDocument(next);next.updatedAt=now();next.revision=Math.max(next.revision,doc.revision+1);const vault=await seal(next,key,record.vault.slots);record=await store.commit(vault,record);doc=next;return doc;}
      finally {writing=false;}
    },
    async restore(next) {
      if(writing)throw Error('Запись уже выполняется');writing=true;
      try {validateDocument(next);const ready=await prepare(next);record=await store.commit(ready.vault,record,{beforeRestore:true,access:ready.access});doc=next;key=ready.key;return doc;}
      finally {writing=false;}
    },
    async reset() {await store.reset(record);record=doc=key=null;return open();},
    async close(){await store.close();}
  };
}
