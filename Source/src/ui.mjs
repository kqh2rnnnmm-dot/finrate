import {clearAccessFields} from './access-fields.mjs';
import {notificationForm,uiPreferences} from './ui-settings.mjs';
import {createPlanningUI} from './planning-ui.mjs';
import {installHomeLayout} from './home-layout.mjs';
import {creditLedger,operationCredit,isExternal,isExpense} from './credit.mjs';
import {creditMark} from './credit-ui.mjs';
import{createActivityUI}from'./activity-ui.mjs';
import{createSecurityUI}from'./security-ui.mjs';
import {installTextLayout} from './text-layout.mjs';
import {branchMark,allocationGroups,operationMark} from './category-branch.mjs';
import {createFieldEditor} from './field-editor.mjs';
import {installMoneyPresentation} from './ui-values.mjs';
import {formatMoney,compactText} from './ui-values.mjs';
import {installChrome,updateChrome} from './chrome.mjs';
import {openSurface,closeSurface,clearSurfaces,installInputBehavior,activeSurface} from './surfaces.mjs';
import {totals,money,uid,copy,addCategory,fail,normalized} from './model.mjs';
import {saveOperation,cancelOperation,progressTransfer,refundRemaining,saveDraft,deleteDraft,localDate} from './operations.mjs';
import {PRIMARY_TABS,OPERATION_TYPES,adjacent,navigationTrail,hasInput,createFormBank,swipeDirection} from './interaction.mjs';
import {createFocus} from './focus.mjs';
import {createDashboard} from './dashboard.mjs';
import {createManagement} from './management.mjs';
import {installNavigationGestures} from './navigation.mjs';
import {installEdgeLauncher} from './edge-launcher.mjs';
import {resolveCategory} from './block02.mjs';
import {createListView} from './list-ui.mjs';
import {installContextMenus} from './context-menu.mjs';
import {fieldSnapshot,bindOutsideDismiss} from './leave-guard.mjs';
const names={expense:'Расход',income:'Доход',transfer:'Перевод',refund:'Возврат покупки',adjustment:'Сверка остатка','loan-out':'Выданный долг','loan-in':'Полученный долг','repayment-out':'Возврат долга','repayment-in':'Возврат долга'};
import {icon} from './icons.mjs';
export {icon};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createUI(ctx){
 const {app,root,render,run,setStatus,getPage,goPage}=ctx;
 const d=()=>app.document,amt=n=>formatMoney(n,d()?.currency||'RUB');
 let creditDocument=null,creditState;const ledger=()=>{if(creditDocument!==d()){creditDocument=d();creditState=creditLedger(d());}return creditState;};
 const creditInfo=o=>operationCredit(d(),o.id,ledger());
 const categoryTrail=o=>o.allocations.map(x=>categoryName(x.categoryId)).join(', ');
 const transferRoute=o=>'Откуда: '+accountName(o.accountId)+' · '+(isExternal(o)?'Кому: '+o.recipient:'Куда: '+accountName(o.toAccountId));
 const accountName=id=>d().accounts.find(x=>x.id===id)?.name||'Выберите счёт';
 const categoryName=id=>{const c=resolveCategory(d(),id);return c?((c.parentId?d().categories.find(x=>x.id===c.parentId)?.name+' · ':'')+c.name):'Без категории';};
 let quick=null,quickBank=null,panels=[],trail=[],locked=false,waitingUpdate=null;
 const searchState={query:'',scroll:0,scope:'Главная'};
 const positions=new Map(),queries=new Map();let restoreScroll=null;
 const pendingLeaves=new Map();
 const menuItems=['Счета и кошельки','Категории','Долги','Лимиты','Настройки','Данные и синхронизация','История изменений','Инструкция и FAQ'];
 const fresh=(kind='expense')=>focus.fresh(kind);
 const reset=()=>{quick=null;quickBank=null;};
 installInputBehavior();installMoneyPresentation();installTextLayout();installChrome(root);installHomeLayout(root);
 // One history sentinel; never put forms, search queries or money in browser history.
 // One history sentinel; never put forms, search queries or money in browser history.
 if(location.protocol!=='file:'&&history.state?.finrateBack!==true){history.replaceState({finrateBack:false},'');history.pushState({finrateBack:true},'');}
 window.addEventListener('popstate',e=>{
  if(e.state?.finrateBack!==false||!d()&&!activeSurface())return;
  // Re-arm the same sentinel, truncating its forward entry; never accumulate roots.
  history.pushState({finrateBack:true},'');
  if(activeSurface()||trail.length)back();
 });
 const dirty=hasInput;
 const brand=()=>'<button type="button" class="brand brand-home" aria-label="FinRate — на главную">Fin<span>Rate</span></button>';
 function sheet(title,html,bind,{onBack=null,guard=null,leaveForms=null,focus=false,mode=null,actions=null,create=null,state=null,save=null,discard=null,dismiss=false,refresh=null,entity=null,sensitive=false}={}){
  const el=document.createElement('dialog');el.className='sheet '+(mode||(/<form\b|<textarea\b/i.test(html)?'large':['Сохранить черновик?'].includes(title)?'compact':'large'))+(focus?' focus-sheet':'');el.innerHTML=`<div class="sheet-head">${dismiss?'<h2>'+esc(title)+'</h2><button type="button" class="icon-button sheet-close" aria-label="Закрыть">'+icon('close')+'</button>':`<button type="button" class="icon-button sheet-back" aria-label="Назад">${icon('back')}</button><h2>${esc(title)}</h2>${create?'<button type="button" class="icon-button context-plus" aria-label="'+esc(create.label)+'">'+icon('plus')+'</button>':actions?'<button type="button" class="icon-button sheet-more" aria-label="Другие действия">'+icon('more')+'</button>':brand()}`}</div><div class="sheet-body">${html}</div><div class="sheet-error" role="alert"></div>`;
  const row={el,onBack,guard,leaveForms,focus,refresh,entity,sensitive,state:state||(()=>fieldSnapshot(el)),save,discard};panels.push(row);document.body.classList.toggle('focus-mode',panels.some(p=>p.focus));openSurface(el);el.querySelector('.sheet-back,.sheet-close').onclick=()=>back();el.querySelector('.brand-home')?.addEventListener('click',()=>navigate('Главная',true,true));el.querySelector('.sheet-more')?.addEventListener('click',actions);el.querySelector('.context-plus')?.addEventListener('click',create?.run);el.addEventListener('cancel',e=>{e.preventDefault();back();});bindOutsideDismiss(el,back);bind?.(el);row.initial=row.state();return el;
 }
 function pop(){const row=panels.pop();if(!row)return;if(row.sensitive)clearAccessFields(row.el);closeSurface(row.el);document.body.classList.toggle('focus-mode',panels.some(p=>p.focus));row.onBack?.();}
 function clearSensitive(){const first=panels.findIndex(row=>row.sensitive);if(first>=0)while(panels.length>first)pop();}
 // Every command captures its actual parent, rather than reconstructing a route.
 function captureReturn(){const origins=[...panels],mainScroll=root.querySelector('main')?.scrollTop||0,origin=document.activeElement?.closest('[data-operation],[data-account-view],[data-category-view],[data-result],[data-draft],[data-tile]'),originAttribute=origin&&[...origin.attributes].find(a=>['data-operation','data-account-view','data-category-view','data-result','data-draft','data-tile'].includes(a.name));
  return ({drop=null}={})=>{while(panels.length&&!origins.includes(panels.at(-1)))pop();
   if(drop)while(panels.at(-1)?.entity?.type===drop.type&&panels.at(-1)?.entity?.id===drop.id)pop();
   const parent=panels.at(-1);if(parent?.refresh){const scroll=parent.el.querySelector('.sheet-body')?.scrollTop||0,refresh=parent.refresh;pop();refresh();const body=panels.at(-1)?.el.querySelector('.sheet-body');if(body)body.scrollTop=scroll;}
   restoreScroll=mainScroll;render();reset();if(!panels.length&&originAttribute){const target=[...root.querySelectorAll('['+originAttribute.name+']')].find(el=>el.getAttribute(originAttribute.name)===originAttribute.value);target?.focus({preventScroll:true});}
  };
 }
 const fieldEditor=createFieldEditor({sheet,pop});fieldEditor.install();
 const focus=createFocus({app,sheet,pop,perform,askLeave,captureReturn,fieldEditor});
 const dashboard=createDashboard({app,root,sheet,pop,perform,focus,card,drafts,navigate,captureReturn,openAccount:id=>management.accountView(id)});
 const security=createSecurityUI({app,root,sheet,pop,perform,navigate,closeBase:requestLock});
 const management=createManagement({app,root,sheet,pop,perform,focus,card,render,captureReturn,history:(type,id)=>activity.local(type,id)});
 const lists=createListView({root,document:d,names,categoryName,navigate,back,render,resetPosition:(page='Операции')=>positions.set(page,0)});
 const financial=createPlanningUI({app,sheet,pop,perform,captureReturn,focus});
 focus.setIncomeEntry(financial.entry);
 const activity=createActivityUI({app,root,sheet,pop,notes:fieldEditor,openObject:item=>{if(item.type==='operation')card(item.id);else if(item.type==='account')management.accountView(item.id);else if(item.type==='category')management.categoryView(item.id);else if(item.type==='draft')continueDraft(item.id);else if(item.type==='plan')financial.incomes();else navigate(item.id==='security'?'Пароль и вход':'Настройки');}});
 function requestLock(){
  if(!d()||app.entry.mode==='none'||locked||app.busy)return;
  sheet('Заблокировать доступ?','<p>Для разблокировки потребуется PIN-код или пароль. Данные сохранятся.</p><div class="stack"><button type="button" class="button danger" data-lock-confirm>Заблокировать доступ</button><button type="button" class="button secondary" data-lock-cancel>Отмена</button></div>',el=>{
   el.querySelector('[data-lock-cancel]').onclick=pop;
   el.querySelector('[data-lock-confirm]').onclick=()=>{pop();leavePanels(()=>askLeave(leavingForms(),()=>ctx.closeBase()));};
  },{mode:'compact',dismiss:true});
 }
 function back(){if(locked||app.busy)return;if(contexts.active){contexts.close();return;}const row=panels.at(-1);if(row){if(row.el.finrateBack?.())return;guardRow(row,()=>{if(panels.at(-1)===row){pop();refreshExposed();}});return;}
  if(getPage()==='Счета и кошельки'&&management.backAccounts())return;
  if(getPage()==='Категории'&&management.backCategories())return;
  if(trail.length)navigate(trail.at(-1),false);else if(!PRIMARY_TABS.includes(getPage()))navigate(getPage()==='Меню'?'Главная':'Меню',false);}
 function refreshExposed(){const parent=panels.at(-1);if(!parent?.needsRefresh||!parent.refresh)return;const scroll=parent.el.querySelector('.sheet-body')?.scrollTop||0,refresh=parent.refresh;pop();refresh();const body=panels.at(-1)?.el.querySelector('.sheet-body');if(body)body.scrollTop=scroll;}
 async function perform(fn,text,onSuccess,options={}){const top=panels.at(-1)?.el,host=top||root,afterSave=pendingLeaves.get(host);pendingLeaves.delete(host);if(locked||app.busy)return false;locked=true;
  const disabled=[...document.querySelectorAll('button')].filter(b=>!b.disabled);disabled.forEach(b=>b.disabled=true);
  const scroll=root.querySelector('main')?.scrollTop||0;restoreScroll=scroll;const form=top?.querySelector('form'),retry=form?()=>{if(top.isConnected&&activeSurface()===top&&!locked&&!app.busy)form.requestSubmit();}:null;const ok=await run(fn,text,{...options,...(retry?{action:retry,actionAvailable:()=>top.isConnected&&activeSurface()===top}:{})});locked=false;disabled.filter(b=>b.isConnected).forEach(b=>b.disabled=false);
  if(ok){for(const panel of panels)if(panel.entity)panel.needsRefresh=true;onSuccess?.();afterSave?.();}return ok;
 }
 function feedbackDetails(item){
  if(!d()||!item.financial?.length)return;
  const stages={waiting:'Ожидает отправки',debited:'В пути',sent:'Отправлен',received:'Зачислен',returned:'Возвращён',cancelled:'Отменён'};
  return sheet('Подробности действия',`<p>${esc(item.title)}</p>${item.financial.map(o=>`<section class="financial-receipt"><h3>${esc(o.cancelled?'Отмена · '+o.kind:o.kind)}</h3><dl><dt>Сумма</dt><dd>${esc(o.amount)}</dd><dt>Счёт</dt><dd>${esc(o.account)}</dd>${o.destination?`<dt>Куда / кому</dt><dd>${esc(o.destination)}</dd>`:''}<dt>Дата операции</dt><dd>${esc(o.date)}</dd>${o.stage?`<dt>Состояние</dt><dd>${esc(stages[o.stage]||o.stage)}</dd>`:''}</dl></section>`).join('')}`,el=>{el.dataset.feedbackDetails='true';el.setAttribute('aria-label','Подробности действия');},{mode:'compact',dismiss:true});
 }
 function guardRow(row,done){if(row.guard){row.guard(done);return;}if(row.state()===row.initial){done();return;}saveChanges(row,done);}
 function saveChanges(row,done){const form=row.el.querySelector('form'),button=row.el.querySelector('[data-save-changes]'),save=row.save||row.el.finrateApplyValue|| (form?()=>form.requestSubmit():button?()=>button.click():null);
  sheet('Сохранить изменения?',`<p>Вы изменили данные. Сохраните их перед выходом или продолжите редактирование.</p><div class="stack">${save?'<button type="button" class="button" data-leave="save">Сохранить изменения</button>':''}<button type="button" class="button danger" data-leave="discard">Выйти без сохранения</button><button type="button" class="button secondary" data-leave="continue">Продолжить</button></div>`,el=>{
   el.dataset.leaveConfirm='true';el.querySelector('.brand-home').disabled=true;
   el.querySelector('[data-leave=continue]').onclick=pop;
   el.querySelector('[data-leave=discard]').onclick=()=>{pop();row.discard?.();done();};
   el.querySelector('[data-leave=save]')?.addEventListener('click',()=>{pop();if(form&&!form.reportValidity())return;pendingLeaves.set(row.el,done);const result=save(),finish=()=>{if(pendingLeaves.get(row.el)!==done)return;pendingLeaves.delete(row.el);if(!row.el.isConnected)done();};if(result?.then)result.then(finish,()=>pendingLeaves.delete(row.el));else if(!locked&&!app.busy)finish();});
  },{mode:'compact'});
 }
 function guardPage(done){const form=root.querySelector('#p2-settings');if(!form){done();return;}const settings={...Object.fromEntries(new FormData(form)),...notificationForm(form)},saved={...d().settings,...uiPreferences(d().settings),edgeSide:d().settings.edgeSide||'right'};if(Object.entries(settings).every(([k,v])=>String(saved[k])===String(v))){done();return;}
  saveChanges({el:root,discard:dashboard.clearSettingsDraft},done);
 }
 function leavePanels(done){const row=panels.at(-1);if(row){if(row.el.finrateBack?.())return;guardRow(row,()=>{if(panels.at(-1)===row)pop();leavePanels(done);});}else guardPage(done);}
 function askLeave(input,done){
  const forms=Array.isArray(input)?input:[input].filter(dirty);
  if(!forms.length){done();return;}
  sheet('Сохранить черновик?',`<p>Ты сможешь вернуться к нему позже. Пока запись не сохранена как операция, деньги не изменятся.</p>${forms.length>1?`<p>Сохранить заполненные формы: ${forms.map(f=>names[f.kind]).join(', ')}.</p>`:''}<div class="stack"><button class="button" data-choice="save">Сохранить черновик</button><button class="button danger" data-choice="discard">Выйти без сохранения</button><button class="button secondary" data-choice="continue">Продолжить</button></div>`,el=>{
   el.dataset.leaveConfirm='true';el.querySelector('.brand-home').disabled=true;
   el.querySelector('[data-choice=continue]').onclick=pop;
   el.querySelector('[data-choice=discard]').onclick=()=>{pop();done();};
   el.querySelector('[data-choice=save]').onclick=()=>perform(()=>app.mutate('draft.save',n=>{for(const f of forms)saveDraft(n,f,f.draftId||uid());}),forms.length>1?'Черновики сохранены на устройстве.':'Черновик сохранён на устройстве.',()=>{pop();done();});
  });
 }
 function leavingForms(){return [...new Set([...(getPage()==='Главная'?quickBank?.filled()||[]:[]),...panels.flatMap(p=>p.leaveForms?.()||[])])];}
 function navigate(target,record=true,homeReset=false,after=null){
  if(locked||app.busy||panels.some(p=>p.el.dataset.leaveConfirm))return;
  if(target===getPage()&&!homeReset){if(panels.length)back();else after?.();return;}
  setStatus('');
  if(target==='Поиск'&&record){search();return;}
  const proceed=()=>{positions.set(getPage(),root.querySelector('main')?.scrollTop||0);trail=homeReset?[]:navigationTrail(trail,getPage(),target,record);while(panels.length)pop();if(getPage()==='Главная'||target==='Главная')reset();if(record&&target==='Счета и кошельки'&&getPage()!==target)management.enterAccounts();if(record&&target==='Категории'&&getPage()!==target)management.enterCategories();restoreScroll=positions.get(target)||0;goPage(target);after?.();};
  leavePanels(()=>askLeave(getPage()==='Главная'?quickBank?.filled()||[]:[],proceed));
 }
 function navigation(cls,items){return `<nav class="${cls}" aria-label="Основные разделы">${items.map(x=>`<button ${cls==='bottom'&&['Главная','Операции'].includes(x)?'data-dock-action="'+esc(x)+'"':''} data-page="${esc(x)}" aria-label="${esc(x)}" ${getPage()===x?'class="active" aria-current="page"':''}>${icon(x)}<span class="nav-label">${esc(x)}</span></button>`).join('')}</nav>`;}
 function operationChooser(side=false,progress=0){if(panels.some(p=>p.focus)||activeSurface()?.dataset.operationChooser)return;sheet('Новая операция',`<div class="operation-choices">${['expense','income','transfer'].map(kind=>`<button type="button" data-new="${kind}"><span class="${kind}" aria-hidden="true">${icon(kind)}</span><span>${names[kind]}</span></button>`).join('')}</div>`,el=>{el.dataset.operationChooser='true';el.setAttribute('aria-label','Новая операция');edgeLauncher.morph(el,progress,()=>{if(panels.at(-1)?.el===el)pop();},side?null:root.querySelector('#operation-add'));el.querySelectorAll('[data-new]').forEach(b=>b.onclick=()=>{const kind=b.dataset.new;pop();focus.start(kind);});},{mode:'compact',dismiss:true});}
 function header(){
  const page=getPage(),home=page==='Главная',primary=PRIMARY_TABS.includes(page),searching=page==='Поиск',filtering=page==='Фильтры операций';
  let title=filtering?'Фильтры':searching?(searchState.scope==='Главная'?'Поиск':searchState.scope):page;
  if(page==='Счета и кошельки'&&management.isArchive())title='Архив счетов';
  if(page==='Категории'&&management.isCategoryArchive())title='Архив категорий';
  const leading=primary?'<button class="icon-button" id="more" aria-label="Меню">'+icon('menu')+'</button>':'<button class="icon-button" id="page-back" aria-label="Назад">'+icon('back')+'</button>';
  const actions=(searching||filtering?'':'<button class="icon-button" id="global-search" aria-label="'+(home?'Поиск':'Поиск: '+esc(page))+'">'+icon('search')+'</button>')
   +(home?'<button class="icon-button operation-plus" id="operation-add" aria-label="Добавить операцию" aria-haspopup="dialog" aria-expanded="false">'+icon('plus')+'</button>':'')
   +(page==='Операции'?`<button class="icon-button ${lists.active()?'filter-on':''}" id="operation-filters" aria-label="Фильтры операций${lists.active()?', включено: '+lists.active():''}">${icon('filters')}</button>`:'')
   +(filtering?'<button type="button" class="icon-button" id="apply-filters" aria-label="Применить фильтры">'+icon('check')+'</button>':'')
   +(page==='Счета и кошельки'&&!management.isArchive()?'<button class="icon-button context-plus" id="account-create" aria-label="Добавить счёт">'+icon('plus')+'</button>':'')
   +(page==='Категории'&&!management.isCategoryArchive()?'<button class="icon-button context-plus" id="category-create" aria-label="Добавить категорию">'+icon('plus')+'</button>':'');
  const content=!d()?'<div class="brand">Fin<span>Rate</span></div>':`${leading}${home?brand():`<h1>${esc(title)}</h1>`}<div class="header-actions">${actions}</div>`;
  return `<header>${content}</header>${waitingUpdate?'<div class="update-banner">Доступно обновление <button id="apply-update">Обновить</button></div>':''}`;
 }
 function home(){return dashboard.home();}
 function operations(){return `${lists.summary()}<div id="history-results">${historyRows()}</div>`;}
 function operationTitle(o){return o.kind==='transfer'?'Перевод':compactText(o.note)||[...new Set(o.allocations.map(x=>{const c=resolveCategory(d(),x.categoryId);return c?.parentId?d().categories.find(p=>p.id===c.parentId)?.name:c?.name||'Без категории';}))].join(', ')||names[o.kind];}
 function row(o){return `<button class="operation-row ${o.cancelled?'cancelled':''}" data-operation="${esc(o.id)}"><span class="op-icon ${o.kind}">${icon(o.kind==='expense'?'expense':o.kind==='income'||o.kind==='refund'?'income':'transfer')}</span><span class="op-description"><strong>${esc(operationTitle(o))}</strong><small>${esc(o.date)} · ${esc(o.kind==='transfer'?transferRoute(o):accountName(o.accountId))}${o.cancelled?' · Отменена':o.pending?' · Ожидает списания':o.stage==='debited'?' · В пути':o.stage==='waiting'?' · Ожидает подтверждения':''}</small>${isExternal(o)?'<small>'+esc(categoryTrail(o))+'</small>':''}${creditInfo(o).borrowed?'<small>'+creditMark(creditInfo(o).borrowed,d().currency)+'</small>':''}</span><span class="op-amount ${isExpense(o)?'expense':o.kind}">${isExpense(o)?'−':o.kind==='income'||o.kind==='refund'?'+':''}${amt(o.amount)}</span></button>`;}
 function historyRows(){const rows=lists.selected();
  return rows.length?rows.map(row).join(''):lists.active()?'<div class="empty"><strong>Ничего не найдено</strong><p>Измените условия или сбросьте фильтры.</p><button type="button" class="button secondary" data-reset-applied>Сбросить фильтры</button></div>':'<div class="empty"><strong>Операций пока нет в этом списке</strong>Добавьте расход, доход или перевод на главной.</div>';}
 function card(id){const o=d().operations.find(x=>x.id===id);if(!o)return;let detail;detail=sheet(names[o.kind],`<p class="card-amount ${o.kind}">${amt(o.amount)}</p>${o.note?fieldEditor.preview(o.note):`<p>${esc(operationTitle(o))}</p>`}<dl><dt>Дата</dt><dd>${esc(o.date)}</dd><dt>${o.kind==='transfer'?'Откуда':'Счёт'}</dt><dd>${esc(accountName(o.accountId))}</dd>${o.kind==='transfer'?`<dt>${isExternal(o)?'Кому':'Куда'}</dt><dd>${esc(isExternal(o)?o.recipient:accountName(o.toAccountId))}</dd><dt>Статус</dt><dd>${{waiting:'Ожидает списания',debited:'В пути',received:'Зачислен',returned:'Возвращён отправителю'}[o.stage]||'Зачислен'}</dd>${o.debitDate?`<dt>Списано</dt><dd>${o.debitDate}</dd>`:''}${o.creditDate?`<dt>Зачислено</dt><dd>${o.creditDate}</dd>`:''}${o.returnDate?`<dt>Возвращено</dt><dd>${o.returnDate}</dd>`:''}`:''}</dl>${allocationGroups(d(),o.allocations,amt)}${creditInfo(o).borrowed?'<p>'+creditMark(creditInfo(o).borrowed,d().currency)+' · кредитные средства</p>':''}${creditInfo(o).repaid?'<p>Погашено кредитного долга: '+amt(creditInfo(o).repaid)+'</p>':''}${o.kind==='transfer'&&o.balanceSnapshot?transferBalances(o):''}${o.refundChoice?'<p class="hint">Излишек возврата: '+(o.refundChoice==='keep'?'оставлен на кредитке':'фактически выведено '+amt(o.refundWithdrawAmount||0))+'</p>':''}${o.referenceId?'<p class="hint">Связанное событие; учитывается один раз.</p>':''}${o.kind==='transfer'&&d().operations.find(x=>x.referenceId===id&&x.kind==='expense')?`<p>Комиссия: ${amt(d().operations.find(x=>x.referenceId===id&&x.kind==='expense').amount)} · ${o.feeMode==='inside'?'внутри суммы':'дополнительно'}</p>`:''}
  ${o.cancelled?'<p class="message">Запись отменена. История сохранена.</p>':`<div class="stack">${['expense','income','refund','transfer'].includes(o.kind)&&o.stage!=='returned'&&!(o.kind==='expense'&&o.referenceId)?'<button class="button" id="edit-operation">Изменить</button>':''}${o.kind==='expense'&&!o.referenceId?'<button class="button secondary" id="refund-operation">Оформить возврат</button>':''}${o.kind==='transfer'&&o.stage==='waiting'?'<button class="button" data-progress="debit">Подтвердить списание</button>':''}${o.kind==='transfer'&&o.stage==='debited'?'<button class="button" data-progress="credit">Подтвердить зачисление</button><button class="button secondary" data-progress="return">Вернуть отправителю</button>':''}${o.kind==='expense'&&o.referenceId?'<p class="hint">Комиссия отменяется вместе с переводом.</p>':'<button class="button danger" id="cancel-operation">Отменить запись</button>'}</div>`}
  <div class="object-actions"><button class="button secondary" data-object-history>История изменений</button></div>`,el=>{el.querySelector('[data-note-view]')?.addEventListener('click',()=>fieldEditor.view('Примечание',d().operations.find(x=>x.id===id).note,v=>perform(()=>app.mutate('operation.edit',n=>{n.operations.find(x=>x.id===id).note=v;}),'Примечание сохранено.')));
   el.dataset.operationCard=id;el.querySelector('[data-object-history]').onclick=()=>activity.local('operation',id);
   el.querySelector('#edit-operation')?.addEventListener('click',()=>editOperation(id));
   el.querySelector('#refund-operation')?.addEventListener('click',()=>refundOperation(id));
   el.querySelector('#cancel-operation')?.addEventListener('click',()=>cancelRecord(id));
   el.querySelectorAll('[data-progress]').forEach(b=>b.onclick=()=>progressRecord(id,b.dataset.progress,b.textContent));
  },{entity:{type:'operation',id},refresh:()=>card(id)});}
 function transferBalances(o){const s=o.balanceSnapshot;return `<details class="transfer-balance-details"><summary>Остатки на момент записи</summary><dl><dt>${esc(accountName(o.accountId))} · было</dt><dd>${amt(s.fromBefore)}</dd><dt>Стало</dt><dd>${amt(s.fromAfter)}</dd>${!isExternal(o)&&s.toBefore!==null?`<dt>${esc(accountName(o.toAccountId))} · было</dt><dd>${amt(s.toBefore)}</dd><dt>Стало</dt><dd>${amt(s.toAfter)}</dd>`:''}</dl></details>`;}
 function editOperation(id){const o=d().operations.find(x=>x.id===id);if(!o)return;const f=fresh(o.kind),fee=d().operations.find(x=>x.referenceId===o.id&&x.kind==='expense'&&!x.cancelled);Object.assign(f,{id:o.id,amount:String((o.enteredAmount||o.amount)/100),toAccountId:o.toAccountId||'',transferTarget:o.transferTarget||'own',recipient:o.recipient||'',fee:fee?String(fee.amount/100):'',feeMode:o.feeMode||'extra',feeCategoryId:fee?.allocations[0]?.categoryId||'',inTransit:o.stage==='waiting'||o.stage==='debited',categoryId:o.allocations[0]?.categoryId||'',accountId:o.accountId,date:o.date,note:o.note,referenceId:o.referenceId,creditDueDate:o.creditDueDate||'',refundChoice:o.refundChoice||'',refundToAccountId:o.refundToAccountId||'',refundTransferConfirmed:!!o.refundTransferConfirmed,isSplit:o.splitExplicit||o.allocations.length>1,split:o.splitExplicit||o.allocations.length>1?o.allocations.map(x=>({...x,amount:String(x.amount/100)})):[],editId:o.id,editBase:JSON.stringify(o)});editor(f);}
 function refundOperation(id){const o=d().operations.find(x=>x.id===id),remaining=refundRemaining(d(),id).filter(x=>x.amount>0);if(!remaining.length){sheet('Возврат покупки','<p>Покупка уже полностью возвращена.</p>',null,{mode:'compact'});return;}const f=fresh('refund');Object.assign(f,{referenceId:id,accountId:o.accountId,categoryId:remaining[0].categoryId});editor(f);}
 function cancelRecord(id){const finish=captureReturn();sheet('Отменить запись?','<p>Остатки будут пересчитаны. Запись и история останутся.</p><button class="button danger" id="confirm-cancel">Отменить запись</button>',p=>p.querySelector('#confirm-cancel').onclick=()=>perform(()=>app.mutate('operation.cancel',n=>cancelOperation(n,id)),'Запись отменена; история сохранена.',finish),{mode:'compact'});}
 function progressRecord(id,step,title){const finish=captureReturn();sheet(title,`<label>Фактическая дата<input name="progress-date" type="date" value="${localDate()}" required></label><p class="hint">Подтверждайте только состоявшееся движение денег.</p><button class="button" id="confirm-progress" data-save-changes>Подтвердить</button>`,p=>p.querySelector('#confirm-progress').onclick=()=>perform(()=>app.mutate('transfer.'+step,n=>progressTransfer(n,id,step,p.querySelector('input').value)),'Движение перевода подтверждено.',finish));}
 function operationQuick(id){const o=d().operations.find(x=>x.id===id);if(!o)return null;const actions=[];
  if(!o.cancelled&&['expense','income','refund','transfer'].includes(o.kind)&&o.stage!=='returned'&&!(o.kind==='expense'&&o.referenceId))actions.push({label:'Изменить',icon:'edit',run:()=>editOperation(id)});
  if(!o.cancelled&&!(o.kind==='expense'&&o.referenceId))actions.push({label:'Отменить операцию',icon:'close',danger:true,run:()=>cancelRecord(id)});
  return {title:operationTitle(o),actions};
 }
 function continueDraft(id){const x=d().drafts.find(x=>x.id===id);if(x)editor({...copy(x.form),draftId:x.id});}
 function removeDraft(id){const finish=captureReturn();sheet('Удалить черновик?','<p>Сохранённые операции останутся без изменений.</p><button class="button danger danger-strong" id="delete-draft-confirm">Удалить черновик</button>',p=>p.querySelector('#delete-draft-confirm').onclick=()=>perform(()=>app.mutate('draft.delete',n=>deleteDraft(n,id)),'Черновик удалён.',finish),{mode:'compact'});}
 function draftQuick(id){const draft=d().drafts.find(x=>x.id===id);return draft?{title:names[draft.form.kind],actions:[{label:'Продолжить ввод',icon:'edit',run:()=>continueDraft(id)},{label:'Удалить черновик',icon:'close',danger:true,run:()=>removeDraft(id)}]}:null;}

 function resolveContext(el){if(!d())return null;const a=el.dataset;
  if(a.incomeSource)return financial.quick(a.incomeSource);
  if(a.dockAction==='Операции')return {title:'Операции',placement:'above',actions:[{label:'Найти операцию',icon:'search',run:()=>navigate('Операции',true,false,search)},{label:'Фильтры операций',icon:'filters',run:()=>navigate('Операции',true,false,()=>navigate('Фильтры операций'))},{label:'Черновики',icon:'edit',run:()=>navigate('Операции',true,false,drafts)}]};
  if(a.dockAction==='Главная')return {title:'Главная',placement:'above',actions:[{label:'Настроить блоки',icon:'Настройки',run:()=>navigate('Главная',true,false,dashboard.configure)},{label:'Внешний вид',icon:'Настройки',run:()=>navigate('Настройки',true,false,()=>{root.querySelector('[name=appearance]')?.focus({preventScroll:true});})}]};
  if(a.operation||a.catOperation||a.accountOperation||a.metricOperation)return operationQuick(a.operation||a.catOperation||a.accountOperation||a.metricOperation);
  if(a.accountView)return management.accountQuick(a.accountView);if(a.categoryView||a.categoryExpand||a.child)return management.categoryQuick(a.categoryView||a.categoryExpand||a.child);if(a.draft)return draftQuick(a.draft);
  if(a.resultKind==='operation')return operationQuick(a.result);if(a.resultKind==='account')return management.accountQuick(a.result);if(a.resultKind==='category')return management.categoryQuick(a.result);
  if(a.tile!==undefined)return dashboard.quick(Number(a.tile));return null;
 }
 function editor(f){return focus.editor(f);}
 function drafts(){sheet('Черновики',d().drafts.length?d().drafts.map(x=>`<div class="draft-row"><button class="list-button" data-draft="${esc(x.id)}">${names[x.form.kind]}${x.form.amount?' · '+esc(x.form.amount):''}${x.form.editId?' · изменение':''}<small>${esc(new Date(x.updatedAt).toLocaleString('ru-RU'))}</small></button><button class="icon-button" data-draft-history="${esc(x.id)}" aria-label="История черновика">${icon('Операции')}</button><button class="icon-button danger" data-delete-draft="${esc(x.id)}" aria-label="Удалить черновик">${icon('close')}</button></div>`).join(''):'<p>Сохранённых черновиков нет.</p>',el=>{
  el.querySelectorAll('[data-draft]').forEach(b=>b.onclick=()=>continueDraft(b.dataset.draft));
  el.querySelectorAll('[data-draft-history]').forEach(b=>b.onclick=()=>activity.local('draft',b.dataset.draftHistory));el.querySelectorAll('[data-delete-draft]').forEach(b=>b.onclick=()=>removeDraft(b.dataset.deleteDraft));
 },{refresh:drafts,entity:{type:'drafts'}});}

 function search(){if(getPage()==='Поиск')return;guardPage(()=>{searchState.scope=getPage();searchState.query=queries.get(getPage())||'';positions.set(getPage(),root.querySelector('main')?.scrollTop||0);trail.push(getPage());restoreScroll=0;goPage('Поиск');/* Keep focus in the trusted tap stack for iPhone's keyboard. */root.querySelector('#global-query')?.focus({preventScroll:true});});}
 function searchPage(){return `<label class="context-search">${icon('search')}<input type="search" id="global-query" aria-label="${searchState.scope==='Главная'?'Глобальный поиск':'Поиск: '+esc(searchState.scope)}" placeholder="${searchState.scope==='Главная'?'Операции, счета, категории':'Найти: '+esc(searchState.scope.toLocaleLowerCase('ru'))}" value="${esc(searchState.query)}"></label>${searchState.scope==='Операции'&&lists.active()?'<button type="button" class="filter-search-summary" id="search-filters">С учётом фильтров · Изменить</button>':''}<div id="global-results" aria-live="polite"></div>`;}
 function bindSearch(){const q=root.querySelector('#global-query'),r=root.querySelector('#global-results');if(!q||!r)return;
  const draw=()=>{searchState.query=q.value;queries.set(searchState.scope,q.value);const scope=searchState.scope,global=scope==='Главная';if(scope==='История изменений'){activity.searchResults(r,q.value);return;}let rows=[];
   if(global||scope==='Операции')rows.push(...(global?d().operations:lists.selected()).map(o=>({label:operationTitle(o),type:names[o.kind]+' · '+o.date,id:o.id,kind:'operation',searchText:operationTitle(o)+' '+o.note+' '+names[o.kind]+' '+o.date+' '+accountName(o.accountId)+' '+(isExternal(o)?o.recipient:o.toAccountId?accountName(o.toAccountId):'')+' '+o.allocations.map(a=>categoryName(a.categoryId)).join(' ')})));
   if(global||scope==='Счета и кошельки')rows.push(...d().accounts.filter(a=>global||a.archived===management.isArchive()).map(a=>({label:a.name,type:'Счёт',id:a.id,kind:'account'})));
   if(global||scope==='Категории')rows.push(...d().categories.filter(c=>!c.parentId&&!c.mergedInto&&(global||c.archived===management.isCategoryArchive())&&(global||scope!=='Категории'||management.categoryType()==='all'||c.type===management.categoryType())).map(c=>{const children=d().categories.filter(x=>x.parentId===c.id&&!x.mergedInto&&(global||x.archived===management.isCategoryArchive()));return {label:c.name,type:c.type==='income'?'Доход':'Расход',id:c.id,kind:'category',operationType:c.type,children,searchText:[c.name,...children.map(x=>x.name)].join(' ')};}));
   // Menu search only contains its destinations, never a self-referencing Menu card.
   if(global||scope==='Меню')rows.push(...menuItems.map(x=>({label:x,type:'Раздел',id:x,kind:'page'})));
   if(global)rows.push(...['Меню',...PRIMARY_TABS.filter(x=>x!=='Главная')].map(x=>({label:x,type:'Раздел',id:x,kind:'page'})));
   if(scope==='Пароль и вход')rows=[{label:'Установить или изменить PIN-код',type:'Пароль и вход',id:'pin',kind:'security'},{label:'Изменить основной пароль',type:'Пароль и вход',id:'password',kind:'security'},{label:'Пароль, PIN и копии',type:'Пароль и вход',id:'help',kind:'security'}];
   if(scope==='Настройки')rows=[{label:'Пароль и вход',type:'Настройки',id:'Пароль и вход',kind:'page'},{label:'Оформление',type:'Настройки',id:'appearance',kind:'setting'},{label:'Автоблокировка',type:'Настройки',id:'autoLock',kind:'setting'}];
   if(scope==='Данные и синхронизация')rows=[['Защищённая резервная копия','backup'],['Проверка и восстановление','restore-start'],['Страховочные копии','safety-list']].map(([label,id])=>({label,id,type:'Данные и синхронизация',kind:'setting'}));
   // Payments, goals and reports remain unavailable product features; no fake records.
   const text=x=>x.searchText||x.label+' '+x.type,found=scope==='Операции'?rows.filter(x=>normalized(text(x)).includes(normalized(q.value))):rank(rows,q.value,text);r.innerHTML=found.map(x=>x.kind==='category'&&x.children?.length?`<details class="category-branch search-branch"><summary data-result="${esc(x.id)}" data-result-kind="category"><span><strong>${esc(x.label)}</strong><small>${operationMark(x.operationType)}</small></span>${branchMark()}</summary><div class="search-children">${x.children.map(c=>`<button class="list-button" data-result="${esc(c.id)}" data-result-kind="category">${esc(c.name)}</button>`).join('')}</div></details>`:`<button class="list-button" data-result="${esc(x.id)}" data-result-kind="${x.kind}"><strong>${esc(x.label)}</strong><small>${x.kind==='category'?operationMark(x.operationType):esc(x.type)}</small></button>`).join('')||'<p class="empty">Совпадений нет.</p>';
   r.querySelectorAll('button[data-result]').forEach(b=>b.onclick=()=>{const {result:id,resultKind:kind}=b.dataset;if(kind==='operation')card(id);else if(kind==='account')management.accountView(id);else if(kind==='category')management.categoryView(id);else if(kind==='page')navigate(id);else if(kind==='security'){back();security.open(id);}else{back();requestAnimationFrame(()=>{const target=root.querySelector('[name="'+id+'"]')||document.getElementById(id);if(target){target.focus({preventScroll:true});const main=root.querySelector('main');main.scrollTop=Math.max(0,target.offsetTop-main.offsetTop-100);}});}});
   document.dispatchEvent(new Event('finrate-surface'));
  };q.oninput=draw;draw();
 }
 function menu(){navigate('Меню');}
 function menuPage(){return `<div class="menu-items">${menuItems.map(x=>`<button class="list-button" data-extra="${x}" aria-label="${x}">${x}<span aria-hidden="true">${icon('chevron')}</span></button>`).join('')}${d().drafts.length?`<button class="list-button" id="draft-menu">Черновики · ${d().drafts.length}</button>`:''}${app.entry.mode==='none'?'':'<button class="list-button danger access-lock" id="lock-menu">Заблокировать доступ</button>'}</div>`;}
 function settings(){return dashboard.settings();}
 function bind(){updateChrome(getPage());root.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>navigate(b.dataset.page));root.querySelector('.brand-home')?.addEventListener('click',()=>navigate('Главная',true,true));root.querySelector('#more')?.addEventListener('click',menu);root.querySelector('#global-search')?.addEventListener('click',search);root.querySelector('#page-back')?.addEventListener('click',back);
  root.querySelector('#operation-add')?.addEventListener('click',()=>operationChooser());
  root.querySelectorAll('[data-extra]').forEach(b=>b.onclick=()=>navigate(b.dataset.extra));
  root.querySelector('#draft-menu')?.addEventListener('click',drafts);
  root.querySelector('#lock-menu')?.addEventListener('click',requestLock);
  lists.bind();activity.bind();security.bind();
  bindSearch();
  root.querySelectorAll('.bottom [data-page]').forEach(b=>{b.classList.toggle('active',b.dataset.page===getPage());if(b.dataset.page===getPage())b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  gestures.refresh();
  if(restoreScroll!==null){const value=restoreScroll;restoreScroll=null;root.querySelector('main')?.scrollTo(0,value);}
  bindUpdate();
  dashboard.bind();management.bind();root.querySelector('#draft-home')?.addEventListener('click',drafts);
  root.querySelector('#balance-details')?.addEventListener('click',()=>sheet('Фактический остаток',d().accounts.map(a=>`<div class="detail-row"><span>${esc(a.name)}</span><strong>${amt(a.financeType==='credit'?Math.max(0,totals(d()).balances[a.id]):totals(d()).balances[a.id])}</strong></div>`).join('')+'<p class="hint">Только собственные средства, включая излишек подтверждённого возврата на кредитку. Кредитный долг и лимит исключены; деньги в пути не зачислены получателю.</p>'));
  root.querySelector('#free-details')?.addEventListener('click',financial.free);root.querySelector('#financial-planning')?.addEventListener('click',financial.open);financial.offer();
  if(root.querySelector('#history-results'))attachRows();
  root.querySelector('#p2-settings')?.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));perform(()=>app.mutate('settings.save',n=>Object.assign(n.settings,{...v,...notificationForm(e.target),autoLock:v.autoLock===undefined?d().settings.autoLock:Number(v.autoLock)})),'Настройки сохранены.',dashboard.clearSettingsDraft);});
 }
 function attachRows(){root.querySelectorAll('[data-operation]').forEach(b=>b.onclick=()=>card(b.dataset.operation));}
 function navigationContext(){const allowed=new Set([...PRIMARY_TABS,...menuItems,'Меню','Фильтры операций','Пароль и вход']);let current=getPage()==='Поиск'?searchState.scope:getPage();if(!allowed.has(current))current='Главная';return {page:current,trail:trail.filter(x=>allowed.has(x)&&x!==current).slice(-20),scroll:root.querySelector('main')?.scrollTop||0};}
 function restoreNavigation(context){const allowed=new Set([...PRIMARY_TABS,...menuItems,'Меню','Фильтры операций','Пароль и вход']);trail=(context?.trail||[]).filter(x=>allowed.has(x));if(!trail.length&&!PRIMARY_TABS.includes(context?.page))trail=context?.page==='Меню'?['Главная']:['Главная','Меню'];restoreScroll=Math.max(0,Number(context?.scroll)||0);}
 function clear(){clearSensitive();creditDocument=null;creditState=null;management.clear();activity.clear();contexts.close(false);pendingLeaves.clear();lists.clear();dashboard.clearSettingsDraft();clearSurfaces();document.body.classList.remove('focus-mode');quick=null;quickBank=null;while(panels.length){const r=panels.pop();r.el.remove();}trail=[];positions.clear();queries.clear();searchState.query='';}
 function bindUpdate(){root.querySelector('#apply-update')?.addEventListener('click',()=>{const apply=()=>{if(!waitingUpdate||app.busy)return;navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});waitingUpdate.postMessage({type:'FINRATE_APPLY_UPDATE'});};leavePanels(()=>askLeave(leavingForms(),apply));});}
 function watchUpdates(reg){const check=()=>{if(reg.waiting&&navigator.serviceWorker.controller){waitingUpdate=reg.waiting;render();bindUpdate();}};check();reg.addEventListener('updatefound',()=>{const installing=reg.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed')check();});});reg.update().catch(()=>{});}
 const contexts=installContextMenus({resolve:resolveContext,blocked:()=>!d()||locked||app.busy||panels.some(p=>p.el.dataset.leaveConfirm)});
 const gestures=installNavigationGestures({root,getPage,navigate,blocked:()=>!d()||locked||app.busy||!!activeSurface()||!PRIMARY_TABS.includes(getPage())});
 const edgeLauncher=installEdgeLauncher({root,getPage,getSide:()=>d()?.settings.edgeSide||'right',available:()=>!!d()&&!locked&&!app.busy&&PRIMARY_TABS.includes(getPage())&&!panels.length&&!root.querySelector('main form')&&!activeSurface(),open:operationChooser});

 return {header,navigation,home,operations,settings,feedbackDetails,activityPage:activity.page,securityPage:security.page,securityOpen:security.open,navigationContext,restoreNavigation,bind,clear,clearSensitive,reset,back,menu,menuPage,search,searchPage,navigate,watchUpdates,bindUpdate,sheet,perform,closePanel:el=>{if(panels.at(-1)?.el===el)pop();},filtersPage:lists.page,accounts:management.accounts,categories:management.categories};
}
function rank(rows,query,text){const q=normalized(query);if(!q)return rows;return rows.map(x=>({x,t:normalized(text(x))})).filter(x=>x.t.includes(q)).sort((a,b)=>Number(!a.t.split(/\s+/).some(w=>w.startsWith(q)))-Number(!b.t.split(/\s+/).some(w=>w.startsWith(q)))).map(x=>x.x);}
