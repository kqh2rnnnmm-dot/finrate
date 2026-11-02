import {balances,postings,addSafe,fail} from './model.mjs';

export const isCredit=account=>account?.financeType==='credit';
export const isExternal=op=>op?.kind==='transfer'&&op.transferTarget==='external';
export const isExpense=op=>op.kind==='expense'||isExternal(op);
export function spendingRoom(d,id){const a=d.accounts.find(x=>x.id===id);return Math.max(0,addSafe(balances(d)[id]||0,isCredit(a)?a.credit.limit:0));}
// Existing negative records are retained. Only a new decrease below the floor is blocked.
export function assertSpending(before,after){const b=balances(before),n=balances(after);for(const a of after.accounts){const floor=isCredit(a)?-a.credit.limit:0;if(n[a.id]<(b[a.id]??a.opening)&&n[a.id]<floor)fail(isCredit(a)?'CREDIT_LIMIT':'INSUFFICIENT_FUNDS');}}
export function dueForMonth(date,months){const [y,m]=date.split('-').map(Number);return new Date(Date.UTC(y,m+months,0)).toISOString().slice(0,10);}
export function dueAfterDays(date,days){const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
export function creditLedger(d){
 const states=new Map(d.accounts.filter(isCredit).map(a=>[a.id,{account:a,balance:a.opening,lots:a.opening<0?(a.credit.openingLots?.map(l=>({operationId:null,amount:l.amount,due:l.due,date:l.month||null,month:l.month||null}))||[{operationId:null,amount:-a.opening,due:null,date:null}]):[],operations:new Map(),payments:0}]));
 const events=[];d.operations.forEach((o,index)=>postings(o).forEach(([id,amount])=>{if(states.has(id))events.push({o,id,amount,index,date:o.kind==='transfer'&&id===o.toAccountId?o.creditDate||o.date:o.debitDate||o.date});}));
 events.sort((a,b)=>a.date.localeCompare(b.date)||(a.o.sequence??a.index)-(b.o.sequence??b.index));
 for(const {o,id,amount,date}of events){const s=states.get(id),info=s.operations.get(o.id)||{borrowed:0,repaid:0};
  if(amount<0){const borrowed=Math.max(0,-amount-Math.max(0,s.balance));if(borrowed){const grace=s.account.credit.grace,eligible=o.kind==='expense'&&!o.referenceId,byMonth=eligible&&grace.mode==='months';s.lots.push({operationId:o.id,amount:borrowed,date,month:byMonth?date.slice(0,7):null,due:o.creditDueDate||(!eligible?null:byMonth?dueForMonth(date,grace.months):grace.mode==='days'?dueAfterDays(date,grace.days):null)});info.borrowed=addSafe(info.borrowed,borrowed);}}
  else{let rest=Math.min(amount,Math.max(0,-s.balance));info.repaid=rest;
   // A purchase refund first reduces that purchase's debt; it is never a new income.
   const lots=[...s.lots].sort((a,b)=>(o.kind==='refund'?Number(b.operationId===o.referenceId)-Number(a.operationId===o.referenceId):0)||(a.due||'0000').localeCompare(b.due||'0000')||(a.date||'').localeCompare(b.date||''));
   for(const lot of lots){const paid=Math.min(rest,lot.amount);lot.amount-=paid;rest-=paid;if(!rest)break;}
   if(o.kind!=='refund'&&o.kind!=='adjustment')s.payments=addSafe(s.payments,amount);
  }
  s.balance=addSafe(s.balance,amount);s.operations.set(o.id,info);
 }
 return states;
}
export function creditSummary(d,id,today,ledger=creditLedger(d)){
 const s=ledger.get(id);if(!s)return null;const debt=Math.max(0,-s.balance),own=Math.max(0,s.balance),month=today.slice(0,7),end=dueForMonth(today,0);
 const lots=s.lots.filter(l=>l.amount>0),unknown=lots.filter(l=>!l.due).reduce((n,l)=>addSafe(n,l.amount),0),due=lots.filter(l=>l.due&&l.due<=end).reduce((n,l)=>addSafe(n,l.amount),0),overdue=lots.filter(l=>l.due&&l.due<today).reduce((n,l)=>addSafe(n,l.amount),0);
 const statement=s.account.credit.statement,paymentDelta=statement?s.payments-statement.paymentsAtSet:0,statementRemaining=statement?Math.max(0,statement.amount-paymentDelta):null;
 const statementCurrent=statement&&statement.dueDate.slice(0,7)===month;
 const required=statementCurrent?Math.min(debt,statementRemaining):unknown?null:due,nextDueDate=lots.filter(l=>l.due).map(l=>l.due).sort()[0]||null,nextDue=nextDueDate?lots.filter(l=>l.due===nextDueDate).reduce((sum,l)=>addSafe(sum,l.amount),0):0;
 return {debt,own,nextDueDate,nextDue,limit:s.account.credit.limit,available:Math.max(0,s.account.credit.limit-debt),due:required,calculatedDue:due,overdue,unknown,lots,statementCurrent:!!statementCurrent,dueDate:statementCurrent?statement.dueDate:end,minimumVerified:!!statementCurrent};
}
export function operationCredit(d,id,ledger=creditLedger(d)){let borrowed=0,repaid=0;for(const s of ledger.values()){const x=s.operations.get(id);if(x){borrowed=addSafe(borrowed,x.borrowed);repaid=addSafe(repaid,x.repaid);}}return {borrowed,repaid};}
export function setStatement(d,id,{dueDate,amount}){const a=d.accounts.find(a=>a.id===id);if(!isCredit(a)||!Number.isSafeInteger(amount)||amount<0)fail('CREDIT_SETTINGS');a.credit.statement={dueDate,amount,paymentsAtSet:creditLedger(d).get(id).payments};}
export function setOpeningLots(d,id,lots){const a=d.accounts.find(x=>x.id===id);if(!isCredit(a)||a.opening>=0||a.credit.openingLots||!Array.isArray(lots)||!lots.length||lots.some(x=>!Number.isSafeInteger(x.amount)||x.amount<=0||!/^(\d{4})-(\d{2})-(\d{2})$/.test(x.due))||lots.reduce((n,x)=>addSafe(n,x.amount),0)!==-a.opening)fail('CREDIT_DUE');a.credit.openingLots=lots.map(x=>({amount:x.amount,due:x.due,...(x.month?{month:x.month}:{})}));}
export function assertKnownCreditDates(before,after){const old=creditLedger(before),next=creditLedger(after);for(const [id,state]of next){const previous=new Map((old.get(id)?.lots||[]).filter(x=>!x.due).map(x=>[x.operationId,x.amount]));for(const lot of state.lots)if(!lot.due&&lot.amount>(previous.get(lot.operationId)||0))fail('CREDIT_DUE');}}
export function balanceSnapshot(before,after,input){const a=balances(before),b=balances(after),to=input.toAccountId;return {fromBefore:a[input.accountId],fromAfter:b[input.accountId],toBefore:to?a[to]:null,toAfter:to?b[to]:null};}

// Replay every credit movement, including historical edits: the final balance alone is insufficient.
export function assertCreditTimeline(d){
 const ledger=creditLedger(d);
 for(const a of d.accounts.filter(isCredit)){
  if(a.opening>0)fail('CREDIT_OVERPAY');
  let balance=a.opening;
  const events=d.operations.flatMap((o,index)=>postings(o).filter(([id])=>id===a.id).map(([,amount])=>({o,amount,index,date:o.kind==='transfer'&&a.id===o.toAccountId?o.creditDate||o.date:o.debitDate||o.date}))).sort((x,y)=>x.date.localeCompare(y.date)||(x.o.sequence??x.index)-(y.o.sequence??y.index));
  for(const {o,amount}of events){
   const debt=Math.max(0,-balance);if(amount<0&&-amount>Math.max(0,balance)&&!o.creditDueDate)fail('CREDIT_DUE');
   if(amount>0&&o.kind!=='refund'&&amount>debt)fail('CREDIT_OVERPAY');
   if(o.kind==='income'||o.kind==='loan-in'||o.kind==='repayment-in')fail('CREDIT_INCOME');
   if(o.kind==='refund'){
    const surplus=Math.max(0,o.amount-debt);
    if(surplus&&!['keep','withdraw'].includes(o.refundChoice))fail('REFUND_CHOICE');
    if(o.refundChoice==='withdraw'&&(!o.refundTransferConfirmed||o.refundWithdrawAmount!==surplus))fail('REFUND_CHANGED');
   }
   if(amount<0&&o.kind==='transfer'&&o.transferTarget!=='external'){
    const target=d.accounts.find(x=>x.id===o.toAccountId);
    if(!isCredit(target)&&-amount>Math.max(0,balance)&&o.refundWithdrawal===true)fail('CREDIT_OVERPAY');
   }
   balance=addSafe(balance,amount);if(balance < -a.credit.limit)fail('CREDIT_LIMIT');
  }
  const state=ledger.get(a.id);if(state.lots.some(l=>l.amount>0&&!l.due))fail('CREDIT_DUE');
  if(state.lots.reduce((sum,l)=>addSafe(sum,l.amount),0)!==Math.max(0,-balance))fail('CREDIT_DUE');
 }
}
