import {createServer} from 'node:http';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {resolve} from 'node:path';import assert from 'node:assert/strict';import {chromium,webkit} from 'playwright';
import {chromiumPath} from '../tools/browser-runtime.mjs';import {newDocument,addAccount,addCategory,totals} from '../src/model.mjs';import {saveFact} from '../src/block02.mjs';import {createVault,openVault} from '../src/crypto.mjs';import {localDate} from '../src/operations.mjs';import {creditSummary} from '../src/credit.mjs';import {closeIncomeOccurrence,planning,forecast,incomeOccurrences,saveRecurringIncome} from '../src/planning.mjs';
const password='fictional B1 browser password',checks=[],errors=[];let browser,p,context;const today=localDate();
const server=createServer(async(req,res)=>{try{const f=new URL(req.url,'http://local').pathname.slice(1)||'index.html';if(f.includes('..')||f.includes('/'))throw Error();res.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.webmanifest')?'application/manifest+json':'image/png');res.end(await readFile(resolve(process.env.FINRATE_D1_BASE||'dist',f)));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const pass=s=>{checks.push(s);console.log('PASS',s);},top=()=>p.locator('dialog[open]').last();
function fixture(){const d=newDocument();addAccount(d,{id:'a',name:'Дебет',opening:10000000});addAccount(d,{id:'c',name:'Кредитка',financeType:'credit',credit:{limit:10000000,grace:{mode:'months',months:3}}});addCategory(d,{id:'food',name:'Еда'});addCategory(d,{id:'salary',name:'Зарплата',type:'income'});saveFact(d,{id:'buy',kind:'expense',date:today,accountId:'c',amount:100000,allocations:[{categoryId:'food',amount:100000}]});saveFact(d,{id:'pay',kind:'transfer',date:today,accountId:'a',toAccountId:'c',amount:100000});return d;}
const record=()=>p.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open('finrate-local-v1');q.onsuccess=()=>r(q.result);});const row=await new Promise(r=>{const q=db.transaction('vault').objectStore('vault').get('active');q.onsuccess=()=>r(q.result);});db.close();return row;});
const doc=async()=>(await openVault((await record()).vault,password)).doc;
async function unlock(){await p.locator('#unlock [name=secret]').fill(password);await p.locator('#unlock [type=submit]').click();await p.locator('.overview').waitFor();}
async function seed(value=fixture()){const {vault}=await createVault(value,password);await p.evaluate(async vault=>{const db=await new Promise(r=>{const q=indexedDB.open('finrate-local-v1');q.onsuccess=()=>r(q.result);});await new Promise((r,j)=>{const t=db.transaction('vault','readwrite');t.objectStore('vault').put({id:'active',generation:1,vault});t.oncomplete=r;t.onerror=()=>j(t.error);});db.close();},vault);await p.reload();await unlock();}


const phase=process.env.FINRATE_D1_PHASE||'after',scope=process.env.FINRATE_D1_SCOPE||'all';
const run=part=>scope==='all'||scope===part;
const note=('Абзац  один\n\n'+'длинноеслово'.repeat(18)+' <b>текст</b>\n').repeat(3).slice(0,500);
async function close(){await top().locator('.sheet-back,.sheet-close').click();}
async function home(){await p.reload();await unlock();}
async function showOperations(){await p.locator((p.viewportSize().width>760?'.sidebar':'.bottom')+' [data-page="Операции"]').click();}
try{
 browser=await chromium.launch({executablePath:await chromiumPath(),args:['--no-sandbox']});context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});p=await context.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));await p.goto(base);const sample=fixture();planning(sample).onboarding='skipped';await seed(sample);
 if(run('notes')){
  await p.locator('#operation-add').click();await top().locator('[data-new=income]').click();await top().locator('[data-field=advanced]').click();await top().locator('[data-field=note]').click();await top().locator('.field-input').fill(note);
  for(const theme of ['light','dark']){await p.emulateMedia({colorScheme:theme});await p.screenshot({path:`evidence/d1-${phase}-note-${theme}.png`});}
  if(phase!=='before'){
   const input=top().locator('.field-input'),toggle=top().locator('[data-note-expand]');await input.evaluate(e=>{e.setSelectionRange(35,35);e.scrollTop=100;});const before=await input.evaluate(e=>({text:e.value,start:e.selectionStart,scroll:e.scrollTop})),height=await input.evaluate(e=>e.clientHeight);await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.ok(await input.evaluate(e=>e.clientHeight)>height);assert.equal(await input.inputValue(),before.text);assert.equal(await input.evaluate(e=>e.selectionStart),35);await p.screenshot({path:'evidence/d1-after-note-expanded.png'});await toggle.click();assert.equal(await input.inputValue(),before.text);assert.equal(await input.evaluate(e=>e.selectionStart),35);assert.equal(await p.locator('dialog[open]').count(),1);checks.push('one bounded shared note editor, expand/collapse preserves value/caret; no extra surface');
  }
 }
 if(run('launcher')){
  await home();await p.locator('#operation-add').click();await p.waitForTimeout(100);await p.screenshot({path:`evidence/d1-${phase}-chooser-top.png`});const plus=await p.locator('#operation-add').boundingBox(),chooser=await top().boundingBox();
  if(phase!=='before'){const header=await p.locator('#app>header').boundingBox();assert.ok(chooser.y>=header.y+header.height);assert.ok(chooser.y<=header.y+header.height+24);assert.ok(Math.abs(chooser.x-(390-chooser.width)/2)<2);checks.push('top plus opens the shared outlined chooser directly below header');}await close();await p.waitForTimeout(100);
  for(const side of ['left','right']){const value=fixture();planning(value).onboarding='skipped';value.settings.edgeSide=side;await seed(value);await showOperations();await p.locator('.operation-edge').click();await p.waitForTimeout(100);await p.screenshot({path:`evidence/d1-${phase}-chooser-${side}.png`});const r=await top().boundingBox();if(phase!=='before'){assert.ok(Math.abs(r.x-(390-r.width)/2)<2);for(const b of await top().locator('[data-new]').all()){const q=await b.boundingBox();assert.ok(q.x>=r.x&&q.x+q.width<=r.x+r.width);}checks.push(side+' chooser symmetric and all three operations visible');}await close();await p.waitForTimeout(100);}
 }
 if(run('spacing')){
  await home();await p.locator('#more').click();await p.locator('[data-extra="Категории"]').click();await p.locator('[data-category-view="food"]').click();await p.screenshot({path:`evidence/d1-${phase}-category-spacing.png`});const a=await top().locator('[data-object-history]').boundingBox(),b=await top().locator('.entity-history').boundingBox();if(phase!=='before'){assert.ok(b.y-a.y-a.height>=19);checks.push('object history action and operation history have group-gap');}
 }
 if(run('home')){
  const value=fixture();planning(value).onboarding='skipped';value.settings.homeTiles=Array.from({length:6},(_,i)=>({metric:i%2?'income':'expense'}));await seed(value);await p.screenshot({path:`evidence/d1-${phase}-home-six.png`});const g=await p.locator('.home-tiles').evaluate(e=>({scroll:e.scrollHeight,client:e.clientHeight}));if(phase!=='before'){assert.ok(g.scroll<=g.client+1);assert.equal(await p.locator('.home-blocks-head').count(),0);assert.equal(await p.locator('#home-configure').count(),1);checks.push('six visible Home tiles without scroll; direct configuration and no Blocks heading');}else console.log('BASELINE six tiles',g);
 }
 assert.deepEqual(errors,[]);
}catch(e){console.error(e);process.exitCode=1;}finally{await browser?.close();server.close();await writeFile(`evidence/d1-${phase}-${scope}.json`,JSON.stringify({checks,errors,passed:!process.exitCode,actualIPhone:false},null,2));}
