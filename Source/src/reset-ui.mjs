export function createResetUI({app,sheet,pop,perform,download,finished}){
 function verify(){
  let authForm;
  sheet('Подтвердите сброс',`<p>Введите основной пароль или ключ восстановления. PIN-код для сброса не подходит.</p><form data-reset-auth><label>Подтвердить с помощью<select name="mode"><option value="password">Основной пароль</option><option value="recovery">Ключ восстановления</option></select></label><label>Основной пароль или ключ<input type="password" name="secret" autocomplete="off" maxlength="1024" required></label><button type="submit" class="button">Продолжить</button></form>`,el=>{
   const form=authForm=el.querySelector('form');form.onsubmit=e=>{e.preventDefault();const {secret,mode}=form.elements;
    perform(async()=>{const proof=await app.prepareReset(secret.value,mode.value);secret.value='';pop();confirm(proof);},'');
   };
  },{mode:'large',state:()=>'',onBack:()=>authForm?.reset()});
 }
 function confirm(proof){
  sheet('Удалить все данные?',`<p>С этого устройства будут удалены счета, категории, операции, черновики, история изменений, настройки, PIN-код и страховочные копии FinRate в этом браузере.</p><p>Отдельно сохранённые файлы копий и данные на других устройствах останутся. Отменить удаление будет нельзя.</p><div class="stack"><button type="button" class="button danger danger-strong" data-reset-confirm>Удалить все данные</button><button type="button" class="button secondary" data-reset-cancel>Оставить без изменений</button></div>`,el=>{
   el.querySelector('[data-reset-cancel]').onclick=pop;
   el.querySelector('[data-reset-confirm]').onclick=()=>perform(()=>app.resetData(proof,true),'Данные FinRate на этом устройстве удалены.',finished);
  },{mode:'compact',dismiss:true});
 }
 function open(){
  sheet('Сброс данных',`<p>Удаление всех данных FinRate только в этом браузере на этом устройстве. Отдельно сохранённые копии и другие устройства не затрагиваются.</p><p>Перед сбросом можно сохранить защищённую копию. Для удаления потребуется основной пароль или ключ восстановления.</p><div class="stack"><button type="button" class="button" data-reset-backup>Скачать защищённую копию</button><button type="button" class="button danger" data-reset-continue>Продолжить сброс</button></div>`,el=>{
   el.querySelector('[data-reset-backup]').onclick=()=>perform(async()=>download(await app.backup()),'Копия готова. Выберите, куда сохранить её. Проверьте, что она сохранена отдельно.');
   el.querySelector('[data-reset-continue]').onclick=verify;
  },{mode:'large'});
 }
 return {open};
}
