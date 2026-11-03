// Complete this pinned D1 run after correcting the accessibility test's settings snapshot.
import {readFile,writeFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const previous=JSON.parse(await readFile('evidence/release-run.json','utf8'));
assert.equal(previous.build,'d1-ui01');
const hash=createHash('sha256').update(await readFile('dist/index.html')).digest('hex');
assert.equal(hash,previous.publicHTMLSHA256,'Never reuse checks for a changed application');
assert.equal(previous.results.length,35,'All build/unit and browser stages must have completed');
assert.deepEqual(previous.results.filter(r=>r.code!==0).map(r=>r.name),['d1-interaction-browser']);
const retry=JSON.parse(await readFile('evidence/d1-interaction-all-chromium.json','utf8'));
assert.equal(retry.passed,true);assert.deepEqual(retry.errors,[]);assert.equal(retry.checks.length,3);
await writeFile('evidence/d1-before-resume-release-run.json',JSON.stringify(previous,null,2)+'\n');
const results=previous.results.filter(r=>r.code===0);
results.push({name:'d1-interaction-browser',code:0,retestedAfterSettingsSnapshotHarnessCorrection:true,checks:retry.checks});
for(const [name,file,env]of [['patch-list-performance','tests/list-browser.mjs',{FINRATE_TEST_WIDTHS:'402',FINRATE_PERF:'1'}],['verify-delivery','tools/verify-delivery.mjs',{}]]){
 const log=createWriteStream('evidence/'+name+'.log'),start=Date.now();
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file],{env:{...process.env,...env},stdio:['ignore','pipe','pipe']});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});const timer=setTimeout(()=>child.kill('SIGKILL'),300000);child.on('error',reject);child.on('close',n=>{clearTimeout(timer);resolve(n);});});
 await new Promise(resolve=>log.end(resolve));assert.equal(code,0,name+' failed');results.push({name,code,milliseconds:Date.now()-start});console.log('PASS',name);
}
assert.equal(results.length,37,'All Chromium and WebKit release stages must be present');
await writeFile('evidence/delivery-verification.json',await readFile('evidence/verify-delivery.log'));
await writeFile('evidence/release-run.json',JSON.stringify({build:'d1-ui01',publicHTMLSHA256:hash,allPassed:true,execution:'check:release with WebKit plus D1 accessibility settings-snapshot harness correction retry and hash-pinned resume',results,actualIPhone:false,published:false},null,2)+'\n');
console.log('PASS 37/37 stages on the identical D1 application');
