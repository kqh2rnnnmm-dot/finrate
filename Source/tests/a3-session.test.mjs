import test from 'node:test';import assert from 'node:assert/strict';import {createSessionPolicy} from '../src/session-policy.mjs';
for(const minutes of [0,5,15,30,-1])test('A3 session deadline '+minutes+' survives repeated hide/download and resumes without secrets',()=>{
 let now=100;const policy=createSessionPolicy(()=>now);assert.equal(policy.expired(minutes),false);policy.hide();policy.expectDownload();assert.equal(policy.consumeDownload(),true);assert.equal(policy.consumeDownload(),false);
 if(minutes>0){now=100+minutes*60000-1;policy.hide();assert.equal(policy.expired(minutes),false);assert.equal(policy.remaining(minutes),1);now++;assert.equal(policy.expired(minutes),true);}else{now+=60*60000;assert.equal(policy.expired(minutes),minutes===0);}
 policy.resume();assert.equal(policy.expired(minutes),false);assert.equal(JSON.stringify(policy),'{}');
});
