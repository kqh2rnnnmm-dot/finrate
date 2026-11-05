import {copy,fail,uid,now,addSafe,validateDocument} from './model.mjs';
import {saveOperation} from './operations.mjs';
import {spendingRoom} from './credit.mjs';

export const PAYMENT_REPEATS=Object.freeze({once:'Разовый',weekly:'Еженедельно',monthly:'Ежемесячно',yearly:'Ежегодно'});
const empty=()=>({version:1,plans:[],occurrences:[],links:[]});
const data=d=>d.payments||empty();
const DAY=86400000,MAX_ROWS=20000;
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&s>='0001-01-01'&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const date=s=>{if(!validDate(s))fail('PAYMENT_DATE');return s;};
const integer=n=>{if(!Number.isSafeInteger(n)||n<=0)fail('PAYMENT_AMOUNT');};
const text=(s,max=100)=>{if(typeof s!=='string'||!s.trim()||s.length>max)fail('PAYMENT');};
const known=(row,keys)=>{if(!row||Object.keys(row).some(k=>!keys.includes(k)))fail('PAYMENT');};
const actual=o=>o?.kind==='expense'&&!o.cancelled&&!o.pending;
const nextDay=s=>{const n=new Date(Date.parse(date(s)+'T00:00:00Z')+DAY).toISOString().slice(0,10);return date(n);};
const previousDay=s=>new Date(Date.parse(s+'T00:00:00Z')-DAY).toISOString().slice(0,10);
const max=(...values)=>values.reduce((a,b)=>a>b?a:b),min=(...values)=>values.reduce((a,b)=>a<b?a:b);
const days=(y,m)=>m===2?(y%4===0&&(y%100!==0||y%400===0)?29:28):[4,6,9,11].includes(m)?30:31;
const calendarDate=(y,m,d)=>`${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(Math.min(d,days(y,m))).padStart(2,'0')}`;
const paused=(plan,day)=>plan.pauses.some(p=>day>=p.from&&(!p.to||day<p.to));
const reference=(d,v,live=false)=>{
 if(v.accountId!==null&&(!d.accounts.some(a=>a.id===v.accountId&&(!live||!a.archived))))fail('ACCOUNT');
 if(v.categoryId!==null&&!d.categories.some(c=>c.id===v.categoryId&&c.type==='expense'&&(!live||!c.archived&&!c.mergedInto&&(!c.parentId||!d.categories.find(p=>p.id===c.parentId)?.archived))))fail('CATEGORY');
};
function version(d,v){
 known(v,['from','start','name','repeat','amount','amountMode','method','accountId','categoryId']);
 date(v.from);date(v.start);text(v.name);integer(v.amount);
 if(!Object.hasOwn(PAYMENT_REPEATS,v.repeat)||!['fixed','variable'].includes(v.amountMode)||!['manual','bank'].includes(v.method))fail('PAYMENT');
 reference(d,v);
}
function unique(rows,limit){if(!Array.isArray(rows)||rows.length>limit)fail('SIZE');const seen=new Set();for(const row of rows){if(!row)fail('PAYMENT');text(row.id,150);if(seen.has(row.id))fail('DUPLICATE');seen.add(row.id);}}

export function validatePayments(d){
 const p=d.payments;if(p===undefined)return;
 if(!p||p.version!==1||Object.keys(p).some(k=>!['version','plans','occurrences','links'].includes(k)))fail('PAYMENT');
 unique(p.plans,2000);unique(p.occurrences,MAX_ROWS);
 if(!Array.isArray(p.links)||p.links.length>MAX_ROWS)fail('SIZE');
 const plans=new Map();for(const r of p.plans){
  known(r,['id','createdAt','versions','pauses','history']);
  if(r.id.length>100||typeof r.createdAt!=='string'||!Number.isFinite(Date.parse(r.createdAt))||!Array.isArray(r.versions)||!r.versions.length||r.versions.length>2000||!Array.isArray(r.pauses)||r.pauses.length>2000)fail('PAYMENT');
  let last=null;for(const v of r.versions){version(d,v);if(last&&v.from<=last)fail('PAYMENT');last=v.from;}
  let end=null;for(const pause of r.pauses){known(pause,['from','to']);date(pause.from);if(pause.to!==null){date(pause.to);if(pause.to<=pause.from)fail('PAYMENT');}if(end===null&&pause!==r.pauses[0]||end&&pause.from<end)fail('PAYMENT');end=pause.to;}
  validateHistory(r.history);plans.set(r.id,r);
 }
 const occurrences=new Map();for(const r of p.occurrences){
  known(r,['id','planId','date','name','amount','amountMode','method','accountId','categoryId','dueDate','skipped','bankResult','history']);
  if(!plans.has(r.planId)||r.id!==r.planId+':'+r.date)fail('PAYMENT');date(r.date);text(r.name);integer(r.amount);
  if(!['fixed','variable'].includes(r.amountMode)||!['manual','bank'].includes(r.method))fail('PAYMENT');reference(d,r);if(r.dueDate!==undefined)date(r.dueDate);if(r.skipped!==undefined&&typeof r.skipped!=='boolean')fail('PAYMENT');if(r.bankResult!==undefined){known(r.bankResult,['status','at']);if(!['failed','unknown'].includes(r.bankResult.status)||!Number.isFinite(Date.parse(r.bankResult.at)))fail('PAYMENT');}validateHistory(r.history);occurrences.set(r.id,r);
 }
 const operations=new Map(d.operations.map(o=>[o.id,o])),linked=new Set(),paid=new Map();
 for(const l of p.links){
  if(!l||typeof l!=='object'||Array.isArray(l))fail('PAYMENT_LINK');
  const o=operations.get(l.operationId);if(!occurrences.has(l.occurrenceId)||!o||o.kind!=='expense'||o.referenceId||linked.has(o.id)||Object.keys(l).some(k=>!['operationId','occurrenceId','final'].includes(k))||l.final!==undefined&&(typeof l.final!=='boolean'||occurrences.get(l.occurrenceId).amountMode!=='variable'))fail('PAYMENT_LINK');
  linked.add(o.id);if(actual(o))paid.set(l.occurrenceId,addSafe(paid.get(l.occurrenceId)||0,o.amount));
 }
 for(const [id,amount]of paid){const r=occurrences.get(id);if(r.skipped)fail('PAYMENT_PARTIAL');const links=p.links.filter(l=>l.occurrenceId===id),extended=r.amountMode==='variable'&&links.some(l=>l.final!==undefined);if(!extended){if(amount>r.amount)fail('PAYMENT_AMOUNT');}else{const partial=links.filter(l=>l.final!==true&&actual(operations.get(l.operationId))).reduce((n,l)=>addSafe(n,operations.get(l.operationId).amount),0);if(partial>=r.amount)fail('PAYMENT_ESTIMATE');}}

}

function scheduledDates(v,from,to){
 from=max(from,v.from,v.start);if(from>to)return [];
 const result=[],append=s=>{if(s>=from&&s<=to){if(result.length>=MAX_ROWS)fail('SIZE');result.push(s);}};
 if(v.repeat==='once')append(v.start);
 else if(v.repeat==='weekly'){
  const start=Date.parse(v.start+'T00:00:00Z'),first=Date.parse(from+'T00:00:00Z'),end=Date.parse(to+'T00:00:00Z');
  for(let ms=start+Math.max(0,Math.ceil((first-start)/(7*DAY)))*7*DAY;ms<=end;ms+=7*DAY)append(new Date(ms).toISOString().slice(0,10));
 }else{
  const day=Number(v.start.slice(8)),month=Number(v.start.slice(5,7));
  if(v.repeat==='monthly'){for(let i=Number(from.slice(0,4))*12+Number(from.slice(5,7))-1,end=Number(to.slice(0,4))*12+Number(to.slice(5,7))-1;i<=end;i++)append(calendarDate(Math.floor(i/12),i%12+1,day));}
  else for(let year=Number(from.slice(0,4));year<=Number(to.slice(0,4));year++)append(calendarDate(year,month,day));
 }
 return result;
}
function row(plan,v,day){return {id:plan.id+':'+day,planId:plan.id,date:day,name:v.name,amount:v.amount,amountMode:v.amountMode,method:v.method,accountId:v.accountId,categoryId:v.categoryId};}
const snapshotKeys=['id','planId','name','amount','amountMode','method','accountId','categoryId','dueDate','skipped','bankResult','history'];
function snapshot(r){return {date:r.originalDate||r.date,...Object.fromEntries(snapshotKeys.filter(k=>r[k]!==undefined).map(k=>[k,copy(r[k])]))};}
function resolveRows(d,rows){const p=data(d),ops=new Map(d.operations.map(o=>[o.id,o])),links=new Map();for(const l of p.links){const a=links.get(l.occurrenceId)||[];a.push(l);links.set(l.occurrenceId,a);}
 return rows.map(r=>{const ls=links.get(r.id)||[],amountPaid=ls.reduce((n,l)=>actual(ops.get(l.operationId))?addSafe(n,ops.get(l.operationId).amount):n,0),extended=r.amountMode==='variable'&&ls.some(l=>l.final!==undefined),closed=extended?ls.some(l=>l.final===true&&actual(ops.get(l.operationId))):amountPaid>=r.amount;return {...copy(r),originalDate:r.date,date:r.dueDate||r.date,moved:!!r.dueDate&&r.dueDate!==r.date,paid:amountPaid,remaining:r.skipped||closed?0:Math.max(0,r.amount-amountPaid),status:r.skipped?'skipped':closed?'paid':amountPaid?'partial':'open'};});
}
export function paymentOccurrences(d,from,to){
 date(from);date(to);if(from>to)fail('PAYMENT_DATE');const p=data(d),stored=new Set(p.occurrences.map(r=>r.id)),rows=new Map(p.occurrences.filter(r=>(r.dueDate||r.date)>=from&&(r.dueDate||r.date)<=to).map(r=>[r.id,copy(r)]));
 for(const plan of p.plans)for(let i=0;i<plan.versions.length;i++){
  const v=plan.versions[i],end=plan.versions[i+1]?min(to,previousDay(plan.versions[i+1].from)):to;
  for(const day of scheduledDates(v,from,end)){const id=plan.id+':'+day;if(!stored.has(id)&&!rows.has(id)&&!paused(plan,day)){if(rows.size>=MAX_ROWS)fail('SIZE');rows.set(id,row(plan,v,day));}}
 }
 return resolveRows(d,[...rows.values()]).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
export function paymentOccurrence(d,id){text(id,150);const stored=data(d).occurrences.find(r=>r.id===id);if(stored)return resolveRows(d,[stored])[0];const split=id.lastIndexOf(':'),day=id.slice(split+1);date(day);const r=paymentOccurrences(d,day,day).find(r=>r.id===id);if(!r)fail('PAYMENT_CHANGED');return r;}
const earliest=d=>[...data(d).plans.flatMap(p=>p.versions.map(v=>max(v.from,v.start))),...data(d).occurrences.map(r=>r.dueDate||r.date)].sort()[0]||'9999-12-31';
export function paymentDue(d,period,today){
 date(today);if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))fail('PAYMENT_DATE');const [y,m]=period.split('-').map(Number),end=calendarDate(y,m,31),from=earliest(d);
 if(from>end)return [];return paymentOccurrences(d,from,end).filter(r=>r.remaining>0).map(r=>({...r,overdue:r.date<today}));
}
export function paymentHistory(d){
 const p=data(d),ops=new Map(d.operations.map(o=>[o.id,o])),rows=new Map(resolveRows(d,p.occurrences).map(r=>[r.id,r]));
 return p.links.map(l=>({operation:ops.get(l.operationId),occurrence:rows.get(l.occurrenceId)})).filter(r=>r.operation&&!r.operation.pending).sort((a,b)=>b.operation.date.localeCompare(a.operation.date)||(b.operation.sequence||0)-(a.operation.sequence||0));
}
export function paymentExpenses(d,today,end){
 const to=end||today,from=earliest(d);if(from>to)return [];
 return paymentOccurrences(d,from,to).filter(r=>r.remaining>0).map(r=>({id:'payment:'+r.id,date:r.date,unpaid:r.remaining,real:r.date<=today,name:r.name}));
}
function atomic(d,fn){const n=copy(d);n.payments??=empty();const result=fn(n);if(result===false)return false;validateDocument(n);Object.assign(d,n);return result;}
function freeze(d,plan,today){const from=earliest(d);if(from>today)return;for(const r of paymentOccurrences(d,from,today).filter(r=>r.planId===plan.id))if(!d.payments.occurrences.some(o=>o.id===r.id)){d.payments.occurrences.push(snapshot(r));}}
export function savePaymentPlan(d,input,today){return atomic(d,n=>{
 date(today);const p=n.payments,old=p.plans.find(r=>r.id===input.id),start=date(input.start),v={from:old?nextDay(today):start,name:typeof input.name==='string'?input.name.trim():input.name,start,repeat:input.repeat,amount:input.amount,amountMode:input.amountMode,method:input.method,accountId:input.accountId||null,categoryId:input.categoryId||null};version(n,v);reference(n,v,true);
 if(old){
  const last=old.versions.at(-1);if(['name','start','repeat','amount','amountMode','method','accountId','categoryId'].every(k=>last[k]===v[k]))return false;
  if((last.start!==start||last.repeat!==v.repeat)&&p.occurrences.some(r=>r.planId===old.id&&r.date>today&&p.links.some(l=>l.occurrenceId===r.id)))fail('PAYMENT_SCHEDULE');
  freeze(n,old,today);old.versions=old.versions.filter(r=>r.from<v.from);old.versions.push(v);return old.id;
 }
 const id=input.id||uid();text(id);if(p.plans.some(r=>r.id===id))fail('DUPLICATE');p.plans.push({id,createdAt:now(),versions:[v],pauses:[]});return id;
});}
export function setPaymentPaused(d,id,pause,today){return atomic(d,n=>{
 date(today);if(typeof pause!=='boolean')fail('PAYMENT');const plan=n.payments.plans.find(r=>r.id===id);if(!plan)fail('NOT_FOUND');const open=plan.pauses.find(p=>p.to===null);if(!!open===pause)return false;
 if(pause){freeze(n,plan,today);plan.pauses.push({from:nextDay(today),to:null});}
 else if(open.from>=today)plan.pauses=plan.pauses.filter(p=>p!==open);else open.to=today;
 return true;
});}
export function confirmPayment(d,id,input,today,{draftId=null,final,estimate}={}){return atomic(d,n=>{
 date(today);if(!input.id)fail('PAYMENT');const existing=n.operations.find(o=>o.id===input.id);
 if(existing){if(n.payments.links.some(l=>l.operationId===input.id&&l.occurrenceId===id))return false;fail('DUPLICATE');}
 const r=paymentOccurrence(n,id);integer(input.amount);date(input.date);if(input.date>today)fail('PAYMENT_DATE');if(r.status==='paid'||r.skipped)fail('PAYMENT_CHANGED');if(final!==undefined&&(r.amountMode!=='variable'||typeof final!=='boolean'))fail('PAYMENT');if((r.amountMode==='fixed'||final===undefined)&&input.amount>r.remaining)fail('PAYMENT_AMOUNT');
 if(!n.payments.occurrences.some(o=>o.id===id)){n.payments.occurrences.push(snapshot(r));}
 const stored=n.payments.occurrences.find(o=>o.id===id);if(estimate!==undefined){if(r.amountMode!=='variable')fail('PAYMENT');integer(estimate);if(estimate<=r.paid+(final===false?input.amount:0))fail('PAYMENT_ESTIMATE');changeFields(stored,{amount:estimate},'estimate');}
 saveOperation(n,{...input,kind:'expense',referenceId:null},{draftId});n.payments.links.push({operationId:input.id,occurrenceId:id,...(final!==undefined?{final}:{})});return true;
});}

// Editing a linked variable fact uses the same operation engine and keeps its final choice attached to that fact.
export function paymentLinkInfo(d,operationId){const l=data(d).links.find(l=>l.operationId===operationId);if(!l)return null;const r=paymentOccurrence(d,l.occurrenceId),links=data(d).links.filter(x=>x.occurrenceId===r.id),ops=new Map(d.operations.map(o=>[o.id,o])),extended=links.some(x=>x.final!==undefined),active=links.filter(x=>actual(ops.get(x.operationId))).sort((a,b)=>(ops.get(a.operationId).sequence||0)-(ops.get(b.operationId).sequence||0));return {occurrence:r,final:l.final??(!extended&&r.status==='paid'&&active.at(-1)?.operationId===operationId)};}
export function editPayment(d,operationId,input,today,{editBase,final,estimate}={}){return atomic(d,n=>{date(today);const info=paymentLinkInfo(n,operationId);if(!info||info.occurrence.amountMode!=='variable')fail('PAYMENT_LINK');if(typeof final!=='boolean')fail('PAYMENT');if(input.date>today)fail('PAYMENT_DATE');const l=n.payments.links.find(x=>x.operationId===operationId),r=n.payments.occurrences.find(x=>x.id===l.occurrenceId);l.final=final;if(estimate!==undefined){integer(estimate);changeFields(r,{amount:estimate},'estimate');}saveOperation(n,{...input,kind:'expense',referenceId:null},{editId:operationId,editBase});return true;});}

export function confirmPayments(d,items,today){return atomic(d,n=>{
 date(today);if(!Array.isArray(items)||!items.length||items.length>200)fail('PAYMENT');const ids=new Set(),occurrences=new Set();let existing=0;
 for(const item of items){text(item?.occurrenceId,150);text(item?.input?.id);if(ids.has(item.input.id)||occurrences.has(item.occurrenceId))fail('DUPLICATE');ids.add(item.input.id);occurrences.add(item.occurrenceId);const o=n.operations.find(o=>o.id===item.input.id);if(o){if(!n.payments.links.some(l=>l.operationId===o.id&&l.occurrenceId===item.occurrenceId))fail('DUPLICATE');existing++;}}
 if(existing){if(existing===items.length)return false;fail('PAYMENT_BATCH_CHANGED');}
 for(const item of items)confirmPayment(n,item.occurrenceId,item.input,today,{final:item.final,estimate:item.estimate});return true;
});}

const conditionKeys=['name','amount','amountMode','method','accountId','categoryId'];
function validateHistory(history){if(history===undefined)return;if(!Array.isArray(history)||history.length>2000)fail('SIZE');for(const h of history){known(h,['at','action','before','after']);if(typeof h.at!=='string'||!Number.isFinite(Date.parse(h.at))||typeof h.action!=='string'||h.action.length>50||!h.before||!h.after||JSON.stringify(h).length>8000)fail('PAYMENT');}}
function changeFields(r,patch,action){const keys=Object.keys(patch),before=Object.fromEntries(keys.map(k=>[k,r[k]??null]));if(keys.every(k=>JSON.stringify(r[k]??null)===JSON.stringify(patch[k]??null)))return false;r.history??=[];r.history.push({at:now(),action,before:copy(before),after:copy(patch)});Object.assign(r,copy(patch));return true;}
function storedOccurrence(d,id){const r=paymentOccurrence(d,id);let stored=d.payments.occurrences.find(x=>x.id===id);if(!stored){stored=snapshot(r);d.payments.occurrences.push(stored);}return {r,stored};}
function patchConditions(d,patch){known(patch,conditionKeys);if(!Object.keys(patch).length)fail('PAYMENT');if(patch.amount!==undefined)integer(patch.amount);if(patch.name!==undefined)text(patch.name);if(patch.amountMode!==undefined&&!['fixed','variable'].includes(patch.amountMode))fail('PAYMENT');if(patch.method!==undefined&&!['manual','bank'].includes(patch.method))fail('PAYMENT');}
export function editPaymentOccurrence(d,id,patch,today){return atomic(d,n=>{date(today);patchConditions(n,patch);const {r,stored}=storedOccurrence(n,id);if(r.status==='paid')fail('PAYMENT_CHANGED');if(patch.amountMode!==undefined&&patch.amountMode!==r.amountMode&&n.payments.links.some(l=>l.occurrenceId===id))fail('PAYMENT_LINK');reference(n,{...stored,...patch},true);return changeFields(stored,patch,'instance');});}
export function movePayment(d,id,to,today){return atomic(d,n=>{date(today);date(to);const {r,stored}=storedOccurrence(n,id);if(r.status==='paid'||r.skipped)fail('PAYMENT_CHANGED');return changeFields(stored,{dueDate:to},'move');});}
export function skipPayment(d,id,value,today){return atomic(d,n=>{date(today);if(typeof value!=='boolean')fail('PAYMENT');const {r,stored}=storedOccurrence(n,id);if(r.paid>0)fail('PAYMENT_PARTIAL');return changeFields(stored,{skipped:value},value?'skip':'resume-instance');});}
export function changePaymentFuture(d,id,patch,from,today){return atomic(d,n=>{date(today);date(from);patchConditions(n,patch);const selected=paymentOccurrence(n,id),plan=n.payments.plans.find(p=>p.id===selected.planId),old=plan.versions.filter(v=>v.from<=from).at(-1)||plan.versions[0],v={...copy(old),...copy(patch),from};version(n,v);reference(n,v,true);const linked=new Set(n.payments.links.map(l=>l.occurrenceId));for(const r of n.payments.occurrences)if(r.planId===plan.id&&r.date>=from&&!linked.has(r.id))changeFields(r,patch,'future');plan.versions=plan.versions.filter(v=>v.from<from);plan.versions.push(v);plan.history??=[];plan.history.push({at:now(),action:'future',before:copy(old),after:copy(v)});return true;});}
export function setBankPaymentResult(d,id,status,today){return atomic(d,n=>{date(today);if(!['failed','unknown'].includes(status))fail('PAYMENT');const {r,stored}=storedOccurrence(n,id);if(r.method!=='bank'||r.status==='paid'||r.skipped)fail('PAYMENT_CHANGED');if(stored.bankResult?.status===status)return false;return changeFields(stored,{bankResult:{status,at:now()}},'bank-result');});}
export function bankPaymentAvailability(d,id,today){date(today);const r=paymentOccurrence(d,id),account=d.accounts.find(a=>a.id===r.accountId&&!a.archived),available=account?spendingRoom(d,account.id):null;return {accountId:account?.id||null,available,needed:r.remaining,estimated:r.date>today,deficit:available===null?null:Math.max(0,r.remaining-available)};}
