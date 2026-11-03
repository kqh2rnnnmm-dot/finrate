/* Presentation only: stored integer minor units and financial rules are unchanged. */
export function formatMoney(value,currency='RUB'){
 const fraction=Math.abs(value%100),whole=Math.trunc(value/100),formatter=new Intl.NumberFormat('ru-RU',{style:'currency',currency,minimumFractionDigits:fraction===0?0:2,maximumFractionDigits:2});
 return formatter.formatToParts(value<0&&whole===0?-0:BigInt(whole)).map(part=>part.type==='fraction'?String(fraction).padStart(2,'0'):part.value).join('');
}
export const compactText=value=>String(value??'').replace(/\s+/gu,' ').trim();
export const editMoney=value=>String(value??'').replace(/[.,]00$/,'');
export function installMoneyPresentation(root=document.body){
 const pattern=/-?\d[\d\s\u00a0\u202f]*(?:[.,]\d{1,2})?[\s\u00a0\u202f]*(?:₽|€|\$|£|RUB|USD|EUR|GBP)/gu;
 const scan=node=>{
  if(node.nodeType===3){if(node.parentElement?.closest('.money-value,input,textarea,select,script,style,.full-note,.sheet-head'))return;
   const value=node.textContent,matches=[...value.matchAll(pattern)];if(!matches.length)return;const fragment=document.createDocumentFragment();let at=0;
   for(const m of matches){fragment.append(value.slice(at,m.index));const span=document.createElement('span');span.className='money-value';span.dataset.noSwipe='true';span.textContent=m[0];span.tabIndex=0;span.setAttribute('aria-label',m[0]);fragment.append(span);at=m.index+m[0].length;}fragment.append(value.slice(at));node.replaceWith(fragment);return;
  }
  if(node.nodeType===1&&!node.matches('input,textarea,select,script,style,.money-value,.full-note'))[...node.childNodes].forEach(scan);
 };
 const pending=new Set();let scheduled=false;
 new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')pending.add(record.target);else record.addedNodes.forEach(n=>pending.add(n));}if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;for(const node of pending)if(node.isConnected)scan(node);pending.clear();});}}).observe(root,{childList:true,subtree:true,characterData:true});scan(root);
}
