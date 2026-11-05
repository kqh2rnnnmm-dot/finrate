import {copy,fail,uid,now,addSafe,validateDocument} from './model.mjs';
import {saveOperation} from './operations.mjs';

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
  known(r,['id','createdAt','versions','pauses']);
  if(r.id.length>100||typeof r.createdAt!=='string'||!Number.isFinite(Date.parse(r.createdAt))||!Array.isArray(r.versions)||!r.versions.length||r.versions.length>2000||!Array.isArray(r.pauses)||r.pauses.length>2000)fail('PAYMENT');
  let last=null;for(const v of r.versions){version(d,v);if(last&&v.from<=last)fail('PAYMENT');last=v.from;}
  let end=null;for(const pause of r.pauses){known(pause,['from','to']);date(pause.from);if(pause.to!==null){date(pause.to);if(pause.to<=pause.from)fail('PAYMENT');}if(end===null&&pause!==r.pauses[0]||end&&pause.from<end)fail('PAYMENT');end=pause.to;}
  plans.set(r.id,r);
 }
 const occurrences=new Map();for(const r of p.occurrences){
  known(r,['id','planId','date','name','amount','amountMode','method','accountId','categoryId']);
  if(!plans.has(r.planId)||r.id!==r.planId+':'+r.date)fail('PAYMENT');date(r.date);text(r.name);integer(r.amount);
  if(!['fixed','variable'].includes(r.amountMode)||!['manual','bank'].includes(r.method))fail('PAYMENT');reference(d,r);occurrences.set(r.id,r);
 }
 const operations=new Map(d.operations.map(o=>[o.id,o])),linked=new Set(),paid=new Map();
 for(const l of p.links){
  if(!l||typeof l!=='object'||Array.isArray(l))fail('PAYMENT_LINK');
  const o=operations.get(l.operationId);if(!occurrences.has(l.occurrenceId)||!o||o.kind!=='expense'||o.referenceId||linked.has(o.id)||Object.keys(l).some(k=>!['operationId','occurrenceId'].includes(k)))fail('PAYMENT_LINK');
  linked.add(o.id);if(actual(o))paid.set(l.occurrenceId,addSafe(paid.get(l.occurrenceId)||0,o.amount));
 }
 for(const [id,amount]of paid)if(amount>occurrences.get(id).amount)fail('PAYMENT_AMOUNT');
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
export function paymentOccurrences(d,from,to){
 date(from);date(to);if(from>to)fail('PAYMENT_DATE');const p=data(d),rows=new Map(p.occurrences.filter(r=>r.date>=from&&r.date<=to).map(r=>[r.id,copy(r)]));
 for(const plan of p.plans)for(let i=0;i<plan.versions.length;i++){
  const v=plan.versions[i],end=plan.versions[i+1]?min(to,previousDay(plan.versions[i+1].from)):to;
  for(const day of scheduledDates(v,from,end)){const id=plan.id+':'+day;if(!rows.has(id)&&!paused(plan,day)){if(rows.size>=MAX_ROWS)fail('SIZE');rows.set(id,row(plan,v,day));}}
 }
 const paid=new Map(),ops=new Map(d.operations.map(o=>[o.id,o]));for(const l of p.links){const o=ops.get(l.operationId);if(actual(o))paid.set(l.occurrenceId,addSafe(paid.get(l.occurrenceId)||0,o.amount));}
 return [...rows.values()].map(r=>{const amountPaid=paid.get(r.id)||0;return {...r,paid:amountPaid,remaining:Math.max(0,r.amount-amountPaid),status:amountPaid>=r.amount?'paid':amountPaid?'partial':'open'};}).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
export function paymentOccurrence(d,id){
 text(id,150);const split=id.lastIndexOf(':'),day=id.slice(split+1);date(day);const r=paymentOccurrences(d,day,day).find(r=>r.id===id);if(!r)fail('PAYMENT_CHANGED');return r;
}
const earliest=d=>[...data(d).plans.flatMap(p=>p.versions.map(v=>max(v.from,v.start))),...data(d).occurrences.map(r=>r.date)].sort()[0]||'9999-12-31';
export function paymentDue(d,period,today){
 date(today);if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))fail('PAYMENT_DATE');const [y,m]=period.split('-').map(Number),end=calendarDate(y,m,31),from=earliest(d);
 if(from>end)return [];return paymentOccurrences(d,from,end).filter(r=>r.remaining>0).map(r=>({...r,overdue:r.date<today}));
}
export function paymentHistory(d){
 const p=data(d),ops=new Map(d.operations.map(o=>[o.id,o])),rows=new Map(p.occurrences.map(r=>[r.id,r]));
 return p.links.map(l=>({operation:ops.get(l.operationId),occurrence:rows.get(l.occurrenceId)})).filter(r=>r.operation&&!r.operation.pending).sort((a,b)=>b.operation.date.localeCompare(a.operation.date)||(b.operation.sequence||0)-(a.operation.sequence||0));
}
export function paymentExpenses(d,today,end){
 const to=end||today,from=earliest(d);if(from>to)return [];
 return paymentOccurrences(d,from,to).filter(r=>r.remaining>0).map(r=>({id:'payment:'+r.id,date:r.date,unpaid:r.remaining,real:r.date<=today,name:r.name}));
}
function atomic(d,fn){const n=copy(d);n.payments??=empty();const result=fn(n);if(result===false)return false;validateDocument(n);Object.assign(d,n);return result;}
function freeze(d,plan,today){const from=earliest(d);if(from>today)return;for(const r of paymentOccurrences(d,from,today).filter(r=>r.planId===plan.id))if(!d.payments.occurrences.some(o=>o.id===r.id)){const {paid,remaining,status,...snapshot}=r;d.payments.occurrences.push(snapshot);}}
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
export function confirmPayment(d,id,input,today,{draftId=null}={}){return atomic(d,n=>{
 date(today);if(!input.id)fail('PAYMENT');const existing=n.operations.find(o=>o.id===input.id);
 if(existing){if(n.payments.links.some(l=>l.operationId===input.id&&l.occurrenceId===id))return false;fail('DUPLICATE');}
 const r=paymentOccurrence(n,id);integer(input.amount);date(input.date);if(input.date>today)fail('PAYMENT_DATE');if(input.amount>r.remaining)fail('PAYMENT_AMOUNT');
 if(!n.payments.occurrences.some(o=>o.id===id)){const {paid,remaining,status,...snapshot}=r;n.payments.occurrences.push(snapshot);}
 saveOperation(n,{...input,kind:'expense',referenceId:null},{draftId});n.payments.links.push({operationId:input.id,occurrenceId:id});return true;
});}
