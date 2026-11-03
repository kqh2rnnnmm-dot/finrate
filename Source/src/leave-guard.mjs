// These snapshots live only while a form is open. They are never persisted/logged.
export function fieldSnapshot(host){return JSON.stringify([...host.querySelectorAll('input,select,textarea')].filter(e=>!e.matches('input[type=search]')).map((e,i)=>{
 const key=e.name||e.id||e.dataset.mergeId||e.dataset.childName||String(i);
 return [key,e.type==='checkbox'||e.type==='radio'?e.checked:e.type==='file'?[...e.files].map(f=>[f.name,f.size,f.lastModified]):e.value];
}));}
export function bindOutsideDismiss(el,request){
 let start=null,ready=false;
 const outside=e=>{const r=el.getBoundingClientRect();return e.target===el&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);};
 el.addEventListener('pointerdown',e=>{ready=false;if(e.button!==0||!outside(e)){start=null;return;}start={id:e.pointerId,x:e.clientX,y:e.clientY};el.dataset.dismissPointer='true';e.preventDefault();e.stopPropagation();});
 el.addEventListener('pointerup',e=>{const p=start;start=null;delete el.dataset.dismissPointer;ready=!!(p&&p.id===e.pointerId&&outside(e)&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<10);if(ready){e.preventDefault();e.stopPropagation();}});
 // Consume the final click before removing the modal. Nothing underneath can
 // become a new click target between pointerup and click (notably on touch).
 el.addEventListener('click',e=>{if(!outside(e))return;e.preventDefault();e.stopImmediatePropagation();if(ready){ready=false;request();}});
 el.addEventListener('pointercancel',()=>{start=null;ready=false;delete el.dataset.dismissPointer;});
}
