// Optional rules only. Every spent amount is derived from canonical allocations.
import {copy,uid,now,fail,validateDocument} from './model.mjs';
import {resolveCategory} from './block02.mjs';
import {isExpense} from './credit.mjs';
const empty=()=>({version:1,rules:[]}),data=d=>d.limits||empty(),MAX=BigInt(Number.MAX_SAFE_INTEGER);
const known=(o,keys)=>{if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!keys.includes(k)))fail('LIMIT');};
const text=(v,max=100)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail('LIMIT');};
const month=v=>{if(typeof v!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)||v<'0001-01'||v>'9999-12')fail('LIMIT_PERIOD');return v;};
const stamp=v=>{if(typeof v!=='string'||v.length>40||!/^\d{4}-\d{2}-\d{2}T/.test(v)||!Number.isFinite(Date.parse(v)))fail('LIMIT');};
const amount=v=>{if(!Number.isSafeInteger(v)||v<=0)fail('LIMIT_AMOUNT');return v;};
const category=(d,id)=>{text(id);const c=d.categories.find(c=>c.id===id);if(!c||c.type!=='expense')fail('LIMIT_CATEGORY');if(c.mergedInto)fail('LIMIT_CATEGORY_MERGED');return c;};
const find=(d,id)=>{const r=data(d).rules.find(r=>r.id===id);if(!r)fail('LIMIT_CHANGED');return r;};
const safe=n=>n>=-MAX&&n<=MAX?Number(n):null;
export const limitSettings=d=>({earlyEnabled:d.settings?.limitEarlyWarnings!==false,percent:d.settings?.limitWarningPercent??80});
export const limitInputAmount=value=>{const n=BigInt(value);return n/100n+'.'+String(n%100n).padStart(2,'0');};
export const limitEditBase=(d,id)=>JSON.stringify(find(d,id));
export function validateLimitDraft(f,d){
 if(!['create','edit'].includes(f.limitAction)||f.kind!=='expense')fail('LIMIT');text(f.limitId);if(typeof f.limitPeriod!=='string'||f.limitPeriod.length>7)fail('LIMIT_PERIOD');if(f.limitPeriod)month(f.limitPeriod);
 if(f.originalCents!==undefined){amount(f.originalCents);if(f.originalAmount!==limitInputAmount(f.originalCents))fail('LIMIT');}
 if(f.limitAction==='edit'&&!data(d).rules.some(r=>r.id===f.limitId))fail('LIMIT_CHANGED');
 for(const key of ['categoryId','subcategoryId'])if(f[key])category(d,f[key]);
 if(f.subcategoryId&&d.categories.find(c=>c.id===f.subcategoryId)?.parentId!==f.categoryId)fail('LIMIT_CATEGORY');
}
export function validateLimits(d){
 const s=d.settings||{};if(s.limitEarlyWarnings!==undefined&&typeof s.limitEarlyWarnings!=='boolean')fail('LIMIT');
 if(s.limitWarningPercent!==undefined&&(!Number.isInteger(s.limitWarningPercent)||s.limitWarningPercent<1||s.limitWarningPercent>99))fail('LIMIT_PERCENT');
 const p=d.limits;if(p===undefined)return;known(p,['version','rules']);if(p.version!==1||!Array.isArray(p.rules)||p.rules.length>3000)fail('LIMIT');
 const ids=new Set(),active=new Set();for(const r of p.rules){known(r,['id','categoryId','period','amount','archived','createdAt','request']);text(r.id);if(ids.has(r.id))fail('DUPLICATE');ids.add(r.id);category(d,r.categoryId);month(r.period);amount(r.amount);if(typeof r.archived!=='boolean')fail('LIMIT');stamp(r.createdAt);text(r.request,2000);const key=JSON.stringify([r.categoryId,r.period]);if(!r.archived){if(active.has(key))fail('LIMIT_DUPLICATE');active.add(key);}}
}
function calculate(d,period){
 const totals=new Map(),cache=new Map(),add=(id,n)=>totals.set(id,(totals.get(id)||0n)+n);
 for(const o of d.operations){if(o.cancelled||o.pending||!o.date.startsWith(period+'-')||!(isExpense(o)||o.kind==='refund'))continue;
  for(const part of o.allocations){if(part.categoryId===null)continue;if(!cache.has(part.categoryId))cache.set(part.categoryId,resolveCategory(d,part.categoryId));const c=cache.get(part.categoryId);if(!c||c.type!=='expense')continue;const n=BigInt(part.amount)*(o.kind==='refund'?-1n:1n);add(c.id,n);if(c.parentId){const parent=resolveCategory(d,c.parentId);if(parent&&parent.id!==c.id)add(parent.id,n);}}
 }return totals;
}
function row(d,r,totals){
 const c=category(d,r.categoryId),parent=c.parentId?resolveCategory(d,c.parentId):null,spent=totals.get(c.id)||0n,target=BigInt(r.amount),remaining=target>spent?target-spent:0n,exceeded=spent>target?spent-target:0n,threshold=BigInt(limitSettings(d).percent),percent=spent*10000n/target;
 const state=spent>target?'exceeded':spent===target?'reached':spent*100n>=target*threshold?'near':'normal';
 return {...copy(r),name:c.name,categoryName:parent?parent.name+' · '+c.name:c.name,categoryArchived:!!(c.archived||parent?.archived),spent:safe(spent),remaining:safe(remaining),exceeded:safe(exceeded),exactSpent:spent.toString(),exactRemaining:remaining.toString(),exactExceeded:exceeded.toString(),state,percent:safe(percent)===null?null:Number(percent)/100,ratio:spent<=0n?0:spent>=target?1:Number(spent*10000n/target)/10000,overflow:[spent,remaining,exceeded].some(n=>safe(n)===null)};
}
export function limits(d,period){month(period);const rules=data(d).rules.filter(r=>r.period===period);if(!rules.length)return [];const totals=calculate(d,period);return rules.map(r=>row(d,r,totals));}
export function limit(d,id){const r=find(d,id);return row(d,r,calculate(d,r.period));}
export function limitSummary(d,period){const rows=limits(d,period).filter(r=>!r.archived),count=state=>rows.filter(r=>r.state===state).length;return {count:rows.length,exceeded:count('exceeded'),reached:count('reached'),near:count('near'),normal:count('normal')};}
export function limitOperations(d,id){const r=find(d,id),c=category(d,r.categoryId);return d.operations.filter(o=>!o.cancelled&&!o.pending&&o.date.startsWith(r.period+'-')&&(isExpense(o)||o.kind==='refund')&&o.allocations.some(a=>{const part=resolveCategory(d,a.categoryId);return part&&(part.id===c.id||!c.parentId&&resolveCategory(d,part.parentId)?.id===c.id);}));}
export function limitContributions(d,id){const r=find(d,id),c=category(d,r.categoryId);return limitOperations(d,id).map(o=>({operation:copy(o),exactAmount:o.allocations.reduce((n,a)=>{const part=resolveCategory(d,a.categoryId);return part&&(part.id===c.id||!c.parentId&&resolveCategory(d,part.parentId)?.id===c.id)?n+BigInt(a.amount)*(o.kind==='refund'?-1n:1n):n;},0n).toString()}));}
function atomic(d,fn){const n=copy(d),result=fn(n);if(result===false)return false;validateDocument(n);Object.assign(d,n);return result;}
function clean(d,input){const c=category(d,input.categoryId);return {id:input.id||uid(),categoryId:c.id,period:month(input.period),amount:amount(input.amount)};}
function consume(n,draftId){if(draftId)n.drafts=n.drafts.filter(r=>r.id!==draftId);}
export function createLimit(d,input,{draftId}={}){return atomic(d,n=>{const r=clean(n,input),request=JSON.stringify(r),old=data(n).rules.find(v=>v.id===r.id);if(old){if(old.request===request)return false;fail('DUPLICATE');}text(r.id);const c=category(n,r.categoryId);if(c.archived||c.parentId&&n.categories.find(p=>p.id===c.parentId)?.archived)fail('LIMIT_CATEGORY');n.limits??=empty();n.limits.rules.push({...r,archived:false,createdAt:now(),request});consume(n,draftId);return r.id;});}
export function saveLimit(d,id,input,{editBase,draftId}={}){return atomic(d,n=>{const old=find(n,id);if(editBase!==undefined&&limitEditBase(n,id)!==editBase)fail('LIMIT_CHANGED');const r=clean(n,{...input,id});if(r.categoryId!==old.categoryId){const c=category(n,r.categoryId);if(c.archived||c.parentId&&n.categories.find(p=>p.id===c.parentId)?.archived)fail('LIMIT_CATEGORY');}if(r.categoryId===old.categoryId&&r.period===old.period&&r.amount===old.amount&&!draftId)return false;Object.assign(old,r);consume(n,draftId);return true;});}
export function archiveLimit(d,id,value){return atomic(d,n=>{if(typeof value!=='boolean')fail('LIMIT');const r=find(n,id);if(r.archived===value)return false;r.archived=value;return true;});}
export function saveLimitSettings(d,{earlyEnabled,percent}){return atomic(d,n=>{if(typeof earlyEnabled!=='boolean'||!Number.isInteger(percent)||percent<1||percent>99)fail('LIMIT_PERCENT');if(n.settings.limitEarlyWarnings===earlyEnabled&&n.settings.limitWarningPercent===percent)return false;Object.assign(n.settings,{limitEarlyWarnings:earlyEnabled,limitWarningPercent:percent});return true;});}
// Delta snapshots only. Read/refresh/unlock/threshold edits do not emit a transition.
export function limitTransitions(before,after,today){
 if(!before||!after||before.datasetId!==after.datasetId||!after.limits?.rules.length)return [];month(today.slice(0,7));const previous=before.events.at(-1),event=after.events.at(-1);if(!event||event.id===previous?.id||after.revision!==before.revision+1||after.events.length!==before.events.length+1||event.action.startsWith('limits.')||event.action.startsWith('security.'))return [];
 const facts=d=>JSON.stringify([d.operations.map(o=>{const {note,...fact}=o;return fact;}),d.categories]);if(facts(before)===facts(after))return [];
 const period=today.slice(0,7),old=new Map(limits({...before,settings:after.settings},period).map(r=>[r.id,r])),rank={normal:0,near:1,reached:2,exceeded:3},prefs=limitSettings(after);
 return limits(after,period).filter(r=>{const a=old.get(r.id);return !r.archived&&a&&!a.archived&&r.categoryId===a.categoryId&&r.amount===a.amount&&rank[r.state]>rank[a.state]&&(r.state!=='near'||prefs.earlyEnabled);});
}
// Exact presentation even beyond Number-safe derived totals; never stores a BigInt.
export function formatLimitAmount(value,currency='RUB'){
 const n=BigInt(value),negative=n<0n,abs=negative?-n:n,whole=abs/100n,fraction=Number(abs%100n),nf=new Intl.NumberFormat('ru-RU',{style:'currency',currency,minimumFractionDigits:fraction?2:0,maximumFractionDigits:2}),parts=nf.formatToParts(whole).map(p=>p.type==='fraction'?String(fraction).padStart(2,'0'):p.value).join('');return (negative?'−':'')+parts;
}
