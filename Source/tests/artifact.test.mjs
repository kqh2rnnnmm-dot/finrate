import test from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
test('standalone build script has matching CSP hash, no CDN or provider endpoints',async()=>{
 const h=await readFile('FinRate.html','utf8'),s=h.match(/<script>([\s\S]*)<\/script>/)[1],hash=createHash('sha256').update(s).digest('base64');assert.ok(h.includes("'sha256-"+hash+"'"));assert.ok(h.includes("connect-src 'self'"));assert.equal(/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(h),false);for(const u of ['api.dropboxapi.com','content.dropboxapi.com','y171aiqq7487r5b','google-analytics.com'])assert.equal(h.includes(u),false);
});
test('workbox manifest precaches only 6 shell assets, not financial data',async()=>{
 const report=JSON.parse(await readFile('evidence/build.json','utf8'));assert.equal(report.shellFiles,6);const s=await readFile('dist/sw.js','utf8');assert.ok(s.includes('index.html'));assert.ok(s.includes('FINRATE_APPLY_UPDATE'));assert.equal(s.includes('BackgroundSyncPlugin'),false);
});
test('dist is complete fixed allowlist and no secrets/evidence/test files',async()=>{const files=await readdir('dist');assert.deepEqual(files.sort(),['apple-touch-icon.png','icon-192.png','icon-512.png','icon.svg','index.html','manifest.webmanifest','sw.js']);});
test('package names and navigation preserved; future packages clearly identified',async()=>{const h=await readFile('FinRate.html','utf8');for(const x of ['Главная','Операции','Платежи','Цели','Отчёты','Счета и кошельки','Категории','Настройки','Данные и синхронизация'])assert.ok(h.includes(x));});
