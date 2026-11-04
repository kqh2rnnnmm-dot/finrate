// Complete the exact final A3 artifact after the legacy forms driver measured
// Home before its existing ResizeObserver/rAF adaptation. Assertions unchanged.
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const previous=JSON.parse(await readFile('evidence/release-run.json'));
const hash=()=>readFile('dist/index.html').then(data=>createHash('sha256').update(data).digest('hex'));
assert.equal(previous.build,'a3-access01');assert.equal(await hash(),previous.publicHTMLSHA256);
assert.equal(previous.results.length,47);assert.deepEqual(previous.results.filter(r=>r.code!==0).map(r=>r.name),['patch-forms']);
await mkdir('evidence/a3/release-logs',{recursive:true});
await writeFile('evidence/a3/release-before-forms-retry.json',JSON.stringify(previous,null,2)+'\n');
await copyFile('evidence/patch-forms.log','evidence/a3/forms-resize-first-failed.log');
const results=previous.results.filter(row=>row.code===0);
async function run(name,file,env={}){
 const log=createWriteStream('evidence/'+name+'.log'),start=Date.now();
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file],{stdio:['ignore','pipe','pipe'],env:{...process.env,...env}});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});const timer=setTimeout(()=>child.kill('SIGKILL'),300000);child.on('error',reject);child.on('close',n=>{clearTimeout(timer);resolve(n);});});
 await new Promise(resolve=>log.end(resolve));assert.equal(code,0,name+' failed');console.log('PASS',name);return {name,code,milliseconds:Date.now()-start};
}
// Recompile first: source changes must never reuse tests for an older bundle.
await run('a3-rebuild-confirmation','tools/build.mjs');assert.equal(await hash(),previous.publicHTMLSHA256,'Application changed: full check:release required');
results.push(await run('patch-forms','tests/forms-unified-browser.mjs'));
results.push(await run('patch-list-performance','tests/list-browser.mjs',{FINRATE_TEST_WIDTHS:'402',FINRATE_PERF:'1'}));
results.push(await run('verify-delivery','tools/verify-delivery.mjs'));
for(const engine of ['chromium','webkit']){const report=JSON.parse(await readFile(`evidence/a3/${engine}-after.json`));assert.equal(report.publicHTMLSHA256,previous.publicHTMLSHA256);assert.equal(report.allPassed,true);assert.deepEqual(report.failures,[]);assert.equal(report.checks.length,27);assert.equal(report.layoutChecks,56);assert.equal(report.offlineServiceWorker,true);}
assert.equal(results.length,49);
for(const row of results)await copyFile('evidence/'+row.name+'.log','evidence/a3/release-logs/'+row.name+'.log');
await copyFile('evidence/patch-unit.log','evidence/a3/unit-final.tap');await copyFile('evidence/verify-delivery.log','evidence/a3/delivery.json');
const report={build:'a3-access01',publicHTMLSHA256:previous.publicHTMLSHA256,allPassed:true,execution:'Fresh check:release on final A3 bytes, with SHA-pinned targeted completion after two-frame resize settlement was added to legacy forms driver; stricter A3 focus/screenshot checks also rerun in both engines',results,actualIPhone:false,published:false};
await writeFile('evidence/release-run.json',JSON.stringify(report,null,2)+'\n');await writeFile('evidence/a3/release-run.json',JSON.stringify(report,null,2)+'\n');console.log('PASS 49/49 stages on unchanged final A3 bytes');
