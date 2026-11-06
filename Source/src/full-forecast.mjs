// P5 is a read-only dated presentation of B1's canonical obligations, not an operations engine.
import {forecast,incomeOccurrences,dueIncomeOccurrences,MODES} from './planning.mjs';
import {creditLedger,isCredit} from './credit.mjs';
import {paymentOccurrence} from './scheduled-payments.mjs';
import {debts,debtWarnings} from './debts.mjs';
import {reserves} from './goals.mjs';
import {totals,addSafe,fail} from './model.mjs';
const sum=rows=>rows.reduce((n,x)=>addSafe(n,x),0);
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&s>='0001-01-01'&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
const integer=n=>Number.isSafeInteger(n)&&n>=0;
function known(o,keys){if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!keys.includes(k)))fail('FORECAST_SCENARIO');}
function scenarioEvents(events,d,today,end,mode,scenario){
 if(scenario===null||scenario===undefined)return events;
 known(scenario,['event','expense']);if(mode==='all')fail('FORECAST_SCENARIO');
 let rows=events.map(e=>({...e}));
 if(scenario.event!==undefined){const p=scenario.event;known(p,['id','amount','date']);const e=rows.find(e=>e.id===p.id);if(!e||!e.editable||p.amount===undefined&&p.date===undefined)fail('FORECAST_CHANGED');if(p.amount!==undefined){if(!integer(p.amount))fail('FORECAST_SCENARIO');e.amount=p.amount;}if(p.date!==undefined){if(!validDate(p.date)||p.date<today)fail('FORECAST_SCENARIO');e.date=p.date;}e.included=!!e.date&&e.date<=end;e.simulated=true;}
 if(scenario.expense!==undefined){const p=scenario.expense;known(p,['amount','date','accountId']);if(!integer(p.amount)||p.amount<=0||!validDate(p.date)||p.date<today||!d.accounts.some(a=>a.id===p.accountId&&!a.archived&&!isCredit(a)))fail('FORECAST_SCENARIO');rows.push({id:'scenario:expense',type:'hypothetical',name:'Дополнительный расход в сценарии',direction:'out',amount:p.amount,date:p.date,accountId:p.accountId,source:null,state:'expected',included:p.date<=end,editable:false,simulated:true});}
 return rows;
}
function dateSequence(actual,reserved,accounts,events,today,uncertainties){
 let cash=actual,free=addSafe(actual,-reserved),risk=null;const balances=new Map(accounts.map(a=>[a.id,a.actual])),available=new Map(accounts.map(a=>[a.id,addSafe(a.actual,-a.reserved)])),timeline=[];
 const rank=r=>r.accountId?(r.metric==='cash'?0:2):r.metric==='cash'?1:3;
 function consider(r){if(!risk||r.date<risk.date||r.date===risk.date&&rank(r)<rank(risk))risk=r;}
 for(const a of accounts){if(a.actual<0)consider({kind:'account',metric:'cash',date:today,accountId:a.id,eventId:null,shortage:-a.actual});if(a.actual-a.reserved<0)consider({kind:'free',metric:'free',date:today,accountId:a.id,eventId:null,shortage:a.reserved-a.actual});}
 if(cash<0)consider({kind:'total',metric:'cash',date:today,accountId:null,eventId:null,shortage:-cash});if(free<0)consider({kind:'free',metric:'free',date:today,accountId:null,eventId:null,shortage:-free});
 const byDate=new Map();for(const e of events.filter(e=>e.included&&!e.cashUnknown&&e.date)){const day=e.date<today?today:e.date;if(e.direction==='in'&&e.date<today)continue;const rows=byDate.get(day)||[];rows.push(e);byDate.set(day,rows);}
 for(const [date,rows]of [...byDate].sort(([a],[b])=>a.localeCompare(b))){
  const outgoing=rows.filter(e=>e.direction==='out').sort((a,b)=>a.id.localeCompare(b.id)),incoming=rows.filter(e=>e.direction==='in'),out=sum(outgoing.map(e=>e.amount)),inc=sum(incoming.map(e=>e.amount)),net=sum(outgoing.map(e=>e.amount-e.covered)),closing=addSafe(addSafe(cash,-out),inc),closingFree=addSafe(addSafe(free,-net),inc),accountClosing=new Map(),freeClosing=new Map();
  for(const a of accounts){const outs=outgoing.filter(e=>e.accountId===a.id),ins=sum(incoming.filter(e=>e.accountId===a.id).map(e=>e.amount));accountClosing.set(a.id,addSafe(addSafe(balances.get(a.id),-sum(outs.map(e=>e.amount))),ins));freeClosing.set(a.id,addSafe(addSafe(available.get(a.id),-sum(outs.map(e=>e.amount-e.covered))),ins));}
  if(outgoing.length&&incoming.length)uncertainties.push({code:'same-day',date,source:null});
  for(const e of outgoing){cash=addSafe(cash,-e.amount);free=addSafe(free,-(e.amount-e.covered));if(cash<0)consider({kind:closing>=0?'order':'total',metric:'cash',date,accountId:null,eventId:e.id,shortage:-cash});if(free<0)consider({kind:closingFree>=0?'order':'free',metric:'free',date,accountId:null,eventId:e.id,shortage:-free});if(e.accountId){const b=addSafe(balances.get(e.accountId),-e.amount),f=addSafe(available.get(e.accountId),-(e.amount-e.covered));balances.set(e.accountId,b);available.set(e.accountId,f);if(b<0)consider({kind:accountClosing.get(e.accountId)>=0?'order':'account',metric:'cash',date,accountId:e.accountId,eventId:e.id,shortage:-b});if(f<0)consider({kind:freeClosing.get(e.accountId)>=0?'order':'free',metric:'free',date,accountId:e.accountId,eventId:e.id,shortage:-f});}}
  for(const e of incoming){cash=addSafe(cash,e.amount);free=addSafe(free,e.amount);if(e.accountId){balances.set(e.accountId,addSafe(balances.get(e.accountId),e.amount));available.set(e.accountId,addSafe(available.get(e.accountId),e.amount));}}
  timeline.push({date,total:cash,free,accounts:Object.fromEntries(balances)});
 }
 return {risk,timeline,accounts:accounts.map(a=>({...a,projected:balances.get(a.id),projectedFree:available.get(a.id)}))};
}
export function fullForecast(d,today,mode='month',scenario=null){
 if(!Object.hasOwn(MODES,mode)||!validDate(today))fail('PLANNING');
 const base=forecast(d,today,mode),all=mode==='all',actual=totals(d),reserveRows=reserves(d,today),reserved=sum(reserveRows.map(r=>r.remaining)),personal=debts(d,today),debtMap=new Map(personal.map(r=>[r.id,r])),credit=new Map(),events=[],uncertainties=[];
 const usable=id=>d.accounts.some(a=>a.id===id&&!a.archived)?id:null;
 for(const [accountId,state]of creditLedger(d))for(const [i,lot]of state.lots.entries())if(lot.amount>0)credit.set('credit:'+accountId+':'+(lot.operationId||i),{accountId,lot});
 const add=e=>{if(!integer(e.amount))fail('OVERFLOW');events.push({...e,editable:!all&&!!e.date&&e.date>=today&&!e.cashUnknown&&e.type!=='transfer'});};
 function liability(row,included){
  if(row.id.startsWith('payment:')){const p=paymentOccurrence(d,row.id.slice(8)),a=d.accounts.find(a=>a.id===p.accountId),creditPlan=isCredit(a);add({id:row.id,type:'payment',name:p.name,direction:'out',amount:row.amount,date:p.date,accountId:creditPlan?null:usable(p.accountId),sourceAccountId:p.accountId,source:{type:'payment',id:p.id},state:p.amountMode==='variable'?'uncertain':'expected',estimate:p.amountMode==='variable',cashUnknown:creditPlan,included,bank:p.method==='bank'});}
  else if(row.id.startsWith('debt:')){const p=debtMap.get(row.id.slice(5));add({id:row.id,type:'debt',name:'Возврат долга · '+p.participant,direction:'out',amount:p.remaining,date:p.due,accountId:null,source:{type:'debt',id:p.id},state:p.due?'known':'uncertain',included});}
  else{const p=credit.get(row.id);if(!p)fail('FORECAST_CHANGED');add({id:row.id,type:'credit',name:'Погашение кредита · '+d.accounts.find(a=>a.id===p.accountId).name,direction:'out',amount:p.lot.amount,date:p.lot.due,accountId:null,sourceAccountId:p.accountId,source:{type:'credit',id:p.accountId},state:p.lot.due?'known':'uncertain',included});}
 }
 for(const row of base.obligations)liability(row,true);
 const existing=new Set(events.map(e=>e.id));
 for(const [id,p]of credit)if(!p.lot.due&&!existing.has(id))liability({id,amount:p.lot.amount},all);
 for(const p of personal)if(p.direction==='owe'&&p.remaining>0&&!p.due&&!existing.has('debt:'+p.id))liability({id:'debt:'+p.id,amount:p.remaining},all);
 if(!all){
  const incomes=new Map([...incomeOccurrences(d,today,base.end),...dueIncomeOccurrences(d,today)].filter(r=>r.remaining>0).map(r=>[r.id,r]));
  for(const r of incomes.values())add({id:'income:'+r.id,type:'income',name:r.name,direction:'in',amount:r.remaining,date:r.date>=today?r.date:null,originalDate:r.date,accountId:usable(r.accountId),source:{type:'income',id:r.id},state:r.date>=today?'expected':'uncertain',included:r.date>=today&&r.date<=base.end});
  for(const r of personal.filter(r=>r.direction==='owed'&&r.remaining>0))if(!r.due||r.due<=base.end)add({id:'receivable:'+r.id,type:'receivable',name:'Ожидаемый возврат долга · '+r.participant,direction:'in',amount:r.remaining,date:r.due&&r.due>=today?r.due:null,originalDate:r.due,accountId:null,source:{type:'debt',id:r.id},state:r.due&&r.due>=today?'expected':'uncertain',included:!!r.due&&r.due>=today&&r.due<=base.end});
  for(const o of d.operations.filter(o=>o.kind==='transfer'&&!o.cancelled&&['waiting','debited'].includes(o.stage)))add({id:'transfer:'+o.id,type:'transfer',name:o.stage==='debited'?'Перевод в пути':'Перевод не подтверждён',direction:'in',amount:o.amount,date:null,accountId:usable(o.toAccountId),source:{type:'operation',id:o.id},state:'uncertain',included:false,editable:false});
 }
 const rows=scenarioEvents(events,d,today,base.end,mode,scenario).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.id.localeCompare(b.id));if(new Set(rows.map(e=>e.id)).size!==rows.length)fail('DUPLICATE');
 const cover=new Map();for(const r of reserveRows)if(r.coverage>0)cover.set(r.obligationInfo.id,addSafe(cover.get(r.obligationInfo.id)||0,r.remaining));
 for(const e of rows){e.covered=e.included&&e.direction==='out'?Math.min(e.amount,cover.get(e.id)||0):0;if(!e.date)uncertainties.push({code:'date',eventId:e.id,source:e.source});if(!e.accountId&&e.type!=='transfer')uncertainties.push({code:'account',eventId:e.id,source:e.source});if(e.estimate)uncertainties.push({code:'variable',eventId:e.id,source:e.source});if(e.cashUnknown)uncertainties.push({code:'credit-plan',eventId:e.id,source:e.source});}
 for(const r of reserveRows.filter(r=>r.remaining>0&&(r.shortfall>0||r.conflict)))uncertainties.push({code:r.conflict==='account'?'reserve-account':'reserve-coverage',reserveId:r.id,source:{type:'reserve',id:r.id}});
 for(const w of debtWarnings(d,today))uncertainties.push({code:'obligation-conflict',source:{type:'debt',id:w.debt.id}});
 const included=rows.filter(e=>e.included),outgoing=included.filter(e=>e.direction==='out'),incoming=included.filter(e=>e.direction==='in'),knownOutgoing=outgoing.filter(e=>!e.cashUnknown),expectedIncoming=sum(incoming.map(e=>e.amount)),plannedOutgoing=sum(outgoing.map(e=>e.amount)),covered=sum(knownOutgoing.map(e=>e.covered)),knownTotal=addSafe(addSafe(actual.total,expectedIncoming),-sum(knownOutgoing.map(e=>e.amount))),knownFree=addSafe(addSafe(actual.total,-reserved),addSafe(expectedIncoming,-sum(knownOutgoing.map(e=>e.amount-e.covered)))),hardUnknown=rows.some(e=>e.cashUnknown||!all&&!e.date&&e.type!=='transfer');
 const accountUncertain=rows.some(e=>e.type!=='transfer'&&(e.included||!e.date)&&(!e.accountId||!e.date||e.cashUnknown));
 const accounts=d.accounts.map(a=>({id:a.id,name:a.name,credit:isCredit(a),archived:a.archived,actual:isCredit(a)?Math.max(0,actual.balances[a.id]):actual.balances[a.id],reserved:sum(reserveRows.filter(r=>r.accountId===a.id).map(r=>r.remaining))})),sequence=dateSequence(actual.total,reserved,accounts,rows,today,uncertainties);
 sequence.accounts=sequence.accounts.map(a=>({...a,knownProjected:a.projected,knownProjectedFree:a.projectedFree,projected:accountUncertain?null:a.projected,projectedFree:accountUncertain?null:a.projectedFree,complete:!accountUncertain&&!rows.some(e=>e.included&&e.accountId===a.id&&e.estimate)}));
 return {mode,end:base.end,today,actual:actual.total,legacyFree:base.value,projectedTotal:hardUnknown?null:knownTotal,projectedFree:hardUnknown?null:knownFree,knownTotal,knownFree,expectedIncoming,plannedOutgoing,reserved,covered,remainingReserved:addSafe(reserved,-covered),events:rows,reserves:reserveRows,goalTopUps:[],uncertainties,complete:!uncertainties.length,...sequence};
}
