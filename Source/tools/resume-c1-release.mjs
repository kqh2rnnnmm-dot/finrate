// Resume the exact compiled C1 after correcting only the two legacy harness contracts.
import {readFile,writeFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const previous=JSON.parse(await readFile('evidence/release-run.json','utf8'));
assert.equal(previous.build,'c1-ui01');
const hash=createHash('sha256').update(await readFile('dist/index.html')).digest('hex');
assert.equal(hash,previous.publicHTMLSHA256,'Cannot reuse checks for a different compiled application');
await writeFile('evidence/c1-before-resume-release-run.json',JSON.stringify(previous,null,2)+'\n');
const results=previous.results.filter(r=>r.code===0);
for(const [name,file]of [['unified-browser','unified-browser.json'],['patch-upgrade','navigation-upgrade-browser.json']]){
 const report=JSON.parse(await readFile('evidence/'+file,'utf8'));
 assert.equal(report.failures.length,0,name+' failures');assert.equal((report.errors||[]).length,0,name+' runtime errors');assert.ok(report.checks.length>0);
 if(name==='patch-upgrade')assert.equal(report.checks.length,15,'All previous versions must be tested');
 if(!results.some(r=>r.name===name))results.push({name,code:0,retestedAfterHarnessCorrection:true,checks:report.checks.length});
}
for(const [name,file,env]of [['patch-list-performance','tests/list-browser.mjs',{FINRATE_TEST_WIDTHS:'402',FINRATE_PERF:'1'}],['verify-delivery','tools/verify-delivery.mjs',{}]]){
 const log=createWriteStream('evidence/'+name+'.log'),start=Date.now();
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file],{env:{...process.env,...env},stdio:['ignore','pipe','pipe']});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});const timer=setTimeout(()=>child.kill('SIGKILL'),300000);child.on('error',reject);child.on('close',n=>{clearTimeout(timer);resolve(n);});});
 await new Promise(resolve=>log.end(resolve));assert.equal(code,0,name+' failed');results.push({name,code,milliseconds:Date.now()-start});console.log('PASS',name);
}
assert.equal(results.length,31,'Full C1 release stage count');
await writeFile('evidence/delivery-verification.json',await readFile('evidence/verify-delivery.log'));
await writeFile('evidence/release-run.json',JSON.stringify({build:'c1-ui01',publicHTMLSHA256:hash,allPassed:true,execution:'check:release plus corrected legacy-harness reruns and resume-c1-release',results,actualIPhone:false,published:false},null,2)+'\n');
console.log('PASS C1 release: 31/31 stages on identical compiled application');
