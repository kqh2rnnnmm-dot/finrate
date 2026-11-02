import {activeSurface} from './surfaces.mjs';
import {icon} from './icons.mjs';

const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const clamp=x=>Math.max(0,Math.min(1,x));

// The same geometry paints the live drag and the modal. The small 18×84 tab
// becomes the blue border around the existing operation choices.
function paint(el,progress,side){
 const p=clamp(progress),width=el.offsetWidth,height=el.offsetHeight;
 el.style.setProperty('--edge-shift',((side==='left'?-1:1)*(width-18)*(1-p))+'px');
 el.style.setProperty('--edge-crop',Math.max(0,(height-84)/2)*(1-p)+'px');
 el.style.setProperty('--edge-round',(10+18*p)+'px');
 el.style.setProperty('--edge-inner-round',(8+18*p)+'px');
 el.style.setProperty('--edge-blue',(16*(1-p)*(1-p))+'px');
 el.style.setProperty('--edge-copy',clamp((p-.18)*1.55));
 el.style.setProperty('--edge-stripe',1-p);
 el.dataset.side=side;
}

export function installEdgeLauncher({root,getPage,getSide,available,open}){
 const handle=document.createElement('button');handle.type='button';handle.className='operation-edge';handle.hidden=true;
 handle.setAttribute('aria-haspopup','dialog');handle.innerHTML='<span aria-hidden="true"></span>';
 const preview=document.createElement('div');preview.className='edge-preview';preview.hidden=true;preview.inert=true;
 preview.setAttribute('aria-hidden','true');preview.innerHTML='<div class="edge-preview-head">Новая операция</div><div class="operation-choices">'+['expense','income','transfer'].map((kind,i)=>`<div><span class="${kind}">${icon(kind)}</span><span>${['Расход','Доход','Перевод'][i]}</span></div>`).join('')+'</div><span class="edge-stripe" aria-hidden="true"></span>';
 let gesture=null,suppressed=0,frame=0;
 const visible=()=>available()&&getPage()!=='Главная'&&!document.hidden&&!document.body.classList.contains('keyboard-open')&&!document.activeElement?.matches('input,textarea,select,[contenteditable=true]')&&(!activeSurface()||activeSurface().classList.contains('large'));
 function refresh(){frame=0;const side=getSide();handle.dataset.side=side;handle.setAttribute('aria-label','Новая операция: потяните '+(side==='left'?'вправо':'влево')+' или нажмите');const host=activeSurface()||document.body;if(handle.parentNode!==host)host.append(handle);handle.hidden=!visible();}
 function schedule(){if(!frame)frame=requestAnimationFrame(refresh);}
 function reset(){gesture=null;preview.hidden=true;preview.remove();handle.style.removeProperty('opacity');}
 function start(e){if(!e.isPrimary||e.button!==0||!visible())return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,p:0};handle.setPointerCapture(e.pointerId);}
 function move(e){if(!gesture||gesture.id!==e.pointerId)return;const dx=(getSide()==='left'?1:-1)*(e.clientX-gesture.x),dy=Math.abs(e.clientY-gesture.y);if(dy>35&&dx<12){reset();return;}if(dx<5)return;e.preventDefault();
  if(!preview.isConnected)(activeSurface()||document.body).append(preview);
  preview.hidden=false;gesture.p=clamp(dx/Math.max(1,preview.offsetWidth-18));
  paint(preview,gesture.p,getSide());handle.style.opacity='0';
 }
 function end(e){if(!gesture||gesture.id!==e.pointerId)return;const g=gesture,dx=(getSide()==='left'?1:-1)*(e.clientX-g.x),dy=Math.abs(e.clientY-g.y);reset();suppressed=performance.now()+380;if(dx>=38||Math.abs(dx)<8&&dy<12){handle.hidden=true;open(true,g.p);}schedule();}
 handle.addEventListener('pointerdown',start);handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);
 handle.addEventListener('pointercancel',reset);handle.addEventListener('lostpointercapture',reset);
 handle.addEventListener('click',()=>{if(performance.now()<suppressed||!visible())return;handle.hidden=true;open(true,0);schedule();});
 function morph(el,initial,finish){
  const side=getSide();el.classList.add('side-chooser');el.dataset.side=side;
  const stripe=document.createElement('span');stripe.className='edge-stripe';stripe.setAttribute('aria-hidden','true');el.append(stripe);
  let p=clamp(initial),raf=0,closing=false,drag=null;
  function draw(){paint(el,p,side);const interactive=p>=.98&&!closing;el.querySelectorAll('[data-new],.sheet-close').forEach(b=>{b.tabIndex=interactive?0:-1;});}
  function settle(target){cancelAnimationFrame(raf);const from=p,start=performance.now(),duration=reduced()?0:380*Math.max(.35,Math.abs(target-from));
   function tick(t){p=duration?from+(target-from)*(1-Math.pow(1-clamp((t-start)/duration),3)):target;draw();if(Math.abs(p-target)>.001)raf=requestAnimationFrame(tick);else{p=target;draw();if(closing)finish();}}
   raf=requestAnimationFrame(tick);
  }
  function collapse(){if(closing)return;closing=true;el.style.pointerEvents='none';settle(0);}
  el.finrateBack=()=>{collapse();return true;};
  el.addEventListener('pointerdown',e=>{if(closing||!e.isPrimary||e.button!==0||e.target.closest('.sheet-close,[data-new]'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,p,moved:false,t:performance.now()};el.setPointerCapture(e.pointerId);cancelAnimationFrame(raf);});
  el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=(side==='left'?1:-1)*(e.clientX-drag.x),dy=Math.abs(e.clientY-drag.y);if(dy>35&&Math.abs(dx)<12){drag=null;settle(1);return;}if(Math.abs(dx)>5)drag.moved=true;p=clamp(drag.p+dx/Math.max(1,el.offsetWidth-18));draw();if(drag.moved)e.preventDefault();});
  el.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=(side==='left'?1:-1)*(e.clientX-drag.x),tap=!drag.moved&&Math.abs(dx)<8;let target=tap?1:p>=.5?1:0;if(!tap&&Math.abs(dx)>42&&performance.now()-drag.t<350)target=dx>0?1:0;drag=null;if(target)settle(1);else collapse();});
  el.addEventListener('pointercancel',()=>{drag=null;if(!closing)settle(1);});
  const lifecycle=new AbortController();el.addEventListener('close',()=>{if(el.open)return;cancelAnimationFrame(raf);lifecycle.abort();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){drag=null;cancelAnimationFrame(raf);if(closing)finish();else{p=1;draw();}}},{signal:lifecycle.signal});
  draw();settle(1);
 }
 document.addEventListener('finrate-surface',refresh);document.addEventListener('focusin',schedule);document.addEventListener('focusout',schedule);window.addEventListener('resize',schedule);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();schedule();});
 new MutationObserver(schedule).observe(root,{childList:true,subtree:true});refresh();
 return {morph};
}
