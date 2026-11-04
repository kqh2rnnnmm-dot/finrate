import{createFeedbackState}from'./feedback-state.mjs';
import{icon}from'./icons.mjs';
import{notificationAllowed}from'./ui-settings.mjs';
let instance=null;
export function notifyFeedback(title,options={}){instance?.notify(title,options);}
export function clearFeedback(){instance?.clear();}
export function installFeedback(root,getSurface,{getSettings=()=>({}),openDetails=()=>{}}={}){
 if(instance)return instance;
 const state=createFeedbackState(),el=document.createElement('section');el.className='feedback-notice';el.dataset.feedback='true';el.dataset.noSwipe='true';el.hidden=true;
 let timer=0,deadline=0,remaining=0,frame=0,displayed=null,gesture=null,animation=null,phase='idle',epoch=0,suppressTap=0,placement=null;
 function releasePlacement(){if(!placement)return;const {head,body,translate,paddingTop}=placement;head.style.translate=translate;if(body)body.style.paddingTop=paddingTop;placement=null;}
 function place(surface){
  releasePlacement();const vv=visualViewport,top=vv?.offsetTop||0,height=vv?.height||innerHeight;
  const safe=Math.max(0,parseFloat(getComputedStyle(el).getPropertyValue('--feedback-safe-top'))||0);
  el.style.maxHeight=Math.max(44,Math.min(height*.45,height-124))+'px';
  const desired=top+Math.max(0,safe-el.offsetHeight);el.style.setProperty('--feedback-top',desired+'px');
  const head=(surface?.classList.contains('large')?surface.querySelector('.sheet-head'):null)||root.querySelector(':scope>header,.auth>header');
  const body=surface?.classList.contains('large')?surface.querySelector('.sheet-body'):root.querySelector('main')||root.querySelector('.auth');
  if(head){const clearance=Math.max(0,desired+el.offsetHeight+10-head.getBoundingClientRect().top);
   if(clearance>0){placement={head,body,translate:head.style.translate,paddingTop:body?.style.paddingTop||''};const padding=body?parseFloat(getComputedStyle(body).paddingTop)||0:0;if(!body?.classList.contains('auth'))head.style.translate='0 '+clearance+'px';if(body)body.style.paddingTop=padding+clearance+'px';}
  }
  el.classList.toggle('feedback-scrollable',el.scrollHeight>el.clientHeight+1);
 }
 const offset=()=>{const value=getComputedStyle(el).translate;return value==='none'?0:parseFloat(value.split(/\s+/).at(-1))||0;};
 function hold(){const y=offset();epoch++;animation?.cancel();animation=null;el.style.translate='0 '+y+'px';return y;}
 function settle(){const y=offset();gesture=null;phase='settle';motion([{translate:'0 '+y+'px'},{translate:'0 0'}],reduced()?80:180,()=>{el.style.removeProperty('translate');phase='idle';resume();});}
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 const outside=()=>-(parseFloat(el.style.getPropertyValue('--feedback-top'))+el.offsetHeight+24)+'px';
 function motion(frames,duration,done){const ticket=++epoch;animation?.cancel();animation=el.animate(frames,{duration,easing:'linear',fill:'both'});animation.finished.then(()=>{if(ticket!==epoch)return;animation.cancel();animation=null;done();},()=>{if(ticket!==epoch)return;animation=null;if(phase==='exit')state.dismiss();phase='idle';displayed=null;refresh();});}
 function enter(){phase='enter';const end=()=>{phase='idle';resume();};
  if(reduced())motion([{opacity:0},{opacity:1}],120,end);
  else motion([{translate:`0 ${outside()}`,offset:0,easing:'cubic-bezier(.25,.12,.28,1)'},{translate:'0 6px',offset:.7,easing:'ease-in-out'},{translate:'0 -3px',offset:.84,easing:'ease-in-out'},{translate:'0 1px',offset:.94,easing:'ease-in-out'},{translate:'0 0',offset:1}],1200,end);
 }
 const stop=()=>{clearTimeout(timer);timer=0;};
 const pause=()=>{if(timer){remaining=Math.max(300,deadline-performance.now());stop();}};
 function suspend(){releasePlacement();pause();const exiting=phase==='exit';epoch++;animation?.cancel();animation=null;phase='idle';gesture=null;el.style.removeProperty('translate');if(exiting){state.dismiss();displayed=null;}el.hidden=true;}
 function available(){const surface=getSurface();const required=state.current?.error||state.current?.mandatory;return !document.hidden&&(required||!document.body.classList.contains('keyboard-open')&&!surface?.classList.contains('field-editor')&&!surface?.querySelector('[data-security-form]'))&&(!surface||surface.classList.contains('large')||state.current?.error&&surface.classList.contains('sheet'));}
 function resume(){stop();if(phase!=='idle'||!state.current||!available()||!state.current.duration||el.matches(':hover')||el.contains(document.activeElement))return;deadline=performance.now()+remaining;timer=setTimeout(dismiss,remaining);}
 function dismiss({from=null,swiped=false}={}){if(!state.current||phase==='exit')return;stop();const start=from===null?hold():from;gesture=null;phase='exit';el.querySelectorAll('button').forEach(b=>b.disabled=true);const end=()=>{el.style.removeProperty('translate');state.dismiss();displayed=null;phase='idle';refresh();};
  if(el.hidden){epoch++;animation?.cancel();animation=null;end();return;}
  if(reduced())motion([{translate:'0 '+start+'px',opacity:1},{translate:'0 '+start+'px',opacity:0}],100,end);
  else if(swiped)motion([{translate:'0 '+start+'px',easing:'cubic-bezier(.2,0,.35,1)'},{translate:`0 ${outside()}`}],240,end);
  else motion([{translate:'0 '+start+'px',offset:0,easing:'cubic-bezier(.3,0,.6,1)'},{translate:'0 7px',offset:.24,easing:'cubic-bezier(.45,0,.55,1)'},{translate:'0 -4px',offset:.44,easing:'cubic-bezier(.4,0,.55,1)'},{translate:`0 ${outside()}`,offset:1}],900,end);
 }
 function paint(){const item=state.current;displayed=item;remaining=item.duration;
  el.replaceChildren();el.dataset.level=item.level||'system';el.classList.toggle('feedback-error',!!item.error);el.classList.toggle('feedback-required',!!(item.error||item.mandatory));el.classList.toggle('feedback-financial',item.level==='financial');el.tabIndex=item.financial?0:-1;el.setAttribute('aria-label',item.financial?'Открыть подробности: '+item.title:item.title);el.setAttribute('role',item.error?'alert':item.financial?'button':'status');el.setAttribute('aria-live',item.error?'assertive':'polite');el.setAttribute('aria-atomic','true');
  const mark=document.createElement('span');mark.className='feedback-mark';mark.setAttribute('aria-hidden','true');mark.innerHTML=icon(item.error?'close':'check');
  const text=document.createElement('div');text.className='feedback-copy';const title=document.createElement('strong');title.textContent=item.title;text.append(title);
  if(item.detail){const detail=document.createElement('span');detail.textContent=item.detail;text.append(detail);}
  if(item.action){const action=document.createElement('button');action.type='button';action.className='feedback-action';action.textContent=item.actionLabel||'Повторить';action.onclick=()=>{const run=item.action;dismiss();run();};text.append(action);}
  const close=document.createElement('button');close.type='button';close.className='icon-button feedback-close';close.setAttribute('aria-label','Закрыть уведомление');close.innerHTML=icon('close');close.onclick=dismiss;el.append(mark,text);if(!item.financial)el.append(close);
 }
 function refresh(){frame=0;state.filter(item=>notificationAllowed(item,getSettings()));if(!state.current){releasePlacement();el.hidden=true;el.remove();displayed=null;return;}
  if(!available()){releasePlacement();pause();el.hidden=true;return;}
  const surface=getSurface(),host=surface||document.body;if(el.parentNode!==host)host.append(el);el.inert=false;
  const changed=displayed!==state.current;if(changed){stop();epoch++;animation?.cancel();animation=null;phase='idle';gesture=null;el.style.removeProperty('translate');paint();}
  const action=el.querySelector('.feedback-action');if(action)action.disabled=!!state.current.actionAvailable&&!state.current.actionAvailable();
  const wasHidden=el.hidden;el.hidden=false;
  place(surface);
  if(changed)enter();else if(wasHidden||!timer)resume();
 }
 function expand(){releasePlacement();const item=state.current;if(!item?.financial)return;stop();epoch++;animation?.cancel();animation=null;phase='idle';gesture=null;state.dismiss();displayed=null;el.remove();el.hidden=true;openDetails(item);refresh();}
 el.addEventListener('click',e=>{if(!e.target.closest('button')&&performance.now()>suppressTap&&state.current?.financial)expand();});
 el.addEventListener('keydown',e=>{if(e.target===el&&['Enter',' '].includes(e.key)&&state.current?.financial){e.preventDefault();expand();}});
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(refresh);};
 el.addEventListener('pointerenter',pause);el.addEventListener('pointerleave',resume);el.addEventListener('focusin',pause);el.addEventListener('focusout',()=>queueMicrotask(resume));
 el.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||phase==='exit'||gesture||e.isPrimary===false||el.classList.contains('feedback-scrollable'))return;
  const base=hold();phase='drag';gesture={id:e.pointerId,x:e.clientX,y:e.clientY,base,at:performance.now()};pause();el.setPointerCapture(e.pointerId);
 });
 el.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId)el.style.translate='0 '+(gesture.base+Math.min(0,e.clientY-gesture.y))+'px';});
 el.addEventListener('pointerup',e=>{
  if(gesture?.id!==e.pointerId)return;const distance=gesture.y-e.clientY,dx=Math.abs(e.clientX-gesture.x),speed=distance/Math.max(1,performance.now()-gesture.at),from=offset();
  gesture=null;suppressTap=Math.abs(distance)>8||dx>8?performance.now()+400:0;
  if(distance>Math.max(28,el.offsetHeight*.2)||distance>8&&speed>.55)dismiss({from,swiped:true});else settle();
 });
 el.addEventListener('pointercancel',()=>{if(gesture){suppressTap=performance.now()+400;settle();}});
 el.addEventListener('lostpointercapture',()=>{if(gesture)settle();});
 document.addEventListener('finrate-surface',refresh);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else refresh();});
 window.addEventListener('pagehide',suspend);window.addEventListener('pageshow',refresh);
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
 // Root replacement must not remove the live region or change the page's geometry.
 new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
 instance={notify(title,options={}){if(options.resolveError&&state.current?.error){state.dismiss();displayed=null;}if(!title||!notificationAllowed(options,getSettings())){refresh();return;}if(state.push({title,...options}))displayed=null;refresh();},clear(){releasePlacement();stop();epoch++;animation?.cancel();animation=null;phase='idle';gesture=null;el.style.removeProperty('translate');state.clear();el.remove();el.hidden=true;displayed=null;}};
 return instance;
}
