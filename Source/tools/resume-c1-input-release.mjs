// Continue the unchanged build after correcting the hidden-root text assertion.
import {readFile,writeFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const previous=JSON.parse(await readFile('evidence/release-run.json','utf8'));
assert.equal(previous.build,'c1-input02');
const hash=createHash('sha256').update(await readFile('dist/index.html')).digest('hex');
assert.equal(hash,previous.publicHTMLSHA256,'Never reuse checks for a changed application');
assert.deepEqual(previous.results.filter(r=>r.code!==0).map(r=>r.name),['b1-period-sync-browser']);
const retry=JSON.parse(await readFile('evidence/b1-period-sync-browser.json','utf8'));
assert.equal(retry.passed,true);assert.deepEqual(retry.errors,[]);assert.ok(retry.checks.length>=8);
await writeFile('evidence/c1fix-before-resume-release-run.json',JSON.stringify(previous,null,2)+'\n');
const results=previous.results.filter(r=>r.code===0);
results.push({name:'b1-period-sync-browser',code:0,retestedAfterHiddenRootHarnessCorrection:true,checks:retry.checks.length});
for(const [name,file,env]of [['patch-list-performance','tests/list-browser.mjs',{FINRATE_TEST_WIDTHS:'402',FINRATE_PERF:'1'}],['verify-delivery','tools/verify-delivery.mjs',{}]]){
 const log=createWriteStream('evidence/'+name+'.log'),start=Date.now();
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file],{env:{...process.env,...env},stdio:['ignore','pipe','pipe']});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});const timer=setTimeout(()=>child.kill('SIGKILL'),300000);child.on('error',reject);child.on('close',n=>{clearTimeout(timer);resolve(n);});});
 await new Promise(resolve=>log.end(resolve));assert.equal(code,0,name+' failed');results.push({name,code,milliseconds:Date.now()-start});console.log('PASS',name);
}
assert.equal(results.length,33,'All Chromium and WebKit release stages must be present');
await writeFile('evidence/delivery-verification.json',await readFile('evidence/verify-delivery.log'));
await writeFile('evidence/release-run.json',JSON.stringify({build:'c1-input02',publicHTMLSHA256:hash,allPassed:true,execution:'check:release with WebKit plus period hidden-root harness correction retry and resume',results,actualIPhone:false,published:false},null,2)+'\n');
console.log('PASS 33/33 stages on the identical corrective application');
