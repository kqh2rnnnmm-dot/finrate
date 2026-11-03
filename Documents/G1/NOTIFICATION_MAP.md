# G1: карта внутренних сообщений

Инвентаризация выполнена до замены общего механизма. Существующие calls не размножены по экранам: семантика события определяется в общем завершении `app.run` по уже подтверждённому состоянию. Ошибки с `error:true` обязательны независимо от уровня/настроек.

| Источник | События | Классификация |
|---|---|---|
| app.setStatus → notifyFeedback | setup/ready, download/restore/preview/cancel, вход, сохранение, SW offline-error | Обычные подтверждения — system; отказ входа/записи/восстановления, защитные guards — required |
| app.run → ui.perform → focus | operation.add/edit, обычный и плановый доход, расход, перевод, возврат, комиссии | Financial только при подлинном изменении операции после commit; снимок реальных полей. Превью/ввод до Save сообщений об успехе не создают |
| ui.perform: cancelRecord/progressRecord | Отмена записи и состояния старого перевода | Financial при изменении фактической записи; дата подписана как дата операции, текущее сохранённое состояние показано отдельно |
| focus / ui: draft.save/delete | Черновик, несколько заполненных форм, возврат с выбором | System, не проведённая финансовая операция; деньги не меняются |
| management | Категория/подкатегория/название/описание/архив/история/statement/начальный долг | System; account.reconcile с отдельной реальной корректировкой — financial; без записи — честный system fallback |
| planning-ui | Режим, план/архив/restore/skip/link/comment/onboarding | System. planning.confirm с созданной фактической операцией — financial. Связь с уже существующим доходом не изображается новым зачислением |
| security-ui → perform → service | security.password/pin/none/password entry | Required даже при master off; прежние inline предупреждения/подтверждения и проверки защиты сохранены |
| focus.error / surfaces.bindFieldEditor | Ввод/валидация/отказ принятия поля | Required; обычные переключатели не скрывают ошибки |
| app.loadSafety / serviceWorker.catch | Отказ чтения версий/отсутствие offline-возможности | Required. Повтор чтения не проводит деньги; form retry проверяет актуальность исходного DOM |
| app.closeBase/resetFromOtherTab/pagehide/reset finished | Очистка временной очереди и UI | Никаких callback автоматически. Блокировка удаляет финансовые сообщения и открытый снимок |

Обычный system — 3000ms чтения, financial — 5000ms; обязательное предупреждение — без таймера. Ожидание анимации/клавиатуры/модали/фона не сокращает время чтения. Критическая очередь приоритетна, обычное сообщение не маскирует ошибку. Таймер/жесты никогда не повторяют финансовую мутацию.

Новые UI-модули: ui-settings.mjs (safe defaults/filter), notification-events.mjs (read-only snapshot). Существующие feedback/feedback-state сохранены как общий механизм. `feedback` не означает форму пользовательской обратной связи.

## Реестр непосредственных notifyFeedback/setStatus

Ниже автоматически выписаны путь/строка и начало исходного вызова; `perform`-маршруты дополнительно классифицированы таблицей выше.

- `Source/src/surfaces.mjs:139: const apply=async()=>{if(busy||!el.open||el.dataset.closing||el.dataset.suspending)return;busy=true;try{const ok=await commit(input.value);if(ok===false){busy=false;return;}if(el.isConnected&&activeSurface()===el)closeSurface(el);}`
- `Source/src/app.mjs:25:const resetUI=createResetUI({app,sheet:ui.sheet,pop:()=>ui.closePanel(activeSurface()),perform:ui.perform,download:blob=>download(blob,fileName('FinRate_backup')),finished:()=>{prepared=null;recovery=null;returnContext=null;forcePassword=`
- `Source/src/app.mjs:36:function setStatus(text,error=false,options={}){status=text;bad=error;if(text||options.resolveError)notifyFeedback(text,{error,...options});}`
- `Source/src/app.mjs:67:  const before=app.document;let ok=false;try{await fn();exists=!!await store.read();await app.entryStatus();ok=true;setStatus(success??'',false,{...completedNotification(before,app.document),resolveError:true});}`
- `Source/src/app.mjs:68:  catch(e){setStatus(messages[e.code]||({LAST_ACCOUNT:'Последний активный счёт нельзя архивировать.',TRANSFER_MAX:'Сумма перевода превышает остаток за вычетом комиссии.',MERGE:'Выберите минимум две категории одного типа.',MERGE_COLLISION:`
- `Source/src/app.mjs:82:  if(get('setup'))get('setup').onsubmit=e=>{e.preventDefault();const v=formData(e.target);if(v.password!==v.repeat){setStatus('Пароли не совпали.',true);return;}run(async()=>{recovery=await app.setup({...v,opening:money(v.opening||'0')});`
- `Source/src/app.mjs:89:  if(get('ready'))get('ready').onclick=()=>{if(!get('key-saved').checked){setStatus('Сначала сохраните ключ и отметьте подтверждение.',true);return;}recovery=null;setStatus('FinRate готов. Сохраните защищённую копию.');render();};`
- `Source/src/app.mjs:100:  if(get('restore-cancel'))get('restore-cancel').onclick=()=>{prepared=null;setStatus('Восстановление отменено. Данные не изменены.');render();};`
- `Source/src/app.mjs:101:  if(get('restore-apply'))get('restore-apply').onclick=()=>{if(prepared.summary.replaces&&(!safetyDownloaded||!get('safety-confirm').checked||get('restore-word').value!=='ВОССТАНОВИТЬ')){setStatus('Скачайте текущую копию, проверьте её со`
- `Source/src/app.mjs:103:async function loadSafety(){try{const rows=await store.safety(),target=get('safety-list');if(!target)return;target.textContent='';if(!rows.length){target.textContent='Страховочных версий пока нет.';return;}for(const row of rows){const p=`
- `Source/src/app.mjs:111:  if(location.protocol!=='file:'&&'serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').then(reg=>ui.watchUpdates(reg)).catch(()=>{setStatus('Ваши данные доступны. Работа без интернета пока недоступна. Повторите запуск`
- `Source/src/focus.mjs:20: function error(el,text){notifyFeedback(text,{error:true});}`
- `Source/src/feedback.mjs:5:export function notifyFeedback(title,options={}){instance?.notify(title,options);}`
- `Source/src/ui.mjs:130:  setStatus('');`
