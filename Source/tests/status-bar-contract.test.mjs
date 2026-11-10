import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('installed iOS app declares the same native status-bar mode as MyRate', async()=>{
 const html=await readFile(new URL('../src/index.html',import.meta.url),'utf8');
 assert.match(html,/<meta name="apple-mobile-web-app-capable" content="yes">/);
 assert.match(html,/<meta name="apple-mobile-web-app-status-bar-style" content="default">/);
 assert.match(html,/<meta name="theme-color" content="#f2f2f5">/);
 assert.doesNotMatch(html,/black-translucent/);
});
