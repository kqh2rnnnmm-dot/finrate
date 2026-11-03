import test from 'node:test';
import assert from 'node:assert/strict';
import {formatMoney,compactText,editMoney} from '../src/ui-values.mjs';
import {validMoneyInput} from '../src/surfaces.mjs';
test('display keeps exact minor units and omits decimals only for whole values',()=>{for(const currency of ['RUB','USD','EUR','GBP']){assert.ok(!formatMoney(12300,currency).includes(',00'));assert.ok(formatMoney(12305,currency).includes(',05'));assert.ok(formatMoney(99999999999999,currency).includes(',99'));}assert.ok(formatMoney(-12305).includes('-'));});
test('preview never mutates raw multiline source',()=>{const raw='  Первый  абзац\n\n  Второй\n ';assert.equal(compactText(raw),'Первый абзац Второй');assert.equal(raw,'  Первый  абзац\n\n  Второй\n ');});
test('input caps twelve integer digits without altering existing financial parser',()=>{assert.equal(validMoneyInput('999999999999,99'),true);assert.equal(validMoneyInput('9999999999999'),false);assert.equal(validMoneyInput('-999999999999,99',{signed:true}),true);for(const value of ['1e3','1 000','+4','1,234','-1','буква'])assert.equal(validMoneyInput(value),false,value);});
test('opening editor does not create placeholder zeroes or lose a real fraction',()=>{assert.equal(editMoney(''),'');assert.equal(editMoney('12.00'),'12');assert.equal(editMoney('12,05'),'12,05');});

test('large aggregate totals do not lose cents in binary division',()=>{assert.ok(formatMoney(Number.MAX_SAFE_INTEGER).includes(',91'));assert.ok(formatMoney(-1).includes('-0,01'));});
