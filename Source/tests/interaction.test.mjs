import test from 'node:test';import assert from 'node:assert/strict';
import {PRIMARY_TABS,OPERATION_TYPES,adjacent,navigationTrail,createFormBank,swipeDirection} from '../src/interaction.mjs';
const form=kind=>({id:kind,kind,amount:'',accountId:'a',categoryId:'',note:'',split:[],fee:'',inTransit:false});
test('five shared destinations put Home exactly third; both swipe directions stop at edges',()=>{
 assert.deepEqual(PRIMARY_TABS,['Операции','Платежи','Главная','Цели','Отчёты']);
 for(let i=0;i<5;i++){assert.equal(adjacent(PRIMARY_TABS,PRIMARY_TABS[i],'left'),PRIMARY_TABS[Math.min(4,i+1)]);assert.equal(adjacent(PRIMARY_TABS,PRIMARY_TABS[i],'right'),PRIMARY_TABS[Math.max(0,i-1)]);}
});
test('every root removes previous navigation trails; one Back removes one secondary step',()=>{
 let trail=navigationTrail([],'Главная','Счета и кошельки');trail=navigationTrail(trail,'Счета и кошельки','Категории');assert.deepEqual(trail,['Главная','Счета и кошельки']);
 trail=navigationTrail(trail,'Категории','Счета и кошельки',false);assert.deepEqual(trail,['Главная']);
 for(const tab of PRIMARY_TABS)assert.deepEqual(navigationTrail(trail,'Счета и кошельки',tab),[]);
});
test('repeated root transitions never grow trail; same secondary target is idempotent',()=>{
 let trail=[];for(let i=0;i<500;i++){trail=navigationTrail(trail,'Главная','Категории');trail=navigationTrail(trail,'Категории',PRIMARY_TABS[i%5]);assert.equal(trail.length,0);}
 assert.deepEqual(navigationTrail(['Главная'],'Категории','Категории'),['Главная']);
});
test('expense/income/transfer amounts, IDs and details are independent and survive switches',()=>{
 const bank=createFormBank(form,form('expense')),expense=bank.active;Object.assign(expense,{amount:'100,50',categoryId:'groceries',note:'synthetic',split:[{categoryId:'fruit',amount:'100,50'}]});
 const income=bank.select('income');assert.equal(income.amount,'');assert.equal(income.categoryId,'');income.amount='20';income.categoryId='salary';income.accountId='b';
 const transfer=bank.select('transfer');assert.equal(transfer.amount,'');transfer.amount='3';transfer.fee='1';transfer.inTransit=true;transfer.toAccountId='b';
 for(let i=0;i<20;i++){assert.strictEqual(bank.select('expense'),expense);assert.strictEqual(bank.select('income'),income);assert.strictEqual(bank.select('transfer'),transfer);}
 assert.equal(expense.amount,'100,50');assert.deepEqual(expense.split,[{categoryId:'fruit',amount:'100,50'}]);assert.equal(income.accountId,'b');assert.equal(transfer.fee,'1');assert.equal(bank.filled().length,3);
});
test('saving active type can clear that type while retaining other unfinished types',()=>{
 const bank=createFormBank(form,form('expense'));bank.active.amount='1';bank.select('income').amount='2';bank.replace('income',form('income'));assert.equal(bank.active.amount,'');assert.equal(bank.select('expense').amount,'1');assert.equal(bank.filled().length,1);
});
test('account or date alone changed is meaningful; untouched defaults are clean',()=>{
 const bank=createFormBank(form,form('expense'));assert.equal(bank.filled().length,0);bank.active.accountId='b';assert.equal(bank.filled().length,1);bank.select('income').date='2026-10-10';assert.equal(bank.filled().length,2);
});
test('only clear horizontal gestures inside safe edges produce a direction',()=>{
 const start={x:280,y:200,time:0};assert.equal(swipeDirection(start,{x:100,y:210,time:200},{width:393,maxVertical:10}),'left');assert.equal(swipeDirection({x:100,y:200,time:0},{x:280,y:210,time:200},{width:393,maxVertical:10}),'right');
});
for(const [name,start,end,options] of [
 ['left system edge',{x:10,y:200,time:0},{x:200,y:200,time:200},{}],
 ['right system edge',{x:380,y:200,time:0},{x:100,y:200,time:200},{}],
 ['ends at edge',{x:280,y:200,time:0},{x:10,y:200,time:200},{}],
 ['vertical',{x:280,y:200,time:0},{x:240,y:390,time:200},{maxVertical:190}],
 ['short accidental motion',{x:280,y:200,time:0},{x:260,y:200,time:200},{}],
 ['diagonal',{x:280,y:200,time:0},{x:150,y:310,time:200},{maxVertical:110}],
 ['long hold',{x:280,y:200,time:0},{x:100,y:200,time:1100},{}],
 ['vertical excursion then horizontal',{x:280,y:200,time:0},{x:100,y:200,time:200},{maxVertical:100}],
 ['blocked input/dialog/keyboard',{x:280,y:200,time:0},{x:100,y:200,time:200},{blocked:true}]
])test('ignores '+name,()=>assert.equal(swipeDirection(start,end,{width:393,...options}),null));
test('operation type swipes use a separate finite list',()=>{assert.equal(adjacent(OPERATION_TYPES,'expense','left'),'income');assert.equal(adjacent(OPERATION_TYPES,'expense','right'),'expense');assert.equal(adjacent(OPERATION_TYPES,'transfer','left'),'transfer');});
