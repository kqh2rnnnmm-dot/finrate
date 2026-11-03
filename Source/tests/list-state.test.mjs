import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultFilters,filterCount,invalidRange,dateRange,selectOperations} from '../src/list-state.mjs';
const doc={categories:[{id:'food',name:'Еда'},{id:'cafe',name:'Кафе',parentId:'food'},{id:'old',mergedInto:'cafe'},{id:'work',name:'Работа'}],operations:[
 {id:'e1',kind:'expense',date:'2026-10-01',accountId:'a',amount:100,allocations:[{categoryId:'old',amount:60},{categoryId:null,amount:40}],note:'Кофе'},
 {id:'i1',kind:'income',date:'2026-10-16',accountId:'b',amount:200,allocations:[{categoryId:'work',amount:200}],note:'Зарплата'},
 {id:'t1',kind:'transfer',date:'2026-10-10',accountId:'a',toAccountId:'b',amount:100,allocations:[],note:''},
 {id:'e2',kind:'expense',date:'2026-10-16',accountId:'a',amount:100,allocations:[{categoryId:'food',amount:50}],note:'КОФЕ'},
 {id:'r1',kind:'refund',date:'2026-09-30',accountId:'a',amount:20,allocations:[{categoryId:'cafe',amount:20}],cancelled:true,note:'Возврат'}]};
const select=patch=>selectOperations(doc,{...defaultFilters(),...patch}).map(o=>o.id);
test('default date order includes other operation kinds and cancelled records',()=>assert.deepEqual(select(),['e2','i1','t1','e1','r1']));
test('old first reverses chronology and deterministic same-date insertion order',()=>assert.deepEqual(select({sort:'old'}),['r1','e1','t1','i1','e2']));
test('conditions are AND across groups and OR within types/accounts',()=>assert.deepEqual(select({kinds:['income','expense'],accounts:['a','b'],period:'custom',from:'2026-10-16',to:'2026-10-16',categories:['food']}),['e2']));
test('transfer is discoverable by both sender and receiver',()=>{for(const id of ['a','b'])assert.deepEqual(select({kinds:['transfer'],accounts:[id]}),['t1']);});
test('parent includes children, merged aliases and any allocation',()=>assert.deepEqual(select({categories:['food']}),['e2','e1','r1']));
test('selected merged category resolves to canonical category',()=>assert.deepEqual(select({categories:['old']}),['e1','r1']));
test('uncategorized includes explicit null, remainder and operations without allocation',()=>assert.deepEqual(select({categories:['uncategorized']}),['e2','t1','e1']));
test('refund has its own filter; is never silently classified as income',()=>{assert.deepEqual(select({kinds:['income']}),['i1']);assert.deepEqual(select({kinds:['refund']}),['r1']);});
test('custom dates are inclusive and allow either open endpoint',()=>{assert.deepEqual(select({period:'custom',from:'2026-10-16'}),['e2','i1']);assert.deepEqual(select({period:'custom',to:'2026-10-01'}),['e1','r1']);});
test('invalid range blocks results and does not normalize into a different range',()=>{const f={...defaultFilters(),period:'custom',from:'2026-10-20',to:'2026-10-01'};assert.equal(invalidRange(f),true);assert.deepEqual(selectOperations(doc,f),[]);});
test('month and last seven calendar days use real local calendar across month/year edges',()=>{assert.deepEqual(dateRange({period:'month'},new Date(2028,1,29)),['2028-02-01','2028-02-29']);assert.deepEqual(dateRange({period:'week'},new Date(2027,0,3)),['2026-12-28','2027-01-03']);});
test('query respects selected conditions and chronology without prefix reranking',()=>assert.deepEqual(selectOperations(doc,defaultFilters(),{query:'кофе',text:o=>o.note}).map(x=>x.id),['e2','e1']));
test('empty sets mean all, sort is not counted as a filtering condition',()=>{assert.equal(filterCount({...defaultFilters(),sort:'old'}),0);assert.equal(filterCount({...defaultFilters(),kinds:['expense','income'],accounts:['a'],categories:['food'],period:'month'}),4);});
test('view transformations preserve document, amounts, dates and settings byte for byte',()=>{const before=JSON.stringify(doc);for(const patch of [{sort:'old'},{categories:['old']},{period:'month'},{accounts:['b']}])select(patch);assert.equal(JSON.stringify(doc),before);});
