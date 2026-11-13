import {view} from './model.mjs';
export const reportTypes={expense:'Расходы',income:'Доходы',envelopes:'Конверты',saving:'Накопления'};
export function reportEvents(doc,{type='expense',from,to,envelope='',category=''}) {
  const kinds=type==='expense'?['expense','refund']:type==='income'?['income']:type==='saving'?['protect','unprotect']:['expense','refund'];
  const purchases=new Map(doc.events.filter(e=>e.type==='expense').map(e=>[e.id,e]));
  return doc.events.filter(e=>!e.cancelled&&e.date>=from&&e.date<=to&&kinds.includes(e.type)).map(e=>{
    const origin=e.type==='refund'?purchases.get(e.purchase):e;
    return {...e,reportEnvelope:origin?.envelope||'',reportCategory:origin?.category||'',signed:(['refund','unprotect'].includes(e.type)?-1:1)*e.amount};
  }).filter(e=>(!envelope||e.reportEnvelope===envelope)&&(!category||e.reportCategory===category||doc.categories.find(c=>c.id===e.reportCategory)?.parentId===category));
}
export function makeReport(doc,config) {
  const events=reportEvents(doc,config),groups=new Map();
  const getCategory=id=>{const c=doc.categories.find(x=>x.id===id);return c?.parentId?doc.categories.find(x=>x.id===c.parentId):c;};
  for(const e of events) {
    const key=config.group==='day'?e.date:config.group==='envelope'?e.reportEnvelope:(getCategory(e.reportCategory)?.id||'');
    const label=config.group==='day'?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(e.date+'T12:00:00')):config.group==='envelope'?doc.envelopes.find(x=>x.id===key)?.name||'Нераспределённые':getCategory(e.reportCategory)?.name||'Без категории';
    if(!groups.has(key))groups.set(key,{key,label,amount:0,events:[]});
    const g=groups.get(key);g.amount+=e.signed;g.events.push(e);
  }
  const atEnd=view(doc,config.to);
  // A plan report includes funded envelopes even when there was no expense.
  // The plan is explicitly the month snapshot at period end, not a prorated
  // or invented plan for an arbitrary selection of days.
  if(config.type==='envelopes'&&config.group==='envelope') {
    for(const env of doc.envelopes) {
      const b=atEnd.boxes[env.id];
      if((config.envelope&&config.envelope!==env.id)||(!b?.target&&!groups.has(env.id)))continue;
      if(!groups.has(env.id))groups.set(env.id,{key:env.id,label:env.name,amount:0,events:[]});
    }
  }
  return {events,total:events.reduce((s,e)=>s+e.signed,0),groups:[...groups.values()].sort((a,b)=>config.group==='day'?a.key.localeCompare(b.key):b.amount-a.amount),atEnd};
}
