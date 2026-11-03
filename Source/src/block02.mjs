import {copy,fail,uid,now,validateDocument,balances,addAccount,addCategory,rename,archive,normalized,money,post,addSafe} from './model.mjs';
import {saveOperation,localDate} from './operations.mjs';
import {isCredit,assertSpending,assertKnownCreditDates} from './credit.mjs';
const atomic=(d,fn)=>{const n=copy(d),r=fn(n);validateDocument(n);Object.assign(d,n);return r;};
export const activeAccounts=d=>d.accounts.filter(a=>!a.archived);
export function resolveCategory(d,id){let c=d.categories.find(c=>c.id===id),seen=new Set();while(c?.mergedInto){if(seen.has(c.id))fail('SCHEMA');seen.add(c.id);c=d.categories.find(x=>x.id===c.mergedInto);}return c;}
export const selectableCategories=(d,type,parentId=null)=>d.categories.filter(c=>c.type===type&&c.parentId===parentId&&!c.archived&&!c.mergedInto&&(!c.parentId||!d.categories.find(p=>p.id===c.parentId)?.archived));
export function totalParts(parts){return parts.reduce((s,x)=>addSafe(s,money(x.amount)),0);}
export function allocationsFor(form){const amount=money(form.amount);if(amount<=0)fail('AMOUNT');
 const rows=form.split?.length?form.split.map(x=>({categoryId:x.categoryId||null,amount:money(x.amount)})):form.categoryId?[{categoryId:form.subcategoryId||form.categoryId,amount}]:[];
 const merged=new Map();for(const x of rows){if(x.amount<=0)fail('AMOUNT');merged.set(x.categoryId,addSafe(merged.get(x.categoryId)||0,x.amount));}
 const result=[...merged].map(([categoryId,amount])=>({categoryId,amount}));if(result.reduce((s,x)=>addSafe(s,x.amount),0)>amount)fail('SPLIT_SUM');return result;
}
export function transferPreview(d,from,to,amount=0,fee=0,{editId=null}={}){
 if(!Number.isSafeInteger(amount)||amount<0||!Number.isSafeInteger(fee)||fee<0)fail('AMOUNT');
 const base=editId?{...d,operations:d.operations.filter(o=>o.id!==editId&&!(o.kind==='expense'&&o.referenceId===editId))}:d,b=balances(base),actual=balances(d),available=b[from]??0;
 const account=d.accounts.find(a=>a.id===from),target=d.accounts.find(a=>a.id===to),limit=isCredit(account)?account.credit.limit:0,targetCap=isCredit(target)?Math.max(0,-(b[to]||0)):Infinity;
 return {maximum:Math.min(targetCap,Math.max(0,available+limit-fee)),fromNow:actual[from]??0,toNow:actual[to]??0,fromAfter:available-amount-fee,toAfter:(b[to]??0)+amount};
}
export function saveFact(d,input,{fee=0,editId=null,editBase=null,draftId=null,legacy=false,feeMode='extra',feeCategoryId=null}={}){
 // Existing request IDs are resolved by the core idempotency check, not by
 // the sender balance after the already-recorded transfer.
 if(input.kind==='transfer'&&!legacy&&(editId||!d.operations.some(o=>o.id===input.id))){const p=transferPreview(d,input.accountId,input.toAccountId,input.amount,fee,{editId});if(input.amount>p.maximum)fail('TRANSFER_MAX');}
 return saveOperation(d,input,{fee,editId,editBase,draftId,feeMode:legacy?feeMode:'extra',feeCategoryId:legacy?feeCategoryId:null,inTransit:false});
}
export function createVirtualAccount(d,{name,opening=0,note='',financeType='debit',credit}){return atomic(d,n=>{const id=addAccount(n,{name,opening,kind:'wallet',financeType,credit});if(typeof note!=='string'||note.length>500)fail('SCHEMA');n.accounts.at(-1).note=note;return id;});}
export function setAccountPolicy(d,id,{financeType,credit}){return atomic(d,n=>{const a=n.accounts.find(a=>a.id===id);if(!a)fail('ACCOUNT');const value=balances(n)[id];if(financeType!==(a.financeType||'debit')&&(value!==0||n.operations.some(o=>o.accountId===id||o.toAccountId===id)))fail('CREDIT_CONVERT');if(financeType==='debit'&&value<0)fail('INSUFFICIENT_FUNDS');if(financeType==='credit'&&value<-(credit?.limit||0))fail('CREDIT_LIMIT');n.accountEdits.push({id:uid(),at:now(),accountId:id,before:copy(a)});a.financeType=financeType;if(financeType==='credit')a.credit=copy(credit);else delete a.credit;});}
export function restoreAccount(d,id){const a=d.accounts.find(x=>x.id===id);if(!a)fail('NOT_FOUND');a.archived=false;}
export function setOpening(d,id,amount){return atomic(d,n=>{if(!Number.isSafeInteger(amount))fail('AMOUNT');const a=n.accounts.find(x=>x.id===id);if(!a)fail('NOT_FOUND');if(isCredit(a))fail('CREDIT_DUE');n.accountEdits.push({id:uid(),at:now(),accountId:id,before:copy(a)});a.opening=amount;if(d.schema>=4)assertSpending(d,n);});}
export function reconcileAccount(d,id,amount,date=localDate(),requestId=uid()){const delta=amount-balances(d)[id];if(!delta)return false;return atomic(d,n=>{if(isCredit(n.accounts.find(x=>x.id===id))&&delta<0)fail('CREDIT_DUE');if(isCredit(n.accounts.find(x=>x.id===id))&&amount>0)fail('CREDIT_OVERPAY');const result=post(n,{id:requestId,kind:'adjustment',accountId:id,date,amount:delta});if(d.schema>=4){assertSpending(d,n);assertKnownCreditDates(d,n);}return result;});}
function taxSnapshot(d,action){const row={id:uid(),at:now(),action,afterRevision:d.revision+1,before:{planningIncomeCategories:(d.planning?.incomes||[]).map(x=>({id:x.id,categoryId:x.categoryId})),categories:copy(d.categories),links:d.operations.map(o=>({id:o.id,allocations:copy(o.allocations)})),drafts:copy(d.drafts)}};d.categoryEdits.push(row);return row;}
export function categoryAction(d,id,action,{name,parentId}={}){return atomic(d,n=>{const c=n.categories.find(x=>x.id===id);if(!c||c.mergedInto)fail('NOT_FOUND');taxSnapshot(n,action);
 if(action==='rename')rename(n,'categories',id,name);
 else if(action==='archive')archive(n,'categories',id);
 else if(action==='restore'){if(c.parentId&&n.categories.find(p=>p.id===c.parentId)?.archived)fail('CATEGORY_PARENT');c.archived=false;n.categories.filter(x=>x.parentId===id&&!x.mergedInto).forEach(x=>x.archived=false);}
 else if(action==='move'){const p=n.categories.find(x=>x.id===parentId);if(!c.parentId||!p||p.parentId||p.archived||p.mergedInto||p.type!==c.type)fail('CATEGORY_PARENT');c.parentId=parentId;}
 else fail('SCHEMA');return id;
 });}
export function affectedOperations(d,ids){const set=new Set(ids);return d.operations.filter(o=>o.allocations.some(a=>set.has(a.categoryId))).length;}
function relink(d,map){
 for(const r of d.planning?.incomes||[])if(map.has(r.categoryId))r.categoryId=map.get(r.categoryId);

 for(const o of d.operations){if(!o.allocations.some(x=>map.has(x.categoryId)))continue;d.operationEdits.push({id:uid(),at:now(),operationId:o.id,before:copy(o)});const parts=new Map();for(const x of o.allocations){const id=map.get(x.categoryId)||x.categoryId;parts.set(id,addSafe(parts.get(id)||0,x.amount));}o.allocations=[...parts].map(([categoryId,amount])=>({categoryId,amount}));}
 for(const row of d.drafts){const f=row.form;for(const key of ['categoryId','subcategoryId','feeCategoryId'])if(map.has(f[key]))f[key]=map.get(f[key]);for(const part of f.split)if(map.has(part.categoryId))part.categoryId=map.get(part.categoryId);}
}
export function childCollisions(d,ids){const groups=new Map();for(const c of d.categories.filter(c=>ids.includes(c.parentId)&&!c.mergedInto)){const key=normalized(c.name);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}return [...groups].filter(([,rows])=>rows.length>1);}
export function mergeCategories(d,{ids,name,parentId=null,resolutions={}}){return atomic(d,n=>{
 if(new Set(ids).size!==ids.length||ids.length<2||typeof name!=='string'||!name.trim())fail('MERGE');const rows=ids.map(id=>n.categories.find(x=>x.id===id));
 if(rows.some(x=>!x||x.archived||x.mergedInto)||rows.some(x=>x.type!==rows[0].type||!!x.parentId!==!!rows[0].parentId))fail('MERGE');
 const child=!!rows[0].parentId,target=rows[0],map=new Map();taxSnapshot(n,'merge');
 if(child){const p=n.categories.find(x=>x.id===parentId);if(!p||p.parentId||p.archived||p.mergedInto||p.type!==target.type)fail('CATEGORY_PARENT');target.parentId=parentId;}
 else{
  for(const [key,children] of childCollisions(n,ids)){
   const rule=resolutions[key];if(!rule||!['combine','separate'].includes(rule.mode))fail('MERGE_COLLISION');
   if(rule.mode==='combine'){const survivor=children[0];for(const c of children.slice(1)){c.archived=true;c.mergedInto=survivor.id;map.set(c.id,survivor.id);}}
   else {for(const c of children){const next=rule.names?.[c.id];if(typeof next!=='string'||!next.trim())fail('MERGE_COLLISION');c.name=next.trim();}if(new Set(children.map(c=>normalized(c.name))).size!==children.length)fail('MERGE_COLLISION');}
  }
  n.categories.filter(c=>ids.includes(c.parentId)).forEach(c=>c.parentId=target.id);
 }
 target.name=name.trim();for(const c of rows.slice(1)){c.archived=true;c.mergedInto=target.id;map.set(c.id,target.id);}relink(n,map);return target.id;
 });}
export function undoTaxonomy(d){return atomic(d,n=>{const last=n.categoryEdits.at(-1);if(!last||last.action==='undo'||last.afterRevision!==n.revision)fail('UNDO_STALE');const before=copy(last.before);taxSnapshot(n,'undo');n.categories=before.categories;for(const link of before.links){const o=n.operations.find(x=>x.id===link.id);if(o)o.allocations=link.allocations;}n.drafts=before.drafts;for(const link of before.planningIncomeCategories||[]){const source=n.planning?.incomes.find(x=>x.id===link.id);if(source)source.categoryId=link.categoryId;}});}
