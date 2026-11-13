export const uid=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
export function fail(code){throw Object.assign(new Error(code),{code});}
export const month=d=>d.slice(0,7),today=()=>new Date().toLocaleDateString('sv-SE');
export function money(s){if(!/^\d+(?:[.,]\d{1,2})?$/.test(String(s)))fail('Укажите сумму с точностью до копейки');const [a,b='']=String(s).replace(',','.').split('.');return integer(Number(BigInt(a)*100n+BigInt(b.padEnd(2,'0'))));}
export function integer(n){if(!Number.isSafeInteger(n)||Math.abs(n)>900000000000000)fail('Недопустимая сумма');return n;}
const part=(n,p)=>Number(BigInt(n)*BigInt(p)/100n);
export const recommended=[['Жильё и ЖКХ',30],['Продукты и транспорт',20],['Покупки',15],['На себя и отдых',15],['Накопления',10],['Инвестиции',10],['Здоровье',0],['Домашние животные',0],['Благотворительность',0]];
export function createDocument(){const envelopes=recommended.map(([name,pct],i)=>({id:'env'+i,name,pct,kind:i===4?'saving':i===5?'investment':'spending'}));return {product:'finrate-lite',schema:1,datasetId:uid(),revision:0,updatedAt:now(),envelopes,initialPlan:Object.fromEntries(envelopes.map(e=>[e.id,e.pct])),categories:[],events:[],edits:[],settings:{step:1,carry:'separate',theme:'system',palette:'neutral'},onboarded:false};}
function planOK(p){if(Object.values(p).some(x=>!Number.isInteger(x)||x<0||x>100)||Object.values(p).reduce((a,b)=>a+b,0)>100)fail('Сумма процентов больше 100%');}
export function calculate(doc,until='9999-12-31'){
 let F=0,P=0,old=0,u=0,period='',income=0,expense=0,refund=0,contribution=0,released=0;
 let plan={...doc.initialPlan},future={...plan},boxes={},base=[],purchases={},protectedBy={};const periods={};
 const box=id=>boxes[id]??(boxes[id]={auto:0,manual:0,usedAuto:0,spent:0,target:0});
 const available=()=>F-P;const assigned=()=>Object.values(boxes).reduce((s,b)=>s+b.auto+b.manual,0);
 const free=()=>Math.max(0,Math.min(u+old,available()-Object.values(boxes).reduce((s,b)=>s+Math.max(0,b.auto+b.manual),0)));
 function takeFree(n,source='combined'){if(n>free())fail('Недостаточно обеспеченных свободных денег');if(source==='old'){if(n>old)fail('Недостаточно старого остатка');old-=n;}else if(source==='new'){if(n>u)fail('Недостаточно новых нераспределённых');u-=n;}else{const v=Math.min(Math.max(0,u),n);u-=v;old-=n-v;}}
 function consume(id,n,strict=false){const b=box(id);if(strict&&n>Math.max(0,Math.min(b.auto+b.manual,available()-assigned()+b.auto+b.manual)))fail('Источник не обеспечен');const a=Math.min(b.auto,n);b.auto-=a;b.usedAuto+=a;const m=n-a;b.manual-=m;return {auto:a,manual:m};}
 const ordered=doc.events.filter(e=>e.date<=until).slice().sort((a,b)=>a.date.localeCompare(b.date)||a.seq-b.seq||a.id.localeCompare(b.id));
 for(const e of ordered){const m=month(e.date);if(m!==period){if(period)periods[period]={income,expense,refund,contribution,released,plan:{...plan},boxes:structuredClone(boxes)};old=available();u=0;boxes={};base=[];period=m;plan={...future};income=expense=refund=contribution=released=0;}
  if(e.cancelled)continue;const n=e.amount||0;integer(n);if(n<0)fail('Отрицательная сумма');
  switch(e.type){
   case 'template':planOK(e.future);future={...e.future};break;
   case 'opening':F+=n;old+=n;break;
   case 'income':F+=n;u+=n;income+=n;if(e.allocate){base.push(e);const p=e.plan||plan;planOK(p);for(const [id,pct]of Object.entries(p)){const x=part(n,pct);box(id).auto+=x;box(id).target+=x;u-=x;}}break;
   case 'plan':{planOK(e.plan);const previous=plan;for(const id of Object.keys(e.plan)){const b=box(id),pct=e.plan[id];if(pct===0&&previous[id]!==0){u+=b.auto+b.manual;b.auto=b.manual=0;b.target=0;}else if(pct!==0){const target=base.reduce((s,v)=>s+part(v.amount,pct),0),v=Math.max(0,target-b.usedAuto);u+=b.auto-v;b.auto=v;b.target=target;}}plan={...e.plan};if(e.future){planOK(e.future);future={...e.future};}if(u+old<0)fail('Недостаточно свободных денег для плана');break;}
   case 'manual':if(!plan[e.envelope])fail('Сначала задайте ненулевой процент');takeFree(n,e.source);box(e.envelope).manual+=n;break;
   case 'expense':if(n>available())fail('Расход выше доступного остатка');F-=n;expense+=n;if(e.envelope){consume(e.envelope,n);box(e.envelope).spent+=n;}else{const a=Math.min(Math.max(0,u),n);u-=a;old-=n-a;}purchases[e.id]={...e,returned:0};break;
   case 'refund':{const p=purchases[e.purchase];if(!p||p.returned+n>p.amount)fail('Возврат превышает остаток покупки');p.returned+=n;F+=n;refund+=n;if(p.envelope)box(p.envelope).manual+=n;else u+=n;break;}
   case 'releaseFree':{const b=box(e.envelope);u+=b.auto+b.manual;b.auto=b.manual=0;break;}
   case 'protect':if(!['saving','investment'].includes(doc.envelopes.find(x=>x.id===e.envelope)?.kind))fail('Защита доступна для накоплений и инвестиций');if(e.source==='envelope')consume(e.envelope,n,true);else takeFree(n,e.source);P+=n;protectedBy[e.envelope]=(protectedBy[e.envelope]||0)+n;contribution+=n;break;
   case 'unprotect':if(n>(protectedBy[e.envelope]||0))fail('Возврат больше защиты');protectedBy[e.envelope]-=n;P-=n;u+=n;released+=n;break;
   default:fail('Неизвестное событие');
  }
  integer(F);integer(P);if(F<P||P<0)fail('Изменение нарушает защиту F ≥ P');
 }
 if(period)periods[period]={income,expense,refund,contribution,released,plan:{...plan},boxes:structuredClone(boxes)};
 return {F,P,A:available(),old,u,free:free(),boxes,plan,future,period,periods,purchases,protectedBy,income,expense,refund,contribution,released};
}
export function view(doc,date=today()) {const v=calculate(doc,date);if(v.period!==month(date)){v.old=v.A;v.u=0;v.boxes={};v.plan={...v.future};v.period=month(date);v.income=v.expense=v.refund=v.contribution=v.released=0;v.free=v.A;}return v;}
function validDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;}
export function validateDocument(d){if(!d||d.product!=='finrate-lite'||d.schema!==1||typeof d.datasetId!=='string'||!Number.isSafeInteger(d.revision)||!Array.isArray(d.envelopes)||!Array.isArray(d.events)||!Array.isArray(d.categories)||!d.settings||!Array.isArray(d.edits))fail('FORMAT');if(d.events.length>100000)fail('SIZE');if(!Number.isFinite(Date.parse(d.updatedAt))||d.revision<0||![1,5,10].includes(d.settings.step)||!['separate','merged'].includes(d.settings.carry))fail('FORMAT');
 const envs=new Set();for(const e of d.envelopes){if(typeof e.id!=='string'||!e.id||envs.has(e.id)||typeof e.name!=='string'||!e.name.trim()||e.name.length>100||!['spending','saving','investment'].includes(e.kind))fail('FORMAT');envs.add(e.id);}planOK(d.initialPlan);const cats=new Set();for(const c of d.categories){if(!c.id||cats.has(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>100)fail('FORMAT');cats.add(c.id);if(c.parentId){const p=d.categories.find(x=>x.id===c.parentId);if(!p||p.parentId||c.envelope)fail('FORMAT');}else if(!envs.has(c.envelope))fail('FORMAT');}
 const ids=new Set();for(const e of d.events){if(!e.id||ids.has(e.id)||!validDate(e.date)||!Number.isInteger(e.seq))fail('FORMAT');ids.add(e.id);if(e.envelope&&!envs.has(e.envelope))fail('FORMAT');if(e.category&&!cats.has(e.category))fail('FORMAT');if(e.amount!==undefined&&(integer(e.amount)<0))fail('FORMAT');for(const p of [e.plan,e.future])if(p){planOK(p);if(Object.keys(p).some(id=>!envs.has(id)))fail('FORMAT');}}calculate(d);return d;}
export function apply(doc,command){const d=structuredClone(doc);if(d.events.some(e=>e.id===command.id)){if(JSON.stringify(d.events.find(e=>e.id===command.id))===JSON.stringify(command))return doc;fail('Конфликт ID');}d.events.push(command);d.revision++;d.updatedAt=now();validateDocument(d);return d;}
export function event(doc,type,data={},date=today()){return {id:uid(),seq:doc.events.reduce((m,e)=>Math.max(m,e.seq),0)+1,date,type,...data};}
export function revise(doc,id,patch){const d=structuredClone(doc),e=d.events.find(x=>x.id===id);if(!e)fail('Операция не найдена');d.edits.push({id:uid(),before:structuredClone(e),at:now(),revision:d.revision});Object.assign(e,patch);d.revision++;d.updatedAt=now();validateDocument(d);return d;}
