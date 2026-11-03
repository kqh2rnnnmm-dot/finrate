import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {chromiumPath} from '../tools/browser-runtime.mjs';

const report={checks:[],errors:[],failures:[],actualIPhone:false,published:false};
const server=createServer(async(req,res)=>{try{const name=new URL(req.url,'http://local').pathname.slice(1)||'index.html';if(name.includes('/')||name.includes('..'))throw Error();res.setHeader('Content-Type',name.endsWith('.html')?'text/html':'application/octet-stream');res.end(await readFile(resolve('dist',name)));}catch{res.writeHead(404);res.end();}});
await mkdir('evidence',{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:await chromiumPath(),headless:true,args:['--no-sandbox']});
 for(const side of ['right','left']){
  const c=await browser.newContext({viewport:{width:402,height:874},isMobile:true,hasTouch:true,reducedMotion:'no-preference'}),p=await c.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto('http://127.0.0.1:'+server.address().port+'/');await p.locator('#setup [name=password]').fill('fictional edge lifecycle phrase');await p.locator('#setup [name=repeat]').fill('fictional edge lifecycle phrase');await p.locator('#setup [type=submit]').click();await p.locator('#key-saved').check();await p.locator('#ready').click();if(await p.locator('#income-onboarding-skip').isVisible()){await p.locator('#income-onboarding-skip').click();await p.locator('#income-onboarding-skip').waitFor({state:'detached'});await p.mouse.move(1,1);}
  // An interrupted entrance must settle; a stale banner must never cover Back.
  await p.locator('.feedback-notice:visible').waitFor();await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));document.getAnimations().forEach(a=>a.cancel());Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await p.locator('.feedback-notice').waitFor({state:'detached',timeout:7000});report.checks.push(side+' notification animation interrupted by app switch recovers and dismisses');
  if(side==='left'){
   await p.locator('#more').click();await p.locator('[data-extra="Настройки"]').click();await p.locator('[name=edgeSide]').selectOption('left');await p.locator('#p2-settings [type=submit]').click();await p.locator('.feedback-notice:visible .feedback-close').click();await p.locator('#page-back').click();await p.locator('#page-back').click();
  }
  await p.locator('.bottom [data-page="Операции"]').click();const handle=p.locator('.operation-edge');await handle.waitFor({state:'visible'});
  const dimensions=await handle.boundingBox();assert.equal(Math.round(dimensions.width),18);assert.equal(Math.round(dimensions.height),84);
  await handle.click();const chooser=p.locator('dialog.side-chooser[open]');await chooser.waitFor();await p.waitForFunction(()=>{const el=document.querySelector('dialog.side-chooser');return el&&Math.abs(parseFloat(el.style.getPropertyValue('--edge-shift')))<1;});
  if(side==='right')await p.screenshot({path:resolve('evidence/edge-chooser-right.png')});
  assert.equal(await handle.isVisible(),false);assert.equal(await chooser.locator('[data-new]').count(),3);
  const colors=await chooser.evaluate(el=>({border:getComputedStyle(el).backgroundColor,fill:getComputedStyle(el,'::before').backgroundColor}));assert.notEqual(colors.border,colors.fill);assert.equal(colors.fill,'rgb(255, 255, 255)');
  const box=await chooser.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+30);await p.mouse.down();await p.mouse.move(box.x+box.width/2+(side==='left'?-220:220),box.y+30,{steps:6});await p.mouse.up();await chooser.waitFor({state:'detached'});await handle.waitFor({state:'visible'});report.checks.push(side+' 18×84 tab morphs into opaque chooser and reverse swipe restores it');
  await handle.click();await chooser.waitFor();await p.waitForFunction(()=>Math.abs(parseFloat(document.querySelector('dialog.side-chooser')?.style.getPropertyValue('--edge-shift')))<1);const quickBox=await chooser.boundingBox();await p.mouse.move(quickBox.x+quickBox.width/2,quickBox.y+30);await p.mouse.down();await p.mouse.move(quickBox.x+quickBox.width/2+(side==='left'?-75:75),quickBox.y+30,{steps:2});await p.mouse.up();await chooser.waitFor({state:'detached'});await handle.waitFor({state:'visible'});report.checks.push(side+' short quick outward swipe collapses chooser');
  await handle.click();await chooser.waitFor();await p.evaluate(()=>{const el=document.querySelector('dialog.side-chooser');el.close();Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await chooser.waitFor({state:'visible'});assert.equal(await chooser.getAttribute('open'),'');
  await p.evaluate(()=>history.back());await chooser.waitFor({state:'detached'});await handle.waitFor({state:'visible'});report.checks.push(side+' interrupted native dialog restored; system Back closes chooser');
  await handle.click();await chooser.locator('[data-new=expense]').click();await p.locator('dialog[open] .focus-form').waitFor();await p.locator('dialog[open] .sheet-back').click();if(await p.locator('[data-choice=discard]').count())await p.locator('[data-choice=discard]').click();await handle.waitFor({state:'visible'});report.checks.push(side+' operation editor and Back remain responsive');
  if(side==='right'){
   await p.locator('#more').click();await p.locator('[data-extra="Настройки"]').click();await p.locator('#open-security').click();await p.locator('[data-security=help]').click();const sheet=p.locator('dialog[open]').last();await sheet.waitFor();await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await sheet.locator('.sheet-close').click();assert.equal(await p.locator('#app').getAttribute('data-page'),'Пароль и вход');await p.locator('#page-back').click();assert.equal(await p.locator('#app').getAttribute('data-page'),'Настройки');report.checks.push('background/foreground with a settings sheet preserves Back and navigation');
  }
  assert.deepEqual(report.errors,[]);await c.close();
 }
}catch(e){report.failures.push(e.stack);process.exitCode=1;}finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile('evidence/edge-lifecycle-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
