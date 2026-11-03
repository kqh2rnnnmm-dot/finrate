import test from 'node:test';
import assert from 'node:assert/strict';
import {validMoneyInput} from '../src/surfaces.mjs';
import {money} from '../src/model.mjs';
test('numeric editor accepts exact cents with either separator without conversion',()=>{
 for(const [s,n]of [['0',0],['12,34',1234],['12.34',1234],['0001,05',105],['999999999999.99',99999999999999]]){assert.equal(validMoneyInput(s),true,s);assert.equal(money(s),n,s);}
});
test('numeric editor rejects letters, exponent syntax, currency and too many decimals',()=>{
 for(const s of ['1e3','12a','руб','100 ₽','1,234','3..1','1,2.3','12\n34','Infinity','NaN','0x10','+12','-12'])assert.equal(validMoneyInput(s),false,s);
});
test('signed balances permit minus but operation amounts do not',()=>{
 assert.equal(validMoneyInput('-123,45',{signed:true}),true);assert.equal(money('-123,45'),-12345);assert.equal(validMoneyInput('-123,45'),false);assert.equal(validMoneyInput('--1',{signed:true}),false);
});
test('empty and unfinished numeric edits stay editable without being valid money',()=>{
 for(const s of ['','1,','1.'])assert.equal(validMoneyInput(s),true);assert.equal(validMoneyInput('-',{signed:true}),true);assert.throws(()=>money(''));assert.throws(()=>money('1,'));
});
