import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const hash=b=>createHash('sha256').update(b).digest('hex');
const c1=new Set(['src/chrome.mjs','src/surfaces.mjs','src/planning-ui.mjs','src/field-editor.mjs','src/navigation.mjs','src/style.css','src/focus.mjs','src/ui.mjs','src/management.mjs','src/activity-ui.mjs','src/help.mjs','src/app.mjs']);
const baseline=JSON.parse(await readFile('R30_BASELINE_SHA256.json','utf8'));
const scope=new Set(['src/context-menu.mjs','src/icons.mjs','src/style.css','src/app.mjs','src/block02.mjs','src/credit-ui.mjs','src/credit.mjs','src/focus.mjs','src/management.mjs','src/model.mjs','src/operations.mjs','src/dashboard.mjs','src/ui.mjs','src/service.mjs','src/activity.mjs','src/activity-ui.mjs','src/help.mjs']);
for(const [file,digest]of Object.entries(baseline))if(!scope.has(file)&&!c1.has(file))assert.equal(hash(await readFile(file)),digest,'R30 protected: '+file);
for(const file of ['src/crypto.mjs','src/store.mjs','src/device-access.mjs','src/session-policy.mjs','src/security-ui.mjs','src/reset-ui.mjs','src/sw.mjs','src/edge-launcher.mjs'])assert.equal(hash(await readFile(file)),baseline[file],file);
assert.deepEqual((await readdir('dist')).sort(),['apple-touch-icon.png','icon-192.png','icon-512.png','icon.svg','index.html','manifest.webmanifest','sw.js']);
const html=await readFile('dist/index.html','utf8'),js=html.match(/<script>([\s\S]*)<\/script>/)[1];
assert.ok(html.includes("'sha256-"+createHash('sha256').update(js).digest('base64')+"'"));assert.ok(html.includes("connect-src 'self'"));
for(const value of ['fictional B1 browser password','fictional B1 integration password','Проверочная зарплата','api.dropboxapi.com','content.dropboxapi.com','y171aiqq7487r5b','fictional unified test password','fictional ui audit password','fictional browser password','fictional management password','fictional history browser password','fictional compact scroll password','fictional activity password','fictional visual password','fictional security old phrase','fictional security new phrase','fictional security browser old phrase','fictional security browser new phrase','fictional entry layout password','fictional combined reset password','fictional notification motion phrase','fictional reset authentication phrase','Синтетическая заметка','Вымышленная покупка для проверки интерфейса'])assert.equal(html.includes(value),false,value);
assert.equal(/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(html),false);
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));for(const k of ['id','scope','start_url'])assert.equal(manifest[k],'./');
assert.ok(html.includes('ISC License'));assert.ok(html.includes('Lucide'));

const b1=JSON.parse(await readFile('B1_BASELINE_SHA256.json','utf8')),changed=new Set(['src/planning.mjs','src/planning-ui.mjs','src/operations.mjs','src/activity.mjs','src/help.mjs','src/app.mjs','src/focus.mjs','src/ui.mjs','src/activity-ui.mjs','src/style.css','src/context-menu.mjs','src/icons.mjs','src/recurring-income.mjs']);
for(const [file,digest]of Object.entries(b1))if(!changed.has(file)&&!c1.has(file))assert.equal(hash(await readFile(file)),digest,'B1 protected: '+file);

const b11=JSON.parse(await readFile('B11_BASELINE_SHA256.json','utf8')),allowed=new Set(['src/planning.mjs','src/planning-ui.mjs','src/focus.mjs','src/ui.mjs','src/activity.mjs','src/activity-ui.mjs','src/style.css','src/help.mjs','src/app.mjs','src/context-menu.mjs','src/icons.mjs','src/recurring-income.mjs']);
for(const [file,digest]of Object.entries(b11))if(!allowed.has(file)&&!c1.has(file))assert.equal(hash(await readFile(file)),digest,'B1.1 protected: '+file);

const b12=JSON.parse(await readFile('B12_BASELINE_SHA256.json','utf8'));
for(const [file,digest]of Object.entries(b12))if(!c1.has(file)&&!['src/style.css','src/app.mjs'].includes(file))assert.equal(hash(await readFile(file)),digest,'B1.2 protected: '+file);
assert.equal(hash((await readFile('src/app.mjs','utf8')).replace('c1-input02','b1.2-plans01')),b12['src/app.mjs'],'app metadata only');

const c1base=JSON.parse(await readFile('C1_BASELINE_SHA256.json','utf8'));
for(const [file,digest] of Object.entries(c1base))if(!c1.has(file))assert.equal(hash(await readFile(file)),digest,'C1 protected: '+file);
console.log(JSON.stringify({build:'c1-input02',securityCoreUnchanged:true,financialCoreUnchanged:true,publicAllowlist:7,csp:'PASS',published:false,c1Allowed:[...c1],protectedModulesByteIdentical:true}));

const correctiveBaseline=JSON.parse(await readFile('C1_CORRECTION_BASELINE_SHA256.json','utf8'));
assert.equal(Object.keys(correctiveBaseline).length,52,'complete corrective baseline');
const correction=new Set(['src/style.css','src/surfaces.mjs','src/chrome.mjs','src/app.mjs','src/help.mjs']);
for(const [file,digest]of Object.entries(correctiveBaseline))if(!correction.has(file))assert.equal(hash(await readFile(file)),digest,'C1 correction protected: '+file);
assert.equal(hash((await readFile('src/app.mjs','utf8')).replace('c1-input02','c1-ui01')),correctiveBaseline['src/app.mjs'],'correction app metadata only');
console.log(JSON.stringify({correctiveMain:'4d3eccf',protectedUnchanged:52-correction.size,correctionAllowed:[...correction]}));
