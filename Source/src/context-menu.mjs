import {openSurface,closeSurface,activeSurface} from './surfaces.mjs';
import {icon} from './icons.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Keep the continuing touch on the existing surface; no native modal opens mid-hold.
export function installContextMenus({resolve,blocked=()=>false}){
 let dialog=null,source=null,items=[],held=null,timer=0,moved=false,suppressUntil=0,suppressedSource=null,opening=false;
 const resetHold=()=>{clearTimeout(timer);timer=0;held=null;};
 function close(restore=true){resetHold();const el=dialog,origin=source;dialog=null;source=null;items=[];moved=false;if(el)closeSurface(el);if(restore&&origin?.isConnected)origin.focus({preventScroll:true});}
 function select(index){const item=items[index];if(!item||item.disabled||blocked())return;close(true);item.run();}
 function open(el,config,pointer=null){
  if(blocked()||!config?.actions?.length)return;close(false);source=el;suppressedSource=el;items=config.actions;moved=false;
  const r=el.getBoundingClientRect(),vv=visualViewport,top=vv?.offsetTop||0,height=vv?.height||innerHeight,width=innerWidth;
  const native=document.createElement('div');dialog=native;native.className='context-surface';native.tabIndex=-1;native.dataset.contextMenu='true';native.dataset.surfaceOverlay='true';native.setAttribute('role','dialog');native.setAttribute('aria-modal','true');native.setAttribute('aria-label',config.title?'Действия: '+config.title:'Быстрые действия');
  native.innerHTML='<div class="context-options" role="menu" aria-label="Быстрые действия">'+items.map((a,i)=>`<button type="button" role="menuitem" data-context-index="${i}" ${a.disabled?'disabled':''} class="${a.danger?'danger':a.tone==='archive'?'archive-action':''}"><span>${esc(a.label)}</span>${icon(a.icon||'chevron')}</button>`).join('')+'</div>';
  opening=true;openSurface(native);opening=false;
  const menu=native.querySelector('.context-options'),mw=Math.min(248,width-32);menu.style.width=mw+'px';
  const mr=menu.getBoundingClientRect(),x=Math.max(16,Math.min(width-mw-16,r.right-mw)),after=r.bottom+6,before=r.top-mr.height-6;
  const y=config.placement==='above'?Math.max(top+16,before):after+mr.height<=top+height-24?after:before>=top+16?before:Math.max(top+16,Math.min(top+height-mr.height-20,after));
  Object.assign(menu.style,{left:x+'px',top:y+'px',maxHeight:Math.max(100,height-40)+'px'});
  menu.classList.toggle('context-scrollable',menu.scrollHeight>menu.clientHeight+1);
  native.querySelectorAll('[data-context-index]').forEach(b=>b.onclick=()=>select(Number(b.dataset.contextIndex)));
  native.addEventListener('cancel',e=>{e.preventDefault();close();});
  let outsideDown=false;
  native.addEventListener('pointerdown',e=>outsideDown=e.target===native);
  native.addEventListener('click',e=>{if(e.target===native&&outsideDown)close();outsideDown=false;});
  native.addEventListener('focusin',e=>{if(!e.target.matches('[data-context-index]'))return;native.querySelectorAll('[data-context-index]').forEach(b=>b.classList.toggle('context-selected',b===e.target&&!b.disabled));});
  native.addEventListener('keydown',e=>{const buttons=[...menu.querySelectorAll('button:not(:disabled)')],index=buttons.indexOf(document.activeElement);let next;
   if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){e.preventDefault();buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();return;}
   if(e.key==='ArrowDown')next=(index+1)%buttons.length;else if(e.key==='ArrowUp')next=(index-1+buttons.length)%buttons.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=buttons.length-1;
   if(next!==undefined){e.preventDefault();buttons[next]?.focus();}
  });
  if(pointer)native.focus({preventScroll:true});
  if(!pointer){menu.querySelector('button:not(:disabled)')?.focus({preventScroll:true});menu.querySelector('button:not(:disabled)')?.classList.add('context-selected');}
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches)menu.animate([{opacity:.35,transform:'translateY(-4px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:180,easing:'cubic-bezier(.16,1,.3,1)'});
  if(pointer){held={id:pointer.id,x:pointer.x,y:pointer.y,el};try{(native.parentElement||document.body).setPointerCapture(pointer.id);}catch{/* Mouse/keyboard selection still works if the platform cancelled the touch. */}}
  suppressUntil=performance.now()+400;document.dispatchEvent(new Event('finrate-scroll-reset'));
 }
 const target=e=>e.target.closest('[data-limit-view],[data-goal-view],[data-reserve-view],[data-debt-view],[data-personal-debt],[data-payment-plan],[data-income-source],[data-operation],[data-account-view],[data-category-view],[data-category-expand],[data-draft],[data-child],[data-cat-operation],[data-account-operation],[data-metric-operation],[data-result-kind],[data-tile],[data-dock-action]');
 document.addEventListener('pointerdown',e=>{
  suppressUntil=0;
  if(dialog||blocked()||e.isPrimary===false||e.button!==0)return;resetHold();const el=target(e),config=el&&resolve(el);if(!config)return;
  held={id:e.pointerId,x:e.clientX,y:e.clientY,el};timer=setTimeout(()=>{const h=held;if(!h||!h.el.isConnected||blocked())return;open(h.el,resolve(h.el),h);},450);
 },true);
 document.addEventListener('pointermove',e=>{
  if(!held||held.id!==e.pointerId)return;const delta=Math.hypot(e.clientX-held.x,e.clientY-held.y);
  if(!dialog){if(delta>(held.el.hasAttribute('data-dock-action')?8:10))resetHold();return;}
  if(delta>12)moved=true;if(!moved)return;e.preventDefault();const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-context-index]');dialog.querySelectorAll('[data-context-index]').forEach(b=>b.classList.toggle('context-selected',b===hit&&!b.disabled));
 },{capture:true,passive:false});
 document.addEventListener('pointerup',e=>{clearTimeout(timer);if(!held||held.id!==e.pointerId)return;held=null;if(!dialog)return;
  e.preventDefault();e.stopImmediatePropagation();suppressUntil=performance.now()+400;const item=dialog.querySelector('.context-selected');if(moved){if(item)select(Number(item.dataset.contextIndex));else close();}
 },true);
 document.addEventListener('pointercancel',()=>{const wasHeld=held;clearTimeout(timer);held=null;if(dialog&&wasHeld&&!opening){suppressUntil=performance.now()+350;close();}},true);
 // A completed long press owns its continuing touch. Until then the list keeps
 // native panning; a slow swipe must never be hijacked by the menu recognizer.
 document.addEventListener('touchmove',e=>{if(dialog&&!dialog.querySelector('.context-scrollable'))e.preventDefault();},{capture:true,passive:false});
 document.addEventListener('scroll',()=>{if(!dialog)resetHold();},true);
 document.addEventListener('contextmenu',e=>{if(dialog){e.preventDefault();return;}const el=target(e),config=el&&resolve(el);if(config&&!blocked()){e.preventDefault();open(el,config);}},true);
 document.addEventListener('keydown',e=>{if(dialog)return;const el=target(e);if(el&&(e.key==='ContextMenu'||e.shiftKey&&e.key==='F10')){const config=resolve(el);if(config){e.preventDefault();open(el,config);}}});
 document.addEventListener('click',e=>{if(e.isTrusted&&performance.now()<suppressUntil&&suppressedSource?.contains(e.target)&&!e.target.closest('.context-surface')){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)close(false);});
 window.addEventListener('resize',()=>{if(dialog)close();else resetHold();});
 return {close,open,get active(){return !!dialog&&activeSurface()===dialog;}};
}
