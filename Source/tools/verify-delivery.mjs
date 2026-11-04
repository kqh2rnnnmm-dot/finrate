import {readFile,readdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const hash=b=>createHash('sha256').update(b).digest('hex'),baseline=JSON.parse(await readFile('A3_MAIN_BASELINE_SHA256.json'));
// A3 scope: access UX/lifecycle and the current-password rule only. Crypto, local wrappers, storage and A2 are byte-protected.
const allowed=new Set(['src/service.mjs','src/app.mjs','src/security-ui.mjs','src/ui.mjs','src/style.css','src/help.mjs']);
for(const [p,h]of Object.entries(baseline.files))if(!allowed.has(p))assert.equal(hash(await readFile(p)),h,'Protected main module: '+p);
for(const p of ['model','operations','planning','credit','block02','recurring-income','device-access','crypto','store','session-policy','reset-ui','reset-policy','sw'])assert.equal(hash(await readFile('src/'+p+'.mjs')),baseline.files['src/'+p+'.mjs'],p+' unchanged from A2 main');
assert.equal(hash((await readFile('src/service.mjs','utf8')).replace(/  async changeSecurity\([\s\S]*?(?=  async mutate\()/,'CHANGE_SECURITY\n')),baseline.serviceOutsideSecuritySHA256,'service outside changeSecurity byte-identical to main');
assert.deepEqual((await readdir('src')).sort(),[...Object.keys(baseline.files).map(f=>f.slice(4)),'access-fields.mjs'].sort(),'A3 source allowlist');
for(const file of [...allowed,'src/access-fields.mjs']){const source=await readFile(file,'utf8');assert.equal(/navigator\.credentials\.(?:get|create|store)|localStorage\.setItem|sessionStorage\.setItem/.test(source),false,'No extra credential flow/storage: '+file);}
const publicFiles=['apple-touch-icon.png','icon-192.png','icon-512.png','icon.svg','index.html','manifest.webmanifest','sw.js'];assert.deepEqual((await readdir('dist')).sort(),publicFiles);
const html=await readFile('dist/index.html','utf8'),js=html.match(/<script>([\s\S]*)<\/script>/)[1];assert.ok(html.includes("'sha256-"+createHash('sha256').update(js).digest('base64')+"'"));assert.ok(html.includes("connect-src 'self'"));assert.ok(html.includes('a3-access01'));
for(const value of ['fictional B1 browser password','fictional A2 backup safety phrase','Audit fictional debit','Audit fictional plan','api.dropboxapi.com','content.dropboxapi.com','device-access-fixture','Вымышленная покупка для проверки интерфейса'])assert.equal(html.includes(value),false,value);
assert.equal(/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(html),false);
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest'));for(const k of ['id','scope','start_url'])assert.equal(manifest[k],'./');assert.ok(html.includes('ISC License'));assert.ok(html.includes('Lucide'));
const files={};for(const name of publicFiles){const data=await readFile('dist/'+name);assert.deepEqual(await readFile('../'+name),data,'Root public file matches dist: '+name);files[name]=hash(data);}
console.log(JSON.stringify({build:'a3-access01',base:baseline.main,publicAllowlist:7,files,csp:'PASS',financialCoreUnchanged:true,keyArchitectureModulesUnchanged:true,cryptoProtocolUnchanged:true,authorizedChangedModules:[...allowed,'src/access-fields.mjs'],schema:5,format:'finrate-backup/1',published:false},null,2));
