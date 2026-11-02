import {bindFieldEditor,validMoneyInput,signedMoneyField} from './surfaces.mjs';
import {editMoney,compactText} from './ui-values.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createFieldEditor({sheet,pop}){
 function open(title,value,done,{numeric=false,multiline=/примечание|описание|комментарий|заметка/i.test(title),reading=true,signed=false,min=null,max=null,maxLength=multiline?500:100,required=false,onApplyClose=null}={}){
  if(multiline&&reading&&String(value??'').length)return view(title,value,done,{maxLength,required,onApplyClose});
  const original=String(value??''),initial=numeric?editMoney(value):original;
  return sheet(title,`<form class="value-form">${multiline?`<textarea class="field-input" name="value" maxlength="${maxLength}" aria-label="${esc(title)}">${esc(initial)}</textarea>`:`<input class="field-input" name="value" ${numeric?'inputmode="decimal" data-signed="'+signed+'"':'type="text" maxlength="'+maxLength+'"'} value="${esc(initial)}" aria-label="${esc(title)}" autocomplete="off">`}${numeric?'':'<small class="field-count" aria-live="polite"></small>'}</form>`,el=>{
   el.classList.add('field-editor');if(multiline)el.classList.add('note-editor');
   const brand=el.querySelector('.brand-home'),button=document.createElement('button');button.type='button';button.className='text-button field-done';button.textContent=multiline?'Сохранить':'Готово';brand.replaceWith(button);
   const back=el.querySelector('.sheet-back');back.className='text-button sheet-back';back.textContent='Отмена';back.setAttribute('aria-label','Отмена');
   const input=el.querySelector('.field-input');input.value=initial;if(max!==null)input.dataset.max=String(max);
   const valid=()=>{if(!numeric)return !required||!!input.value.trim();if(!input.value)return !required;const n=Number(input.value.replace(',','.'));return validMoneyInput(input.value,{signed})&&new RegExp('^'+(signed?'-?':'')+'\\d{1,12}(?:[.,]\\d{1,2})?$').test(input.value)&&Number.isFinite(n)&&(min===null||n>=min)&&(max===null||n<=max);};
   const {apply}=bindFieldEditor(el,async v=>{if(!valid())return false;const accepted=!numeric&&v===original.replace(/\r\n?/g,'\n')?original:v;const result=await done(accepted);if(result===false)return false;pop();onApplyClose?.();return false;});
   const sync=()=>{button.disabled=!valid();const count=el.querySelector('.field-count');if(count)count.textContent=input.value.length+' / '+maxLength;};input.addEventListener('input',sync);sync();button.onclick=apply;input.focus({preventScroll:true});if(numeric)input.select();
  },{mode:'large'});
 }
 // The original field remains the parent's source of truth. Done changes it;
 // leaving the keyboard never submits the parent form or a financial record.
 const enhanced=new WeakSet();
 function enhance(host){for(const input of host.querySelectorAll('dialog input:not([type]),dialog input[type=text],dialog input[inputmode=decimal],dialog textarea')){
  if(enhanced.has(input)||input.closest('.value-form,.auth,[data-security-form]')||input.readOnly||input.disabled)continue;enhanced.add(input);
  input.readOnly=true;input.setAttribute('aria-haspopup','dialog');input.classList.add('field-launcher');
  const launch=()=>{if(input.closest('dialog')&&!input.closest('dialog').open)return;const title=input.getAttribute('aria-label')||[...input.closest('label')?.childNodes||[]].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()||input.closest('dialog').querySelector('h2').textContent;
   open(title,input.value,value=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));},{numeric:input.inputMode==='decimal',multiline:input.tagName==='TEXTAREA',signed:signedMoneyField(input),required:input.required,maxLength:input.maxLength>0?input.maxLength:input.tagName==='TEXTAREA'?500:100,min:input.dataset.min?Number(input.dataset.min):null,max:input.dataset.max?Number(input.dataset.max):null});};
  input.addEventListener('click',launch);input.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();launch();}});
 }}
 function install(){enhance(document);new MutationObserver(()=>enhance(document)).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('submit',e=>{const empty=[...e.target.querySelectorAll('.field-launcher[required]')].find(x=>!x.value.trim());if(empty){e.preventDefault();e.stopImmediatePropagation();empty.click();}},true);
 }
 function view(title,value,done,options={}){
  let current=String(value??'');
  return sheet(title,`<div class="full-note note-content" tabindex="0">${esc(current)}</div>${done?'<button type="button" class="button" data-note-edit>Редактировать</button>':''}`,el=>{
   el.classList.add('note-viewer');
   el.querySelector('[data-note-edit]')?.addEventListener('click',()=>open(title,current,async next=>{
    if(next===current)return;
    const result=await done(next);if(result===false)return false;
    current=String(next);el.querySelector('.note-content').textContent=current;
   },{...options,multiline:true,reading:false}));
  },{mode:'large',dismiss:true});
 }
 function preview(value){return `<button type="button" class="pick-button note-preview" data-note-view data-note-text="${esc(value)}"><span>Примечание · Просмотреть</span><strong>${esc(compactText(value))}</strong></button>`;}
 return {open,view,preview,install};
}
