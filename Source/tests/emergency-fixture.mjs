import {indexedDB,IDBKeyRange} from 'fake-indexeddb';import {createStore} from '../src/store.mjs';import {FinRate} from '../src/service.mjs';import {createVault} from '../src/crypto.mjs';import {copy} from '../src/model.mjs';
// Fictional isolated fixture only. Never imported by the public application.
import {newDocument,addAccount,addCategory,changed} from '../src/model.mjs';
import {saveOperation,saveDraft} from '../src/operations.mjs';
import {savePaymentPlan,confirmPayment} from '../src/scheduled-payments.mjs';
import {createDebt,repayDebt} from '../src/debts.mjs';
import {createGoal,createReserve,useReserve} from '../src/goals.mjs';
import {createLimit,saveLimitSettings} from '../src/limits.mjs';
export const day='2028-11-10';
export function richP4(){
 const d=newDocument();addAccount(d,{id:'bank',name:'Вымышленный банк для аварийного теста',opening:10000000});addAccount(d,{id:'credit',name:'Вымышленная кредитка',financeType:'credit',credit:{limit:5000000,grace:{mode:'months',months:1}}});
 addCategory(d,{id:'food',name:'Продукты'});addCategory(d,{id:'veg',name:'Овощи',parentId:'food'});addCategory(d,{id:'income',name:'Вымышленный доход',type:'income'});
 saveOperation(d,{id:'expense',kind:'expense',date:day,accountId:'bank',amount:600000,allocations:[{categoryId:'food',amount:600000}],note:'Вымышленное примечание\n'+ 'ДлинноеСлово'.repeat(20)});
 saveOperation(d,{id:'credit-buy',kind:'expense',date:day,accountId:'credit',amount:10000,allocations:[{categoryId:'veg',amount:10000}]});
 savePaymentPlan(d,{id:'plan',name:'Вымышленный платёж',amount:200000,amountMode:'variable',start:'2028-11-30',repeat:'monthly',method:'manual',accountId:'bank',categoryId:'food'},day);
 confirmPayment(d,'plan:2028-11-30',{id:'part',amount:60000,date:day,accountId:'bank',allocations:[{categoryId:'food',amount:60000}]},day,{final:false});
 createDebt(d,{id:'debt',direction:'owe',mode:'existing',participant:'Вымышленный человек',amount:100000,date:day,due:'2028-11-30'},day);repayDebt(d,'debt',{id:'repayment',amount:10000,date:day,accountId:'bank'},day);
 createGoal(d,{id:'goal',name:'Вымышленная цель',type:'purchase',target:2000000},day);createReserve(d,{id:'reserve',name:'Вымышленный резерв',accountId:'bank',goalId:'goal',amount:100000},day);
 useReserve(d,'reserve',{id:'use',operationId:'reserve-buy',amount:10000},day,{record:n=>saveOperation(n,{id:'reserve-buy',kind:'expense',date:day,accountId:'bank',amount:10000,allocations:[{categoryId:'food',amount:10000}]})});
 createLimit(d,{id:'limit',categoryId:'food',period:'2028-11',amount:1000000});saveLimitSettings(d,{earlyEnabled:true,percent:80});
 saveDraft(d,{id:'draft-operation',kind:'expense',amount:'100',accountId:'bank',categoryId:'food',subcategoryId:'',toAccountId:'',date:day,note:'Вымышленный черновик',fee:'',feeMode:'extra',split:[],inTransit:false},'draft');changed(d,'fictional.seed');return d;
}

export async function fixture(fn){const store=createStore('emergency-'+crypto.randomUUID(),{indexedDB,IDBKeyRange}),password=crypto.randomUUID()+crypto.randomUUID(),made=await createVault(richP4(),password),app=new FinRate(store);try{await store.commit(made.vault);await app.unlock(password);await app.changeSecurity({action:'entry',secret:password,entry:'pin',pin:'024680'});await store.db.safety.put({id:'fictional-safety',createdAt:new Date().toISOString(),vault:app.record.vault});const document=copy(app.document);app.lock();await fn({store,app,password,recovery:made.recoveryKey,document});}finally{await store.close();}}
