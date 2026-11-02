import {activeSurface} from './surfaces.mjs';
import {PRIMARY_TABS} from './interaction.mjs';
import {icon} from './icons.mjs';

// Update once per actual appearance change, not on every scroll/DOM mutation.
export function syncChromeTheme(){
 const html=document.documentElement,color=getComputedStyle(html).backgroundColor;
 const meta=document.querySelector('meta[name=theme-color]');if(meta&&meta.content!==color)meta.content=color;
 const scheme=document.querySelector('meta[name=color-scheme]'),value=html.dataset.theme||'light dark';
 if(scheme&&scheme.content!==value)scheme.content=value;
}
let currentPage='Главная',schedule=()=>{},syncState=()=>{};
export function updateChrome(page){currentPage=page;syncState();schedule();}
export function installChrome(root){
 const make=(cls,label,key)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.hidden=true;b.setAttribute('aria-label',label);b.innerHTML=icon(key);return b;};
 const up=make('scroll-start','В начало списка','expense'),down=make('scroll-end','В конец списка','income'),arrows=[up,down];
 let target=null,frame=0,animation=0,reservation=null;
 const rail=document.createElement('div');rail.className='scroll-compact-controls';rail.dataset.noSwipe='true';
 function release(){if(!reservation)return;const {el,maxHeight,marginTop,marginBottom}=reservation;el.style.maxHeight=maxHeight;el.style.marginTop=marginTop;el.style.marginBottom=marginBottom;rail.remove();reservation=null;}
 function reserve(el,surface){if(reservation?.el===el)return;release();reservation={el,maxHeight:el.style.maxHeight,marginTop:el.style.marginTop,marginBottom:el.style.marginBottom};const height=el.getBoundingClientRect().height;el.style.maxHeight=Math.max(64,height-52)+'px';
  if(el.matches('main,.auth')){rail.classList.add('scroll-compact-fixed');(surface||document.body).append(rail);el.style.marginTop='0px';el.style.marginBottom='52px';}
  else{rail.classList.remove('scroll-compact-fixed');el.after(rail);}
  rail.inert=false;rail.append(...arrows);for(const b of arrows)b.inert=false;
 }
 const visible=el=>el&&el.getClientRects().length&&!el.closest('[hidden]');
 const stop=()=>{if(animation)cancelAnimationFrame(animation);animation=0;};
 const style=(el,key,value)=>{if(el.style[key]!==value)el.style[key]=value;};
 function syncDock(){
  const main=root.querySelector('main'),surface=activeSurface(),dock=!!main&&PRIMARY_TABS.includes(currentPage)&&!surface;
  document.body.classList.toggle('dock-visible',dock);
  const nav=root.querySelector('.bottom');if(nav){nav.inert=!dock;nav.setAttribute('aria-hidden',String(!dock));}
  root.dataset.page=currentPage;return dock;
 }
 syncState=syncDock;
 function update(){
  frame=0;const surface=activeSurface(),main=root.querySelector('main'),auth=root.querySelector('.auth'),nav=root.querySelector('.bottom'),dock=syncDock();
  const head=surface?.querySelector('.sheet-head');if(head)surface.style.setProperty('--sheet-head-height',head.offsetHeight+'px');
  const host=surface||document.body;
  // Native keyboard avoidance owns auth scrolling while editing. A second
  // layout reservation here used to resize the form beneath Safari's caret.
  const editingAuth=auth&&(document.body.classList.contains('keyboard-open')||auth.contains(document.activeElement)&&document.activeElement.matches('input,textarea,select'));
  const candidates=surface?[...surface.querySelectorAll('.picker-results,.merge-options,.part-body,.sheet-body')]:main&&!main.classList.contains('main-home')?[main]:auth&&!editingAuth?[auth]:[];
  const next=candidates.find(el=>visible(el)&&el.clientHeight>30&&el.scrollHeight-el.clientHeight>12&&/auto|scroll/.test(getComputedStyle(el).overflowY));
  if(next!==target){stop();release();target=next;}
  if(!target){release();for(const b of arrows)if(!b.hidden)b.hidden=true;return;}
  const rect=target.getBoundingClientRect(),viewport=window.visualViewport,viewTop=viewport?.offsetTop||0,viewBottom=viewTop+(viewport?.height||innerHeight);
  const island=surface?head:main?root.querySelector(':scope>header'):null,ir=island?.getBoundingClientRect();
  // 32px opaque circles inside 44px targets; short areas get a separate row.
  const start=Math.max(rect.top,viewTop,ir?ir.bottom+14:rect.top+14);
  const nr=dock&&visible(nav)?nav.getBoundingClientRect():null;
  const end=Math.min(rect.bottom,viewBottom-Math.max(40,parseFloat(getComputedStyle(target).paddingBottom)||0),nr?nr.top-14:Infinity);
  const compact=reservation?.el===target||end-start<240;
  if(compact){reserve(target,surface);const r=target.getBoundingClientRect();if(rail.classList.contains('scroll-compact-fixed')){rail.style.top=Math.min(r.bottom+4,viewBottom-48)+'px';rail.style.right=Math.max(16,innerWidth-r.right+12)+'px';}const max=target.scrollHeight-target.clientHeight;
   for(const [i,b]of arrows.entries()){b.hidden=false;const unavailable=i===0?target.scrollTop<=12:max-target.scrollTop<=12;b.dataset.unavailable=String(unavailable);b.disabled=unavailable;b.setAttribute('aria-hidden',String(unavailable));}return;
  }
  release();for(const b of arrows){if(b.parentNode!==host)host.append(b);b.inert=false;delete b.dataset.unavailable;b.disabled=false;b.removeAttribute('aria-hidden');}
  const max=target.scrollHeight-target.clientHeight,hidden=end-start<96;
  const hideUp=hidden||target.scrollTop<=12,hideDown=hidden||max-target.scrollTop<=12;
  if(up.hidden!==hideUp)up.hidden=hideUp;if(down.hidden!==hideDown)down.hidden=hideDown;
  const right=Math.max(20,innerWidth-rect.right+12);
  for(const b of arrows){style(b,'right',right+'px');style(b,'bottom','auto');}
  style(up,'top',start+'px');style(down,'top',end-44+'px');
 }
 schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 function jump(to){stop();if(!target)return;const el=target,from=el.scrollTop,distance=to-from;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){el.scrollTop=to;schedule();return;}
  const begin=performance.now();function tick(time){if(!el.isConnected||el!==target){stop();return;}const p=Math.min(1,(time-begin)/230);el.scrollTop=from+distance*(1-Math.pow(1-p,3));schedule();if(p<1)animation=requestAnimationFrame(tick);else animation=0;}animation=requestAnimationFrame(tick);
 }
 up.addEventListener('click',()=>jump(0));down.addEventListener('click',()=>jump(target?target.scrollHeight-target.clientHeight:0));
 document.addEventListener('pointerdown',stop,{passive:true,capture:true});document.addEventListener('wheel',stop,{passive:true,capture:true});
 document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))stop();});
 document.addEventListener('scroll',schedule,true);
 document.addEventListener('focusin',()=>{if(reservation?.el.matches('.auth'))release();schedule();});
 document.addEventListener('focusout',schedule);
 // Layout reservation must exist before any caller restores scroll/focus.
 document.addEventListener('finrate-surface',()=>{syncDock();schedule();});
 document.addEventListener('finrate-theme',()=>{syncChromeTheme();schedule();});
 document.addEventListener('finrate-scroll-reset',stop);
 const resized=()=>{release();schedule();};window.addEventListener('resize',resized);
 window.visualViewport?.addEventListener('resize',resized);window.visualViewport?.addEventListener('scroll',schedule);
 let viewportValue=document.documentElement.style.getPropertyValue('--viewport-height');new MutationObserver(()=>{const value=document.documentElement.style.getPropertyValue('--viewport-height');if(value!==viewportValue){viewportValue=value;release();schedule();}}).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
 const observer=new MutationObserver(records=>{if(records.some(r=>!arrows.some(b=>r.target===b||b.contains(r.target))))schedule();});
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
 new ResizeObserver(schedule).observe(root);
 syncChromeTheme();
 schedule();
}
