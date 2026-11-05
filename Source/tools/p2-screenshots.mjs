// Additional real-app screenshots for the receivable view and existing Home metric.
// Uses a fresh localhost origin/context and fictional encrypted data; no backup is written.
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {chromiumPath} from './browser-runtime.mjs';
import {newDocument,addAccount} from '../src/model.mjs';
import {createDebt,repayDebt} from '../src/debts.mjs';
import {createVault} from '../src/crypto.mjs';
const engine=process.env.FINRATE_P2_WEBKIT?'webkit':'chromium',files=['index.html','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png'];
const harness=(await build({stdin:{contents:"export {createStore} from './src/store.mjs';",resolveDir:process.cwd()},bundle:true,format:'esm',write:false,logLevel:'silent'})).outputFiles[0].text;
const server=createServer(async(q,r)=>{try{const f=new URL(q.url,'http://local').pathname.slice(1)||'index.html';if(f==='_test/harness.mjs'){r.setHeader('Content-Type','application/javascript');r.end(harness);return;}if(!files.includes(f))throw Error();r.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.webmanifest')?'application/manifest+json':'image/png');r.end(await readFile('dist/'+f));}catch{r.writeHead(404);r.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,shots=[];let browser;
try{await mkdir('evidence/p2/screenshots',{recursive:true});browser=await(engine==='webkit'?webkit.launch():chromium.launch({executablePath:await chromiumPath(),args:['--no-sandbox']}));
 for(const colorPalette of ['neutral','color'])for(const appearance of ['light','dark']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await context.newPage(),errors=[],password=crypto.randomUUID()+crypto.randomUUID();p.on('pageerror',e=>errors.push(e.message));await p.clock.install({time:new Date('2028-01-10T12:00:00Z')});await p.goto(base);await p.evaluate(()=>navigator.serviceWorker.ready);
  const d=newDocument();addAccount(d,{id:'fictional-bank',name:'Вымышленный банк',opening:1000000});Object.assign(d.settings,{colorPalette,appearance,homeTiles:[{metric:'debts'},{metric:'last'}]});createDebt(d,{id:'fictional-claim',direction:'owed',mode:'existing',participant:'Вымышленный заёмщик',amount:800000,date:'2028-01-01',due:null,note:'Пример: получено 3 000 ₽, осталось 5 000 ₽. Это возврат тела займа, не обычный доход.'},'2028-01-10');repayDebt(d,'fictional-claim',{id:'fictional-return',accountId:'fictional-bank',amount:300000,date:'2028-01-10'},'2028-01-10');const made=await createVault(d,password);await p.evaluate(async({base,vault})=>{const {createStore}=await import(base+'/_test/harness.mjs'),s=createStore();await s.commit(vault);await s.close();},{base,vault:made.vault});await p.reload();await p.locator('#unlock [name=secret]').fill(password);await p.locator('#unlock [type=submit]').click();await p.locator('.overview').waitFor();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.locator('.feedback-close').evaluateAll(nodes=>nodes.forEach(e=>e.click()));
  const shot=async name=>{const file=`${engine}-${colorPalette}-${appearance}-${name}.png`;await p.screenshot({path:'evidence/p2/screenshots/'+file});shots.push(file);};await shot('home');await p.locator('#more').click();await p.locator('[data-extra="Долги"]').click();await p.locator('#debt-direction').selectOption('owed');assert.match(await p.locator('[data-debt-view]').innerText(),/Частично возвращено/);await shot('owed-list');await p.locator('[data-debt-view]').click();assert.match(await p.locator('[data-debt-card]').innerText(),/Срок не указан/);await shot('owed-detail');assert.deepEqual(errors,[]);await context.close();
 }
}finally{await browser?.close();await new Promise(r=>server.close(r));}
await writeFile(`evidence/p2/${engine}-additional-screenshots.json`,JSON.stringify({engine,build:'p2-debts01',shots,actualIPhone:false,published:false},null,2)+'\n');console.log(engine+': '+shots.length+' additional real-app screenshots');
