// Only Home block typography. Exact amounts remain in the accessible name and details.
export function installHomeLayout(root){
 let frame=0,observedGrid=null;const resize=new ResizeObserver(schedule);
 function fit(){frame=0;
  const grid=root.querySelector('.main-home .home-tiles');
  if(grid!==observedGrid){if(observedGrid)resize.unobserve(observedGrid);observedGrid=grid;if(grid)resize.observe(grid);}
  if(grid){
   const count=grid.children.length,landscape=root.clientWidth>760&&root.clientHeight<500,columns=count<3?1:landscape&&count>4?3:2,rows=Math.ceil(count/columns);
   grid.style.setProperty('--home-columns',columns);grid.style.setProperty('--home-rows',rows);grid.dataset.columns=String(columns);
   const room=(grid.clientHeight-(rows-1)*(parseFloat(getComputedStyle(grid).rowGap)||0))/rows;grid.closest('.home-screen').dataset.density=room<56?'tiny':room<88?'tight':room<144?'compact':'roomy';
  }
  for(const el of root.querySelectorAll('.home-tile [data-money-full]')){
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
