// Only Home block typography. Exact amounts remain in the accessible name and details.
export function installHomeLayout(root){
 let frame=0;const resize=new ResizeObserver(schedule);
 function fit(){frame=0;for(const el of root.querySelectorAll('.home-tile [data-money-full]')){
  const key=el.clientWidth+'|'+getComputedStyle(el).getPropertyValue('--tile-amount-size')+'|'+el.dataset.moneyFull;if(el.dataset.moneyFit===key)continue;
  const node=el.querySelector('.money-value')||el,full=el.dataset.moneyFull;if(node.textContent!==full)node.textContent=full;
  const base=parseFloat(getComputedStyle(el).getPropertyValue('--tile-amount-size'))||26;
  for(let size=base;size>=16;size--){el.style.fontSize=size+'px';if(node.scrollWidth<=el.clientWidth+1)break;}
  if(node.scrollWidth>el.clientWidth+1&&el.dataset.moneyShort){node.textContent=el.dataset.moneyShort;el.title=full;}else el.removeAttribute('title');
  el.setAttribute('aria-label',full);el.dataset.moneyFit=key;
 }}
 function schedule(){if(!frame)frame=requestAnimationFrame(fit);}
 resize.observe(root);new MutationObserver(schedule).observe(root,{childList:true,subtree:true});window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();
}
