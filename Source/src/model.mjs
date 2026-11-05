import {validateGoals,validateGoalDraft,validateGoalTile} from './goals.mjs';
import {validateDebts,validateDebtDraft} from './debts.mjs';
import {validatePlanningShape} from './planning.mjs';
import {validatePayments} from './scheduled-payments.mjs';
import {creditLedger,assertCreditTimeline,dueForMonth,dueAfterDays} from './credit.mjs';
export const SCHEMA=5;
export class FinRateError extends Error { constructor(code){super(code);this.name='FinRateError';this.code=code;} }
export const fail=code=>{throw new FinRateError(code);};
export const copy=x=>structuredClone(x);
export const uid=()=>crypto.randomUUID();
export const now=()=>new Date().toISOString();
const currencies=new Set(['RUB','USD','EUR','GBP']);
export const normalized=s=>s.trim().normalize('NFKC').toLocaleLowerCase('ru');
export function money(value){
  if(typeof value!=='string'||!/^[-+]?\d{1,12}(?:[.,]\d{1,2})?$/.test(value.trim()))fail('MONEY');
  const s=value.trim().replace(',','.'),negative=s.startsWith('-'),[a,b='']=s.replace(/^[-+]/,'').split('.');
  const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n))fail('MONEY');return negative?-n:n;
}
export const formatMoney=(n,currency='RUB')=>new Intl.NumberFormat('ru-RU',{style:'currency',currency,minimumFractionDigits:2}).format(n/100);
export function addSafe(a,b){const n=a+b;if(!Number.isSafeInteger(n))fail('OVERFLOW');return n;}
function integer(v){if(!Number.isSafeInteger(v))fail('SCHEMA');}
function text(v,max=100){if(typeof v!=='string'||!v.trim()||v.length>max)fail('SCHEMA');}
function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)fail('DATE');}
function stamp(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(v)||!Number.isFinite(Date.parse(v)))fail('SCHEMA');}
function unique(rows){const ids=new Set();for(const r of rows){text(r.id);if(ids.has(r.id))fail('DUPLICATE');ids.add(r.id);}}
export function newDocument(currency='RUB'){
  if(!currencies.has(currency))fail('CURRENCY');const t=now();
  return {schema:SCHEMA,datasetId:uid(),currency,createdAt:t,updatedAt:t,revision:0,accounts:[],categories:[],operations:[],events:[],drafts:[],operationEdits:[],categoryEdits:[],accountEdits:[],settings:{defaultOperation:'expense',theme:'sand',autoLock:5,lastAccountId:null,appearance:'system',topPalette:'sand',bottomPalette:'plum',homeTiles:[{metric:'expense'},{metric:'last'}]}};
}
export function addAccount(d,{name,kind='bank',opening=0,id=uid(),financeType='debit',credit}){
  text(name);integer(opening);if(!['bank','cash','wallet'].includes(kind))fail('ACCOUNT_KIND');
  if(d.accounts.some(a=>normalized(a.name)===normalized(name)))fail('NAME_EXISTS');
  if(d.accounts.some(a=>a.id===id))fail('DUPLICATE');
  if(!['debit','credit'].includes(financeType))fail('ACCOUNT_KIND');
  if(financeType==='credit'){validateCredit(credit);if(opening>0)fail('CREDIT_OVERPAY');}
  if(financeType==='debit'&&opening<0)fail('INSUFFICIENT_FUNDS');
  if(financeType==='credit'&&opening < -credit.limit)fail('CREDIT_LIMIT');
  if(financeType==='credit'&&opening<0&&!credit.openingLots)fail('CREDIT_DUE');
  if(financeType==='credit'&&credit.openingLots&&credit.openingLots.reduce((sum,lot)=>addSafe(sum,lot.amount),0)!==Math.max(0,-opening))fail('CREDIT_DUE');
  d.accounts.push({id,name:name.trim(),kind,opening,archived:false,financeType,...(financeType==='credit'?{credit:copy(credit)}:{})});return id;
}
function validateCredit(c){
 if(!c||!Number.isSafeInteger(c.limit)||c.limit<=0||!c.grace||!['months','days','statement'].includes(c.grace.mode))fail('CREDIT_SETTINGS');
 if(c.grace.mode==='months'&&(!Number.isInteger(c.grace.months)||c.grace.months<1||c.grace.months>12))fail('CREDIT_SETTINGS');
 if(c.grace.mode==='days'&&(!Number.isInteger(c.grace.days)||c.grace.days<1||c.grace.days>365))fail('CREDIT_SETTINGS');
 if(c.openingLots!==undefined){if(!Array.isArray(c.openingLots)||c.openingLots.length>100)fail('CREDIT_SETTINGS');for(const lot of c.openingLots){integer(lot.amount);date(lot.due);if(lot.amount<=0)fail('CREDIT_SETTINGS');if(lot.month!==undefined&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(lot.month))fail('CREDIT_SETTINGS');}}
 if(c.statement){date(c.statement.dueDate);integer(c.statement.amount);integer(c.statement.paymentsAtSet);if(c.statement.amount<0||c.statement.paymentsAtSet<0)fail('CREDIT_SETTINGS');}
}
export function addCategory(d,{name,type='expense',parentId=null,id=uid()}){
  text(name);if(!['expense','income'].includes(type))fail('CATEGORY_TYPE');
  if(parentId){const p=d.categories.find(c=>c.id===parentId);if(!p||p.parentId||p.type!==type||p.archived)fail('CATEGORY_PARENT');}
  if(d.categories.some(c=>c.type===type&&c.parentId===parentId&&normalized(c.name)===normalized(name)))fail('NAME_EXISTS');
  if(d.categories.some(c=>c.id===id))fail('DUPLICATE');
  d.categories.push({id,name:name.trim(),type,parentId,archived:false});return id;
}
export function rename(d,collection,id,name){text(name);const item=d[collection]?.find(x=>x.id===id);if(!item||!['accounts','categories'].includes(collection))fail('NOT_FOUND');
  if(d[collection].some(x=>x.id!==id&&normalized(x.name)===normalized(name)&&(collection==='accounts'||(x.type===item.type&&x.parentId===item.parentId))))fail('NAME_EXISTS');item.name=name.trim();
}
export function archive(d,collection,id){if(!['accounts','categories'].includes(collection))fail('SCHEMA');const item=d[collection].find(x=>x.id===id);if(!item)fail('NOT_FOUND');
  if(collection==='accounts'&&balances(d)[id]!==0)fail('NONZERO_ACCOUNT');
  if(collection==='accounts'&&d.schema>=3&&d.accounts.filter(a=>!a.archived).length<=1)fail('LAST_ACCOUNT');
  if(collection==='accounts'&&d.operations.some(o=>o.kind==='transfer'&&!o.cancelled&&['waiting','debited'].includes(o.stage)&&(o.accountId===id||o.toAccountId===id)))fail('PENDING_ACCOUNT');
  item.archived=true;
  if(collection==='categories')d.categories.filter(x=>x.parentId===id).forEach(x=>{x.archived=true;});
}
const kinds=['expense','income','transfer','adjustment','loan-out','loan-in','repayment-out','repayment-in','refund'];
export function postings(op){
  if(op.cancelled||op.pending)return [];
  const a=op.amount;
  switch(op.kind){
    case 'transfer':return op.stage==='waiting'||op.stage==='returned'?[]:op.transferTarget==='external'||op.stage==='debited'?[[op.accountId,-a]]:[[op.accountId,-a],[op.toAccountId,a]];
    case 'expense':case 'loan-out':case 'repayment-out':return [[op.accountId,-a]];
    case 'refund':return op.refundWithdrawAmount?[[op.accountId,a-op.refundWithdrawAmount],[op.refundToAccountId,op.refundWithdrawAmount]]:[[op.accountId,a]];
    case 'income':case 'loan-in':case 'repayment-in':return [[op.accountId,a]];
    case 'adjustment':return [[op.accountId,a]];
    default:fail('OPERATION_KIND');
  }
}
function validateOperation(d,o,historical=false){
  if(o.creditDueDate!==undefined)date(o.creditDueDate);
  if(o.sequence!==undefined){integer(o.sequence);if(o.sequence<1)fail('SCHEMA');}
  if(o.refundTransferConfirmed!==undefined&&typeof o.refundTransferConfirmed!=='boolean')fail('REFUND');
  if(o.refundChoice!==undefined&&(!['keep','withdraw'].includes(o.refundChoice)||o.kind!=='refund'))fail('REFUND');
  if(o.refundWithdrawAmount!==undefined){integer(o.refundWithdrawAmount);if(o.refundWithdrawAmount<0||o.refundWithdrawAmount>o.amount||o.refundChoice!=='withdraw'||!o.refundTransferConfirmed)fail('REFUND');const target=d.accounts.find(a=>a.id===o.refundToAccountId);if(!target||target.financeType==='credit'||target.id===o.accountId)fail('ACCOUNT');}

  text(o.id);date(o.date);if(!kinds.includes(o.kind))fail('OPERATION_KIND');integer(o.amount);
  if(o.kind==='adjustment'?o.amount===0:o.amount<=0)fail('AMOUNT');
  const account=d.accounts.find(a=>a.id===o.accountId);if(!account||(!historical&&account.archived))fail('ACCOUNT');
  const external=o.kind==='transfer'&&o.transferTarget==='external';
  if(o.transferTarget!==undefined&&(!['own','external'].includes(o.transferTarget)||o.kind!=='transfer'))fail('TRANSFER');
  if(external){if(d.schema<4||o.toAccountId!==null)fail('TRANSFER');text(o.recipient);if(o.stage&&o.stage!=='received')fail('TRANSFER');}
  else if(o.kind==='transfer'){const target=d.accounts.find(a=>a.id===o.toAccountId);if(!target||target.id===account.id||(!historical&&target.archived))fail('TRANSFER');}
  if(o.balanceSnapshot){const s=o.balanceSnapshot;for(const key of ['fromBefore','fromAfter'])integer(s[key]);for(const key of ['toBefore','toAfter'])if(s[key]!==null)integer(s[key]);}
  if(!Array.isArray(o.allocations)||o.allocations.length>100)fail('ALLOCATIONS');
  if(['expense','income','refund'].includes(o.kind)||external){
    if(!o.allocations.length)fail('ALLOCATIONS');let total=0;const seen=new Set();
    for(const x of o.allocations){const c=d.categories.find(c=>c.id===x.categoryId),uncategorized=d.schema>=3&&x.categoryId===null;if(!uncategorized&&(!c||c.type!==(o.kind==='income'?'income':'expense')||(!historical&&(c.archived||c.parentId&&d.categories.find(p=>p.id===c.parentId)?.archived)))||seen.has(x.categoryId))fail('CATEGORY');seen.add(x.categoryId);integer(x.amount);if(x.amount<=0)fail('AMOUNT');total=addSafe(total,x.amount);}
    if(total!==o.amount)fail('SPLIT_SUM');
  }else if(o.allocations.length)fail('ALLOCATIONS');
  if(typeof o.note!=='string'||o.note.length>500)fail('SCHEMA');
  if(o.kind==='refund'){
    const original=d.operations.find(x=>x.id===o.referenceId&&x.kind==='expense');if(!original||(!o.cancelled&&original.cancelled)||o.date<original.date)fail('REFUND');
    for(const x of o.allocations){const max=original.allocations.find(a=>a.categoryId===x.categoryId)?.amount||0;
      const prior=d.operations.filter(a=>a.kind==='refund'&&!a.cancelled&&a.referenceId===original.id&&a.id!==o.id).flatMap(a=>a.allocations).filter(a=>a.categoryId===x.categoryId).reduce((s,a)=>addSafe(s,a.amount),0);
      if(!o.cancelled&&addSafe(prior,x.amount)>max)fail('REFUND');}
  }
}
export function post(d,input){
  const op={id:input.id||uid(),kind:input.kind,date:input.date,accountId:input.accountId,amount:input.amount,toAccountId:input.toAccountId||null,allocations:copy(input.allocations||[]),referenceId:input.referenceId||null,note:input.note||'',...(input.creditDueDate?{creditDueDate:input.creditDueDate}:{})};
  if(input.splitExplicit===true)op.splitExplicit=true;
  if(input.transferTarget!==undefined)op.transferTarget=input.transferTarget;
  if(input.transferTarget==='external')op.recipient=input.recipient;
  if(d.schema>=3&&(['expense','income','refund'].includes(op.kind)||op.transferTarget==='external')){
    const allocated=op.allocations.reduce((s,x)=>addSafe(s,x.amount),0);
    if(allocated>op.amount)fail('SPLIT_SUM');
    if(allocated<op.amount){const rest=op.allocations.find(x=>x.categoryId===null);if(rest)rest.amount=addSafe(rest.amount,op.amount-allocated);else op.allocations.push({categoryId:null,amount:op.amount-allocated});}
  }
  for(const k of ['sequence','refundChoice','refundToAccountId','refundTransferConfirmed'])if(input[k]!==undefined)op[k]=input[k];
  if(d.schema>=5){
    op.sequence??=d.operations.reduce((n,o,i)=>Math.max(n,o.sequence||i+1),0)+1;
    const account=d.accounts.find(a=>a.id===op.accountId);
    if(account?.financeType==='credit'&&!op.creditDueDate&&op.kind==='expense'&&!op.referenceId){const g=account.credit.grace;op.creditDueDate=g.mode==='months'?dueForMonth(op.date,g.months):g.mode==='days'?dueAfterDays(op.date,g.days):undefined;if(!op.creditDueDate)delete op.creditDueDate;}
    if(op.kind==='refund'&&account?.financeType==='credit'){
      const before={...d,operations:d.operations.filter(o=>(o.date<op.date||o.date===op.date&&(o.sequence||0)<op.sequence)&&o.id!==op.id)};
      const debt=Math.max(0,-(creditLedger(before).get(op.accountId)?.balance||0)),surplus=Math.max(0,op.amount-debt);
      if(surplus&&!['keep','withdraw'].includes(op.refundChoice))fail('REFUND_CHOICE');
      if(op.refundChoice==='withdraw'){
        if(!op.refundTransferConfirmed)fail('REFUND_CONFIRM');
        const to=d.accounts.find(a=>a.id===op.refundToAccountId&&!a.archived&&a.financeType!=='credit');if(!to)fail('ACCOUNT');
        op.refundWithdrawAmount=surplus;
      }
    }
  }
  const prior=d.operations.find(x=>x.id===op.id);if(prior){const comparable=copy(prior);delete comparable.balanceSnapshot;const requested=copy(op);delete comparable.sequence;delete requested.sequence;if(JSON.stringify(comparable)===JSON.stringify(requested))return false;fail('DUPLICATE');}
  validateOperation(d,op);balances({...d,operations:[...d.operations,op]});d.operations.push(op);return true;
}
export function balances(d){const result=Object.fromEntries(d.accounts.map(a=>[a.id,a.opening]));for(const o of d.operations)for(const [id,n] of postings(o)){if(!Object.hasOwn(result,id))fail('ACCOUNT');result[id]=addSafe(result[id],n);}Object.values(result).reduce(addSafe,0);return result;}
export function totals(d,{from='0000-01-01',to='9999-12-31'}={}){
  const b=balances(d);let income=0,expense=0,adjustment=0;const byCategory=Object.create(null);
  for(const o of d.operations){if(o.date<from||o.date>to)continue;
    if(o.cancelled||o.pending)continue;
    if(o.kind==='income')income=addSafe(income,o.amount);
    if(o.kind==='expense'||o.kind==='transfer'&&o.transferTarget==='external')expense=addSafe(expense,o.amount);
    if(o.kind==='refund')expense=addSafe(expense,-o.amount);
    if(o.kind==='adjustment')adjustment=addSafe(adjustment,o.amount);
    for(const x of o.allocations)byCategory[x.categoryId]=addSafe(byCategory[x.categoryId]||0,o.kind==='refund'?-x.amount:x.amount);
  }
  const inTransit=d.operations.filter(o=>o.kind==='transfer'&&o.stage==='debited'&&!o.cancelled).reduce((s,o)=>addSafe(s,o.amount),0);
  return {balances:b,total:d.schema>=5?d.accounts.reduce((sum,a)=>addSafe(sum,a.financeType==='credit'?Math.max(0,b[a.id]):b[a.id]),0):Object.values(b).reduce(addSafe,0),income,expense,result:addSafe(income,-expense),adjustment,byCategory,inTransit};
}
// Pure calculation seam for package 3. No planning UI or background actions.
export function available(actual,reserves=[],obligations=[],horizon='9999-12-31'){
  integer(actual);let reserved=0,due=0;const covered=new Map(),ids=new Set();
  for(const r of reserves){text(r.id);if(ids.has(r.id))fail('DUPLICATE');ids.add(r.id);integer(r.amount);if(r.amount<0)fail('AMOUNT');reserved=addSafe(reserved,r.amount);if(r.obligationId)covered.set(r.obligationId,addSafe(covered.get(r.obligationId)||0,r.amount));}
  ids.clear();for(const o of obligations){text(o.id);if(ids.has(o.id))fail('DUPLICATE');ids.add(o.id);date(o.date);integer(o.unpaid);if(o.unpaid<0)fail('AMOUNT');if(o.date<=horizon)due=addSafe(due,Math.max(0,o.unpaid-(covered.get(o.id)||0)));}
  return addSafe(addSafe(actual,-reserved),-due);
}
export function validateDocument(d){
  if(!d||![1,2,3,4,SCHEMA].includes(d.schema)||!currencies.has(d.currency))fail('SCHEMA');text(d.datasetId);stamp(d.createdAt);stamp(d.updatedAt);integer(d.revision);if(d.revision<0)fail('SCHEMA');
  for(const [k,limit] of [['accounts',200],['categories',2000],['operations',20000],['events',30000]]){if(!Array.isArray(d[k])||d[k].length>limit)fail('SIZE');unique(d[k]);}
  const names=new Set();for(const a of d.accounts){text(a.name);integer(a.opening);if(!['bank','cash','wallet'].includes(a.kind)||typeof a.archived!=='boolean')fail('SCHEMA');if(a.financeType!==undefined&&!['debit','credit'].includes(a.financeType))fail('ACCOUNT_KIND');if(a.financeType==='credit'){validateCredit(a.credit);if(a.credit.openingLots&&a.credit.openingLots.reduce((sum,lot)=>addSafe(sum,lot.amount),0)!==Math.max(0,-a.opening))fail('CREDIT_DUE');}const n=normalized(a.name);if(names.has(n))fail('NAME_EXISTS');names.add(n);}
  names.clear();for(const c of d.categories){text(c.name);if(!['expense','income'].includes(c.type)||typeof c.archived!=='boolean'||!(c.parentId===null||typeof c.parentId==='string'))fail('SCHEMA');if(c.parentId){const p=d.categories.find(x=>x.id===c.parentId);if(!p||p.parentId||p.type!==c.type)fail('CATEGORY_PARENT');}const n=c.type+'|'+c.parentId+'|'+normalized(c.name)+(c.mergedInto?'|merged:'+c.id:'');if(names.has(n))fail('NAME_EXISTS');names.add(n);}
  for(const o of d.operations){validateOperation(d,o,true);
    if(o.cancelled!==undefined&&typeof o.cancelled!=='boolean')fail('SCHEMA');
    if(o.pending!==undefined&&typeof o.pending!=='boolean')fail('SCHEMA');
    if(o.stage!==undefined){if(o.kind!=='transfer'||!['waiting','debited','received','returned'].includes(o.stage))fail('TRANSFER');
      if(o.stage!=='waiting')date(o.debitDate);if(o.stage==='received')date(o.creditDate);if(o.stage==='returned')date(o.returnDate);
      if(o.creditDate&&o.creditDate<o.debitDate||o.returnDate&&o.returnDate<o.debitDate)fail('DATE');}
    if(d.schema===1&&(o.stage!==undefined||o.cancelled||o.pending))fail('SCHEMA');
  }for(const e of d.events){stamp(e.at);text(e.action);integer(e.revision);if(e.revision<1||e.revision>d.revision)fail('SCHEMA');}
  if(d.schema>=2){
    if(!Array.isArray(d.drafts)||d.drafts.length>200||!Array.isArray(d.operationEdits)||d.operationEdits.length>30000)fail('SIZE');unique(d.drafts);unique(d.operationEdits);
    for(const r of d.drafts){stamp(r.updatedAt);const f=r.form;if(f?.goalAction!==undefined||f?.reserveId!==undefined)validateGoalDraft(f);if(f?.debtAction!==undefined)validateDebtDraft(f);if(!f||typeof f!=='object'||(!['expense','income','transfer','refund'].includes(f.kind)&&!validateDebtDraft(f))||JSON.stringify(f).length>30000)fail('SCHEMA');
      for(const [k,max] of [['id',100],['amount',100],['categoryId',100],['accountId',100],['toAccountId',100],['note',500],['fee',100]])if(typeof f[k]!=='string'||f[k].length>max)fail('SCHEMA');date(f.date);if(f.creditDueDate)date(f.creditDueDate);if(f.refundChoice!==undefined&&!['','keep','withdraw'].includes(f.refundChoice))fail('REFUND');if(f.refundTransferConfirmed!==undefined&&typeof f.refundTransferConfirmed!=='boolean')fail('REFUND');if(f.refundToAccountId!==undefined&&(typeof f.refundToAccountId!=='string'||f.refundToAccountId.length>100))fail('REFUND');if(f.recipient!==undefined&&(typeof f.recipient!=='string'||f.recipient.length>100))fail('SCHEMA');if(f.transferTarget!==undefined&&!['own','external'].includes(f.transferTarget))fail('TRANSFER');
      if(!Array.isArray(f.split)||f.split.length>100||typeof f.inTransit!=='boolean'||!['extra','inside'].includes(f.feeMode))fail('SCHEMA');
      for(const x of f.split){if(x.categoryId!==null||d.schema<3)text(x.categoryId);if(typeof x.amount!=='string'||x.amount.length>100)fail('SCHEMA');}
    }
    for(const r of d.operationEdits){text(r.operationId);stamp(r.at);if(!r.before||typeof r.before!=='object')fail('SCHEMA');}
    if(!d.settings||!['expense','income','transfer'].includes(d.settings.defaultOperation)||!['sand','plum','olive'].includes(d.settings.theme)||![0,5,15,30,-1].includes(d.settings.autoLock))fail('SCHEMA');
  }
  if(d.schema>=3){
    if(!Array.isArray(d.categoryEdits)||!Array.isArray(d.accountEdits)||d.categoryEdits.length>10000||d.accountEdits.length>10000)fail('SCHEMA');
    unique(d.categoryEdits);unique(d.accountEdits);for(const row of [...d.categoryEdits,...d.accountEdits]){stamp(row.at);if(!row.before||typeof row.before!=='object')fail('SCHEMA');}
    const s=d.settings;if(!['system','light','dark'].includes(s.appearance)||!['sand','plum','olive'].includes(s.topPalette)||!['sand','plum','olive'].includes(s.bottomPalette)||!Array.isArray(s.homeTiles)||s.homeTiles.length<1||s.homeTiles.length>(d.schema>=4?6:4))fail('SCHEMA');
    for(const t of s.homeTiles){validateGoalTile(d,t);if(!t||!['expense','income','last','payment','limits','reserves','goal','debts','account','drafts',...(d.schema>=4?['credit']:[])].includes(t.metric)||t.accountId&&!d.accounts.some(a=>a.id===t.accountId))fail('SCHEMA');if(t.metric==='credit'&&(!d.accounts.some(a=>a.id===t.accountId&&a.financeType==='credit')||!['due','total'].includes(t.creditMetric)))fail('CREDIT_SETTINGS');}
    for(const c of d.categories)if(c.mergedInto){const target=d.categories.find(x=>x.id===c.mergedInto);if(!c.archived||!target||target.id===c.id||target.type!==c.type||!!target.parentId!==!!c.parentId)fail('SCHEMA');let next=target,seen=new Set([c.id]);while(next){if(seen.has(next.id))fail('SCHEMA');seen.add(next.id);next=d.categories.find(x=>x.id===next.mergedInto);}}
  }
  balances(d);if(d.schema>=5){assertCreditTimeline(d);if(d.planning!==undefined)validatePlanningShape(d);validatePayments(d);validateDebts(d);validateGoals(d);}return d;
}
export function changed(d,action){d.revision++;d.updatedAt=now();d.events.push({id:uid(),at:d.updatedAt,action,revision:d.revision});validateDocument(d);return d;}
