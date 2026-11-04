// Native password-manager hints only. No credential store, synthetic username,
// automatic submit or Credential Management API. Recovery and PIN stay opt-out.
import {icon} from './icons.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function accessField(label,name,{pin=false,length=6,autocomplete='off',minLength=0,full=false}={}){
 return `<label${full?' class="full"':''}>${esc(label)}<span class="security-input"><input type="password" name="${esc(name)}" data-access-secret autocomplete="${autocomplete}" autocapitalize="none" autocorrect="off" spellcheck="false" ${pin?`inputmode="numeric" enterkeyhint="done" maxlength="${length}" class="pin-input"`:`maxlength="1024"${minLength?` minlength="${minLength}"`:''}`} required><button type="button" class="icon-button security-eye" data-eye="${esc(name)}" aria-label="Показать значение" aria-pressed="false">${icon('eye')}</button></span></label>`;
}
function mask(input){input.type='password';const button=input.closest('form')?.querySelector(`[data-eye="${input.name}"]`);button?.setAttribute('aria-label','Показать значение');button?.setAttribute('aria-pressed','false');}
export function clearAccessFields(scope){
 for(const input of scope?.querySelectorAll('input[data-access-secret],input[type=password]')||[]){input.value='';input.defaultValue='';input.removeAttribute('value');mask(input);input.blur();}
}
export function bindAccessFields(form,{currentPassword=false}={}){
 if(!form||form.dataset.accessBound)return;form.dataset.accessBound='true';
 for(const input of form.querySelectorAll('input[type=password]')){input.dataset.accessSecret='';input.autocapitalize='none';input.setAttribute('autocorrect','off');input.spellcheck=false;}
 form.querySelectorAll('[data-eye]').forEach(button=>button.addEventListener('click',()=>{const input=form.elements[button.dataset.eye];if(!input)return;input.type=input.type==='password'?'text':'password';button.setAttribute('aria-label',input.type==='password'?'Показать значение':'Скрыть значение');button.setAttribute('aria-pressed',String(input.type==='text'));}));
 const secret=form.elements.secret,mode=form.elements.mode;
 if(secret&&mode){const sync=()=>{secret.autocomplete=currentPassword&&mode.value==='password'?'current-password':'off';};sync();mode.addEventListener('change',()=>{secret.value='';mask(secret);sync();});}
}
