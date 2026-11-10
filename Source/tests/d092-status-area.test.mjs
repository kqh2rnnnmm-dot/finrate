import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const style=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const head=readFileSync(new URL('../src/index.html',import.meta.url),'utf8');

test('D-092: keep viewport-fit=cover and do not force deprecated translucent iOS status bar',()=>{
  assert.match(head, /viewport-fit=cover/);
  assert.doesNotMatch(head, /apple-mobile-web-app-status-bar-style[^>]*black-translucent/i);
});

test('D-092: mobile app paints the ordinary canvas without a separate top-area overlay',()=>{
  // The iOS status bar itself is native. This guards the authored CSS, not its device behavior.
  const fix=style.split('/* D-092: MyRate-style unified status area')[1]||'';
  assert.match(fix, /@media\s*\(max-width:\s*760px\)/);
  assert.match(fix, /#app\s*\{\s*background:\s*var\(--canvas\)\s*;/);
  assert.match(fix, /#app::before\s*,\s*\.sheet\.large::before\s*\{\s*content:\s*none\s*;/);
});
