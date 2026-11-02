import {reconcileIncomeLinks,migratePlanningMode} from './planning.mjs';
import {copy,uid,now,fail,post,validateDocument,addSafe,SCHEMA} from './model.mjs';
import {creditLedger,assertSpending,assertKnownCreditDates,balanceSnapshot} from './credit.mjs';
export const defaultSettings=()=>({defaultOperation:'expense',theme:'sand',autoLock:5,lastAccountId:null});
export function migrateDocument(input){
  validateDocument(input);const d=copy(input);
  if(d.schema===1){d.schema=2;d.drafts=[];d.operationEdits=[];d.settings=defaultSettings();}
  if(d.schema===2){d.schema=3;d.categoryEdits=[];d.accountEdits=[];Object.assign(d.settings,{appearance:'system',topPalette:d.settings.theme,bottomPalette:'plum',homeTiles:[{metric:'expense'},{metric:'last'}]});}
  if(d.schema===3)d.schema=4;
  if(d.schema===4){
    const old=creditLedger(d);
    for(const [i,o]of d.operations.entries()){if(d.accounts.some(a=>a.financeType==='credit'&&(a.id===o.accountId||a.id===o.toAccountId)))o.sequence??=i+1;if(o.kind==='refund'&&d.accounts.find(a=>a.id===o.accountId)?.financeType==='credit')o.refundChoice??='keep';}
    for(const state of old.values()){
      for(const lot of state.lots)if(lot.operationId&&lot.due){const o=d.operations.find(o=>o.id===lot.operationId);o.creditDueDate??=lot.due;}
    }
    // Freeze also already paid purchases, whose lots still exist with amount=0.
    d.schema=SCHEMA;
  }

  migratePlanningMode(d);
  try{return validateDocument(d);}catch(error){if(input.schema<SCHEMA&&String(error.code||'').startsWith('CREDIT_'))fail('B1_MIGRATION');throw error;}
}
function apply(d,fn){const next=copy(d),result=fn(next);reconcileIncomeLinks(next,d);validateDocument(next);Object.assign(d,next);return result;}
function audit(d,o){d.operationEdits.push({id:uid(),operationId:o.id,at:now(),before:copy(o)});}
export function checkSplit(d,input){
  if(d.schema>=3)return;
  if(input.kind!=='expense'||input.allocations?.length<=1)return;
  const parts=input.allocations.map(x=>d.categories.find(c=>c.id===x.categoryId));
  if(!parts[0]?.parentId||parts.some(c=>!c||c.parentId!==parts[0].parentId))fail('SPLIT_PARENT');
}
export function saveOperation(d,input,{editId=null,editBase=null,draftId=null,fee=0,feeMode='extra',feeCategoryId=null,inTransit=false}={}){
  return apply(d,n=>{
    checkSplit(n,input);
    if(!editId&&input.id){const prior=n.operations.find(o=>o.id===input.id);if(prior&&input.kind!=='transfer'){
      const keys=['kind','date','accountId','amount','referenceId','refundChoice','refundToAccountId','refundTransferConfirmed'];const parts=copy(input.allocations||[]),allocated=parts.reduce((sum,x)=>addSafe(sum,x.amount),0);if(allocated<input.amount){const rest=parts.find(x=>x.categoryId===null);if(rest)rest.amount+=input.amount-allocated;else parts.push({categoryId:null,amount:input.amount-allocated});}
      if(keys.every(k=>(prior[k]??null)===(input[k]??null))&&JSON.stringify(prior.allocations)===JSON.stringify(parts)&&(!input.creditDueDate||input.creditDueDate===prior.creditDueDate)&&prior.note===(input.note||''))return false;fail('DUPLICATE');
    }}

    if(editId){
      const old=n.operations.find(o=>o.id===editId);if(!old||old.cancelled)fail('NOT_FOUND');
      if(old.referenceId&&old.kind!=='refund'||!['expense','income','refund','transfer'].includes(old.kind)||old.stage==='returned')fail('EDIT_UNSUPPORTED');
      if(!editBase||JSON.stringify(old)!==editBase)fail('EDIT_STALE');
      if(old.kind!==input.kind)fail('OPERATION_KIND');audit(n,old);
      // Preserve identity; validate the entire candidate, including existing refunds.
      n.operations=n.operations.filter(o=>o.id!==editId);
      if(old.kind==='transfer'){
        if(!Number.isSafeInteger(fee)||fee<0||!['extra','inside'].includes(feeMode))fail('AMOUNT');
        const amount=feeMode==='inside'?input.amount-fee:input.amount;if(amount<=0)fail('AMOUNT');
        const oldFee=n.operations.find(x=>x.referenceId===editId&&x.kind==='expense');if(oldFee)audit(n,oldFee);
        post(n,{...input,id:editId,amount,sequence:old.sequence,creditDueDate:input.creditDueDate||old.creditDueDate});const o=n.operations.at(-1),stage=old.stage||'received',wasImmediate=!old.stage||old.debitDate===old.creditDate;
        Object.assign(o,{stage,debitDate:stage==='waiting'?null:input.date,creditDate:stage==='received'?(wasImmediate?input.date:old.creditDate):null,returnDate:null,feeMode,enteredAmount:input.amount});
        if(fee){if(oldFee)n.operations=n.operations.filter(x=>x.id!==oldFee.id);post(n,{id:oldFee?.id||editId+'-fee',kind:'expense',date:input.date,accountId:input.accountId,amount:fee,allocations:[{categoryId:feeCategoryId,amount:fee}],referenceId:editId,note:'Комиссия перевода',creditDueDate:input.creditDueDate});n.operations.at(-1).pending=stage==='waiting';}
        else if(oldFee){oldFee.cancelled=true;oldFee.pending=false;}
      }else post(n,{...input,id:editId,sequence:old.sequence,creditDueDate:input.creditDueDate||old.creditDueDate});
    }else if(input.kind==='transfer'){
      if(!Number.isSafeInteger(fee)||fee<0||!['extra','inside'].includes(feeMode))fail('AMOUNT');
      const amount=feeMode==='inside'?input.amount-fee:input.amount;if(amount<=0)fail('AMOUNT');
      const request=JSON.stringify({input,fee,feeMode,feeCategoryId,inTransit});
      const id=input.id||uid(),prior=n.operations.find(o=>o.id===id);if(prior){if(prior.request===request)return false;fail('DUPLICATE');}
      post(n,{...input,id,amount});const o=n.operations.at(-1);
      Object.assign(o,{stage:inTransit?'waiting':'received',debitDate:inTransit?null:input.date,creditDate:inTransit?null:input.date,returnDate:null,feeMode,enteredAmount:input.amount,request});
      if(fee){post(n,{id:id+'-fee',kind:'expense',date:input.date,accountId:input.accountId,amount:fee,allocations:[{categoryId:feeCategoryId,amount:fee}],referenceId:id,note:'Комиссия перевода',creditDueDate:input.creditDueDate});n.operations.at(-1).pending=inTransit;}
    }else post(n,input);
    if(d.schema>=4){assertSpending(d,n);assertKnownCreditDates(d,n);const saved=n.operations.find(o=>o.id===(editId||input.id));if(saved)saved.balanceSnapshot=balanceSnapshot(editId?{...d,operations:d.operations.filter(o=>o.id!==editId&&!(o.kind==='expense'&&o.referenceId===editId))}:d,n,input);}
    if(draftId)n.drafts=n.drafts.filter(x=>x.id!==draftId);
    n.settings.lastAccountId=input.accountId;return true;
  });
}
export function cancelOperation(d,id){return apply(d,n=>{
  const o=n.operations.find(x=>x.id===id);if(!o)fail('NOT_FOUND');if(o.cancelled)return false;
  if(o.kind==='expense'&&n.operations.some(x=>x.kind==='refund'&&!x.cancelled&&x.referenceId===id))fail('REFUND_LINKED');
  if(o.referenceId&&o.kind==='expense')fail('FEE_LINKED');
  for(const x of n.operations.filter(x=>x.id===id||x.referenceId===id&&x.kind==='expense')){audit(n,x);x.cancelled=true;}
  if(d.schema>=4){assertSpending(d,n);assertKnownCreditDates(d,n);}
  return true;
});}
export function progressTransfer(d,id,action,date){return apply(d,n=>{
  const o=n.operations.find(x=>x.id===id&&x.kind==='transfer'&&!x.cancelled);if(!o)fail('NOT_FOUND');
  const target={debit:'debited',credit:'received',return:'returned'}[action];if(o.stage===target)return false;
  if(action==='debit'?o.stage!=='waiting':o.stage!=='debited')fail('TRANSFER_STATE');audit(n,o);
  o.stage=target;if(action==='debit'){o.debitDate=date;o.date=date;for(const f of n.operations.filter(x=>x.referenceId===id&&x.kind==='expense')){audit(n,f);f.pending=false;f.date=date;}}
  else if(action==='credit')o.creditDate=date;else o.returnDate=date;
  if(d.schema>=4){assertSpending(d,n);assertKnownCreditDates(d,n);}
  return true;
});}
export function refundRemaining(d,id){
  const o=d.operations.find(x=>x.id===id&&x.kind==='expense'&&!x.cancelled);if(!o)fail('REFUND');
  return o.allocations.map(x=>({...x,amount:x.amount-d.operations.filter(r=>r.kind==='refund'&&!r.cancelled&&r.referenceId===id).flatMap(r=>r.allocations).filter(r=>r.categoryId===x.categoryId).reduce((s,r)=>addSafe(s,r.amount),0)}));
}
export function saveDraft(d,form,id=uid()){
  const row={id,updatedAt:now(),form:copy(form)},i=d.drafts.findIndex(x=>x.id===id);
  if(i<0)d.drafts.push(row);else d.drafts[i]=row;return id;
}
export function deleteDraft(d,id){d.drafts=d.drafts.filter(x=>x.id!==id);}
export const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
