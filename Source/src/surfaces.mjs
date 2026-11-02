import{notifyFeedback}from'./feedback.mjs';
/* One native modal at a time. Suspended panels keep their DOM and scroll state. */
const surfaces=[];
let pointerControl=null,pointerAt=0,viewportFrame=0,keyboardWasOpen=false,revealInput=false;
const editable=el=>el?.matches?.('input:not([type=checkbox]):not([type=range]):not([type=file]),textarea');
export function activeSurface(){return surfaces.at(-1)?.el||null;}
const isolated=new Map();
function isolateActiveSurface(){
 for(const [el,wasInert]of isolated)el.inert=wasInert;isolated.clear();
 const top=activeSurface();if(!top)return;top.inert=false;
 // Block every sibling along the active surface's ancestor path. This also
 // isolates custom hold menus inside a native dialog without disabling them.
 for(let branch=top;branch&&branch!==document.body;branch=branch.parentElement){
  for(const sibling of branch.parentElement?.children||[]){if(sibling===branch||!(sibling instanceof HTMLElement)||sibling.matches('script,style,link'))continue;isolated.set(sibling,sibling.inert);sibling.inert=true;}
 }
}
function sync(){isolateActiveSurface();document.body.classList.toggle('surface-open',!!surfaces.length);document.dispatchEvent(new Event('finrate-surface'));}
export function openSurface(el){
 const previous=surfaces.at(-1);
 if(el.dataset.surfaceOverlay){const host=previous?.el||document.body;host.append(el);el.setAttribute('open','');surfaces.push({el,overlay:true,scroll:0});sync();return;}
 if(previous){previous.scroll=previous.el.querySelector('.sheet-body')?.scrollTop||0;previous.el.dataset.suspending='true';previous.el.close();previous.el.inert=true;delete previous.el.dataset.suspending;}
 surfaces.push({el,scroll:0});if(!el.isConnected)document.body.append(el);el.inert=false;el.showModal();sync();
}
export function closeSurface(el){
 const i=surfaces.findIndex(row=>row.el===el);if(i<0){el?.remove();return;}
 const wasTop=i===surfaces.length-1;el.dataset.closing='true';const row=surfaces.splice(i,1)[0];if(!row.overlay)el.close();el.remove();
 if(wasTop&&!row.overlay){const previous=surfaces.at(-1);if(previous){previous.el.inert=false;if(!previous.el.open)previous.el.showModal();const scroll=previous.el.querySelector('.sheet-body');previous.el.querySelector('.sheet-back,button')?.focus({preventScroll:true});if(scroll)scroll.scrollTop=previous.scroll;}}
 sync();
}
export function clearSurfaces(){while(surfaces.length)closeSurface(surfaces.at(-1).el);}
// A resumed iOS page can retain our stack while WebKit has dropped its native
// dialog from the top layer. Restore the actual top before it can leave the app inert.
function restoreSurface(){
 if(document.hidden||!surfaces.length)return;
 while(surfaces.length&&!surfaces.at(-1).el.isConnected)surfaces.pop();
 const top=surfaces.at(-1);if(top&&!top.overlay&&!top.el.open){top.el.inert=false;top.el.showModal();}
 sync();
}
if(typeof document!=='undefined'){
 document.addEventListener('visibilitychange',restoreSurface);
 window.addEventListener('pageshow',restoreSurface);
}

// Reject the invalid insertion instead of silently changing pasted money (1e3 → 13).
export function validMoneyInput(value,{signed=false}={}){return (signed?/^-?\d{0,12}(?:[.,]\d{0,2})?$/:/^\d{0,12}(?:[.,]\d{0,2})?$/).test(value);}
export function signedMoneyField(el){return el.dataset.signed==='true'||el.name==='opening'||el.name==='amount'&&!!el.closest('#account-reconcile-form');}
const numeric=el=>el?.matches?.('input[inputmode=decimal]');
const moneyState=new WeakMap();
function remember(el){moneyState.set(el,{value:el.value,start:el.selectionStart,end:el.selectionEnd});}
function validInput(el,value){return validMoneyInput(value,{signed:signedMoneyField(el)})&&(!el.dataset.max||value===''||Number(value.replace(',','.'))<=Number(el.dataset.max));}
function keepInputVisible(el){
 const area=el.closest('.sheet-body,main,.auth');if(!area)return;const r=el.getBoundingClientRect(),a=area.getBoundingClientRect(),vv=window.visualViewport;
 const top=Math.max(a.top,vv?.offsetTop||0)+12,bottom=Math.min(a.bottom,(vv?.offsetTop||0)+(vv?.height||innerHeight))-16;
 const submit=el.closest('.auth #unlock-pin,.auth #unlock')?.querySelector('[type=submit]')?.getBoundingClientRect();
 const fieldBottom=submit&&submit.bottom-r.top<=bottom-top?submit.bottom:r.bottom;
 if(fieldBottom>bottom)area.scrollTop+=fieldBottom-bottom;
 else if(r.top<top)area.scrollTop+=r.top-top;
}
export function updateViewport(reveal=true){
 revealInput||=reveal!==false;
 cancelAnimationFrame(viewportFrame);viewportFrame=requestAnimationFrame(()=>{
  const vv=window.visualViewport,height=vv?.height||innerHeight,top=vv?.offsetTop||0,keyboardOpen=height<innerHeight*.8;
  document.documentElement.style.setProperty('--viewport-height',height+'px');document.documentElement.style.setProperty('--viewport-top',top+'px');
  document.body.classList.toggle('keyboard-open',keyboardOpen);
  const active=document.activeElement;
  if(keyboardWasOpen&&!keyboardOpen&&active?.closest('[data-field-editor]'))active.blur();
  keyboardWasOpen=keyboardOpen;const ensureVisible=revealInput;revealInput=false;
  // A keyboard resize/focus reveals the field once. Viewport panning must
  // remain under the user's control instead of snapping back to the caret.
  if(ensureVisible&&editable(active))keepInputVisible(active);
 });
}
// Safari's native history swipe is not reliably stopped by overscroll-behavior.
// Reserve only the outer 12px gesture gutter; content scroll, selection and pinch stay native.
export function isViewportEdgeTouch(event,width){
 if(event.touches?.length!==1)return false;
 const x=event.touches[0].clientX;return x<=12||x>=width-12;
}
export function installInputBehavior(){
 document.addEventListener('touchstart',e=>{if(e.cancelable&&isViewportEdgeTouch(e,innerWidth))e.preventDefault();},{passive:false,capture:true});
 document.addEventListener('keydown',e=>{if(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown','Escape','ContextMenu'].includes(e.key)||e.shiftKey&&e.key==='F10')document.body.classList.add('keyboard-navigation');},true);document.addEventListener('pointerdown',()=>document.body.classList.remove('keyboard-navigation'),true);
 document.addEventListener('pointerdown',e=>{pointerControl=e.target.closest('button,a,select,input[type=date],input[type=file]');pointerAt=performance.now();
  // Keep the target in place until its click; hiding the keyboard on pointerdown
  // can move a mobile button out from under the finger and lose the first tap.
  if(pointerControl?.matches('button')&&editable(document.activeElement)&&pointerControl.closest('dialog')===document.activeElement.closest('dialog'))e.preventDefault();
 },true);
 document.addEventListener('focusin',e=>{if(numeric(e.target)){if(validInput(e.target,e.target.value))remember(e.target);e.target.enterKeyHint='done';}if(editable(e.target))updateViewport();});
 document.addEventListener('beforeinput',e=>{
  const el=e.target;if(!numeric(el)||e.isComposing||!e.inputType.startsWith('insert'))return;remember(el);if(e.data===null)return;
  const start=el.selectionStart??el.value.length,end=el.selectionEnd??start,next=el.value.slice(0,start)+e.data+el.value.slice(end);
  if(!validInput(el,next))e.preventDefault();else remember(el);
 },true);
 document.addEventListener('input',e=>{
  const el=e.target;if(!numeric(el)||e.isComposing)return;
  if(validInput(el,el.value))remember(el);else{const old=moneyState.get(el)||{value:'',start:0,end:0};el.value=old.value;try{el.setSelectionRange(old.start,old.end);}catch{}}
 },true);
 document.addEventListener('compositionend',e=>{const el=e.target;if(numeric(el)){if(validInput(el,el.value))remember(el);else{el.value=moneyState.get(el)?.value||'';el.dispatchEvent(new Event('input',{bubbles:true}));}}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&numeric(e.target)){if(!e.target.closest('[data-field-editor]')){e.preventDefault();e.target.blur();}}},true);
 document.addEventListener('click',e=>{const el=e.target;if(el.matches?.('input[type=date]')&&e.isTrusted){try{el.showPicker?.();}catch{/* Native date input remains the fallback. */}}});
 window.visualViewport?.addEventListener('resize',updateViewport);window.visualViewport?.addEventListener('scroll',()=>updateViewport(false));window.addEventListener('resize',updateViewport);updateViewport();
}

/* Single-value editing never posts a financial transaction. Caller owns commit. */
export function bindFieldEditor(el,commit){
 const form=el.querySelector('form'),input=form.querySelector('input,textarea');let busy=false;
 el.dataset.fieldEditor='true';input.setAttribute('aria-label',el.querySelector('h2')?.textContent||'Значение');
 input.enterKeyHint=input.tagName==='TEXTAREA'?'enter':'done';
 const apply=async()=>{if(busy||!el.open||el.dataset.closing||el.dataset.suspending)return;busy=true;try{const ok=await commit(input.value);if(ok===false){busy=false;return;}if(el.isConnected&&activeSurface()===el)closeSurface(el);}catch{busy=false;notifyFeedback('Проверьте введённое значение.',{error:true});}};
 // The caller normally pops its own panel stack after committing.
 form.onsubmit=e=>{e.preventDefault();apply();};
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&input.tagName!=='TEXTAREA'){e.preventDefault();apply();}});
 // Blur and viewport changes never accept or persist text.
 el.finrateApplyValue=apply;
 return {input,apply};
}
