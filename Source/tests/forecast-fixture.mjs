// Fictional projection fixtures only, never imported by the public app.
import {newDocument,addAccount,addCategory} from '../src/model.mjs';
import {savePaymentPlan} from '../src/scheduled-payments.mjs';
import {saveIncome} from '../src/planning.mjs';
export const TODAY='2028-11-10';
export function projectionDoc(a=3000000,b=0){const d=newDocument();addAccount(d,{id:'a',name:'Вымышленный счёт А',opening:a});addAccount(d,{id:'b',name:'Вымышленный счёт Б',opening:b});addCategory(d,{id:'food',name:'Вымышленная категория'});addCategory(d,{id:'salary',name:'Вымышленная зарплата',type:'income'});return d;}
export function bill(d,{id='bill',amount=1000000,date='2028-11-12',accountId='a',amountMode='fixed',repeat='once',method='manual'}={}){return savePaymentPlan(d,{id,name:'Вымышленный платёж '+id,amount,amountMode,start:date,repeat,method,accountId,categoryId:'food'},TODAY);}
export function income(d,{id='salary-plan',amount=2000000,date='2028-11-20',accountId='a',repeat='once'}={}){return saveIncome(d,{id,name:'Вымышленное поступление '+id,amount,start:date,repeat,accountId,categoryId:'salary'});}
