import{createFeedbackState}from'./feedback-state.mjs';
import{icon}from'./icons.mjs';
let instance=null;
export function notifyFeedback(title,options={}){instance?.notify(title,options);}
export function clearFeedback(){instance?.clear();}
export function installFeedback(root,getSurface){
 if(instance)return instance;
 const state=createFeedbackState(),el=document.createElement('section');el.className='feedback-notice';el.dataset.feedback='true';el.dataset.noSwipe='true';el.hidden=true;
 let timer=0,deadline=0,remaining=0,frame=0,displayed=null,gesture=null,animation=null,phase='idle',epoch=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 const outside=()=>-(parseFloat(el.style.getPropertyValue('--feedback-top'))+el.offsetHeight+24)+'px';
 function motion(frames,duration,done){const ticket=++epoch;animation?.cancel();animation=el.animate(frames,{duration,easing:'linear',fill:'both'});animation.finished.then(()=>{if(ticket!==epoch)return;animation.cancel();animation=null;done();},()=>{if(ticket!==epoch)return;animation=null;if(phase==='exit')state.dismiss();phase='idle';displayed=null;refresh();});}
 function enter(){phase='enter';const end=()=>{phase='idle';resume();};
  if(reduced())motion([{opacity:0},{opacity:1}],120,end);
  else motion([{translate:`0 ${outside()}`,offset:0,easing:'cubic-bezier(.25,.12,.28,1)'},{translate:'0 6px',offset:.7,easing:'ease-in-out'},{translate:'0 -3px',offset:.84,easing:'ease-in-out'},{translate:'0 1px',offset:.94,easing:'ease-in-out'},{translate:'0 0',offset:1}],1200,end);
 }
 const stop=()=>{clearTimeout(timer);timer=0;};
 const pause=()=>{if(timer){remaining=Math.max(300,deadline-performance.now());stop();}};
 function suspend(){pause();const exiting=phase==='exit';epoch++;animation?.cancel();animation=null;phase='idle';gesture=null;el.style.removeProperty('translate');if(exiting){state.dismiss();displayed=null;}el.hidden=true;}
 function available(){const surface=getSurface();return !document.hidden&&(!surface||surface.classList.contains('large')||state.current?.error&&surface.classList.contains('sheet'));}
 function resume(){stop();if(phase!=='idle'||!state.current||!available()||el.matches(':hover')||el.contains(document.activeElement))return;deadline=performance.now()+remaining;timer=setTimeout(dismiss,remaining);}
 function dismiss(){if(!state.current||phase==='exit')return;stop();phase='exit';el.querySelectorAll('button').forEach(b=>b.disabled=true);const end=()=>{state.dismiss();displayed=null;phase='idle';refresh();};
  if(el.hidden){epoch++;animation?.cancel();animation=null;end();return;}
  if(reduced())motion([{opacity:1},{opacity:0}],100,end);
  else motion([{translate:'0 0',offset:0,easing:'cubic-bezier(.3,0,.6,1)'},{translate:'0 7px',offset:.24,easing:'cubic-bezier(.45,0,.55,1)'},{translate:'0 -4px',offset:.44,easing:'cubic-bezier(.4,0,.55,1)'},{translate:`0 ${outside()}`,offset:1}],900,end);
 }
 function paint(){const item=state.current;displayed=item;remaining=item.duration;
  el.replaceChildren();el.classList.toggle('feedback-error',!!item.error);el.setAttribute('role',item.error?'alert':'status');el.setAttribute('aria-live',item.error?'assertive':'polite');el.setAttribute('aria-atomic','true');
  const mark=document.createElement('span');mark.className='feedback-mark';mark.setAttribute('aria-hidden','true');mark.innerHTML=icon(item.error?'close':'check');
  const text=document.createElement('div');text.className='feedback-copy';const title=document.createElement('strong');title.textContent=item.title;text.append(title);
  if(item.detail){const detail=document.createElement('span');detail.textContent=item.detail;text.append(detail);}
  if(item.action){const action=document.createElement('button');action.type='button';action.className='feedback-action';action.textContent=item.actionLabel||'Повторить';action.onclick=()=>{const run=item.action;dismiss();run();};text.append(action);}
  const close=document.createElement('button');close.type='button';close.className='icon-button feedback-close';close.setAttribute('aria-label','Закрыть уведомление');close.innerHTML=icon('close');close.onclick=dismiss;el.append(mark,text,close);
 }
 function refresh(){frame=0;if(!state.current){el.hidden=true;el.remove();displayed=null;return;}
  if(!available()){pause();el.hidden=true;return;}
  const surface=getSurface(),host=surface||document.body;if(el.parentNode!==host)host.append(el);el.inert=false;
  const changed=displayed!==state.current;if(changed){stop();epoch++;animation?.cancel();animation=null;phase='idle';paint();}
  const wasHidden=el.hidden;el.hidden=false;
  const header=(surface?.classList.contains('large')?surface.querySelector('.sheet-head'):null)||root.querySelector(':scope>header,.auth>header'),vv=visualViewport,top=vv?.offsetTop||0,height=vv?.height||innerHeight;
  const desired=Math.max(top+10,(header?.getBoundingClientRect().bottom||top+62)+10);
  el.style.setProperty('--feedback-top',Math.max(top+10,Math.min(desired,top+height-el.offsetHeight-12))+'px');
  if(changed)enter();else if(wasHidden||!timer)resume();
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(refresh);};
 el.addEventListener('pointerenter',pause);el.addEventListener('pointerleave',resume);el.addEventListener('focusin',pause);el.addEventListener('focusout',()=>queueMicrotask(resume));
 el.addEventListener('pointerdown',e=>{if(e.target.closest('button')||phase!=='idle')return;gesture={id:e.pointerId,y:e.clientY};pause();el.setPointerCapture(e.pointerId);});
 el.addEventListener('pointermove',e=>{if(gesture?.id===e.pointerId)el.style.translate='0 '+Math.min(0,e.clientY-gesture.y)+'px';});
 el.addEventListener('pointerup',e=>{if(gesture?.id!==e.pointerId)return;const distance=gesture.y-e.clientY;gesture=null;el.style.removeProperty('translate');if(distance>28)dismiss();else resume();});
 el.addEventListener('pointercancel',()=>{gesture=null;el.style.removeProperty('translate');resume();});
 document.addEventListener('finrate-surface',refresh);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else refresh();});
 window.addEventListener('pagehide',suspend);window.addEventListener('pageshow',refresh);
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
 // Root replacement must not remove the live region or change the page's geometry.
 new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
 instance={notify(title,options={}){if(state.push({title,...options}))displayed=null;refresh();},clear(){stop();epoch++;animation?.cancel();animation=null;phase='idle';gesture=null;el.style.removeProperty('translate');state.clear();el.remove();el.hidden=true;displayed=null;}};
 return instance;
}
