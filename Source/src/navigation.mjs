import {PRIMARY_TABS,adjacent} from './interaction.mjs';
import {activeSurface} from './surfaces.mjs';
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const keyboard=()=>document.body.classList.contains('keyboard-open')||document.activeElement?.matches('input,textarea,select,[contenteditable=true]');

// Two intentionally different gestures: content pages step once; dock scrubs live.
export function installNavigationGestures({root,getPage,navigate,blocked}){
 let drag=null,content=null,suppressUntil=0,suppressDockUntil=0;
 const dock=()=>root.querySelector('.bottom');
 const canUse=()=>!blocked()&&!keyboard()&&matchMedia('(max-width:760px)').matches;
 function paint(){const el=dock();if(!el||drag)return;const i=PRIMARY_TABS.indexOf(getPage());el.style.setProperty('--dock-x',Math.max(0,i)*(el.clientWidth-14)/5+'px');}
 function choose(page){if(page!==getPage())navigate(page);}
 function track(x){const el=dock(),r=el.getBoundingClientRect(),w=(r.width-14)/5,index=Math.max(0,Math.min(4,Math.floor((x-r.left-7)/w)));el.style.setProperty('--dock-x',Math.max(0,Math.min(r.width-14-w,x-r.left-7-w/2))+'px');choose(PRIMARY_TABS[index]);}
 root.addEventListener('click',e=>{if(performance.now()<suppressUntil||e.target.closest('.bottom')&&performance.now()<suppressDockUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 root.addEventListener('pointerdown',e=>{
  if(!e.isPrimary){cancel();return;}if(!canUse()||e.button!==0)return;
  const el=e.target.closest('.bottom');
  if(el){drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,initial:getPage(),moved:false};el.dataset.pressed='true';el.setPointerCapture(e.pointerId);return;}
  if(!e.target.closest('main')||e.target.closest('input,textarea,select,a,[contenteditable=true],[data-no-swipe],[role=slider]')||e.clientX<24||e.clientX>innerWidth-24)return;
  const selection=getSelection();if(selection&&!selection.isCollapsed)return;
  content={id:e.pointerId,x:e.clientX,y:e.clientY,page:getPage(),axis:null};
 });
 root.addEventListener('pointermove',e=>{
  if(drag&&e.pointerId===drag.id){if(!drag.moved&&Math.abs(e.clientY-drag.startY)>10&&Math.abs(e.clientX-drag.startX)<8){cancel(e);return;}if(Math.abs(e.clientX-drag.startX)>8)drag.moved=true;if(drag.moved){dock().dataset.scrubbing='true';track(e.clientX);}e.preventDefault();return;}
  if(!content||e.pointerId!==content.id)return;const dx=e.clientX-content.x,dy=e.clientY-content.y;
  if(!content.axis&&Math.max(Math.abs(dx),Math.abs(dy))>12){if(Math.abs(dx)>Math.abs(dy)*1.5){content.axis='x';root.setPointerCapture(e.pointerId);}else if(Math.abs(dy)>Math.abs(dx)*1.2)content=null;}
  if(content?.axis==='x')e.preventDefault();
 });
 function finishDock(e,cancelled=false){const g=drag;if(!g||e.pointerId!==g.id)return;const el=dock(),r=el.getBoundingClientRect();drag=null;delete el.dataset.pressed;delete el.dataset.scrubbing;
  const inside=!cancelled&&e.clientX>=r.left-24&&e.clientX<=r.right+24&&e.clientY>=r.top-32&&e.clientY<=r.bottom+32;
  if(inside){const index=Math.max(0,Math.min(4,Math.floor((e.clientX-r.left-7)/((r.width-14)/5))));choose(PRIMARY_TABS[index]);}else choose(g.initial);
  suppressDockUntil=performance.now()+350;paint();if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
 }
 root.addEventListener('pointerup',e=>{if(drag){finishDock(e);return;}const g=content;content=null;if(!g||g.id!==e.pointerId||g.axis!=='x'||!canUse()||g.page!==getPage())return;
  suppressUntil=performance.now()+350;const dx=e.clientX-g.x;if(Math.abs(dx)>=48){choose(adjacent(PRIMARY_TABS,getPage(),dx<0?'left':'right'));if(!reduced())root.querySelector('main')?.animate([{transform:`translateX(${dx<0?24:-24}px)`},{transform:'translateX(0)'}],{duration:180,easing:'cubic-bezier(.16,1,.3,1)'});}
 });
 function cancel(e){content=null;if(drag)finishDock(e||{pointerId:drag.id},true);}
 root.addEventListener('pointercancel',cancel);root.addEventListener('lostpointercapture',e=>{if(e.target===dock()&&drag)cancel(e);if(e.target===root)content=null;});
 // A modal/hold menu owns the gesture from the moment it opens.
 // Its captured pointerup may never reach root; discard the pending page swipe.
 document.addEventListener('finrate-surface',()=>{if(activeSurface()){content=null;if(drag){drag=null;const el=dock();if(el){delete el.dataset.pressed;delete el.dataset.scrubbing;}paint();}}});
 window.addEventListener('resize',paint);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 return {refresh:paint};
}

