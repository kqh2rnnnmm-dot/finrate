/* Single-line control labels; stored values and full accessible text stay intact. */
export function installTextLayout(root=document.body){
 const enhance=node=>{
  if(node.nodeType!==1)return;
  const controls=node.matches('.list-button')?[node]:[...node.querySelectorAll('.list-button')];
  for(const button of controls)for(const child of [...button.childNodes]){
   if(child.nodeType!==3||!child.textContent.trim()||/[₽€$£]|\b(?:RUB|USD|EUR|GBP)\b/.test(child.textContent))continue;
   const label=document.createElement('span');label.className='control-label';child.replaceWith(label);label.append(child);
  }
 };
 const pending=new Set();let queued=false;
 new MutationObserver(records=>{for(const r of records){if(r.target.closest?.('.list-button'))pending.add(r.target.closest('.list-button'));for(const n of r.addedNodes)if(n.nodeType===1)pending.add(n);}if(!queued){queued=true;queueMicrotask(()=>{queued=false;for(const node of pending)if(node.isConnected)enhance(node);pending.clear();});}}).observe(root,{childList:true,subtree:true});enhance(root);
}
