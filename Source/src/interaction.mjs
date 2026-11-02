// UI-only state: no storage, financial mutation, or browser-history payloads.
export const PRIMARY_TABS=['Операции','Платежи','Главная','Цели','Отчёты'];
export const OPERATION_TYPES=['expense','income','transfer'];
export function adjacent(items,current,direction){
 const index=items.indexOf(current),next=index+(direction==='left'?1:direction==='right'?-1:0);
 return index<0||next<0||next>=items.length?current:items[next];
}
export function navigationTrail(trail,current,target,record=true){
 if(PRIMARY_TABS.includes(target))return [];
 if(target===current)return [...trail];
 return record?[...trail,current]:trail.slice(0,-1);
}
export function hasInput(f){return !!(f&&(f.amount||f.categoryId||f.toAccountId||f.recipient||f.note||f.split?.length||f.fee||f.inTransit||f.draftId||f.editId));}
export function createFormBank(factory,initial){
 const forms=new Map(),baselines=new Map();let current=initial.kind;
 const remember=(kind,f)=>{forms.set(kind,f);baselines.set(kind,JSON.stringify(f));};remember(current,initial);
 return {get active(){return forms.get(current);},select(kind){
  if(!OPERATION_TYPES.includes(kind))return this.active;
  if(!forms.has(kind))remember(kind,factory(kind));current=kind;return this.active;
 },replace:remember,filled(){return [...forms.values()].filter(f=>hasInput(f)||JSON.stringify(f)!==baselines.get(f.kind));},all(){return [...forms.values()];}};
}
export function swipeDirection(start,end,{width,blocked=false,maxVertical=0}={}){
 if(blocked||!start||!end||start.x<32||start.x>width-32||end.x<32||end.x>width-32)return null;
 const dx=end.x-start.x,dy=end.y-start.y,duration=end.time-start.time;
 if(duration<0||duration>900||Math.abs(dx)<56||Math.abs(dx)<Math.abs(dy)*1.8||maxVertical>48||maxVertical>Math.abs(dx)*.55)return null;
 return dx<0?'left':'right';
}
