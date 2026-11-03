import {branchMark,operationMark} from './category-branch.mjs';
import {defaultFilters,filterCount,invalidRange,selectOperations} from './list-state.mjs';
import {icon} from './icons.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createListView({root,document:doc,names,categoryName,navigate,back,render,resetPosition}){
 let applied=defaultFilters(),draft=null;
 const selected=(f=applied,options)=>selectOperations(doc(),f,options);
 const active=()=>filterCount(applied);
 const sortLabel=()=>applied.sort==='new'?'Сначала новые':'Сначала старые';
 const periodLabel=f=>f.period==='month'?new Date().toLocaleDateString('ru-RU',{month:'long',year:'numeric'}):f.period==='week'?'Последние 7 дней':(f.from||'С начала')+' — '+(f.to||'без конечной даты');
 function summary(){const chips=[];
  if(applied.period!=='all')chips.push(['period',periodLabel(applied)]);
  if(applied.kinds.length)chips.push(['kinds',applied.kinds.map(k=>names[k]||k).join(', ')]);
  if(applied.accounts.length)chips.push(['accounts',applied.accounts.length===1?doc().accounts.find(a=>a.id===applied.accounts[0])?.name||'Счёт':'Счета: '+applied.accounts.length]);
  if(applied.categories.length)chips.push(['categories',applied.categories.length===1?(applied.categories[0]==='uncategorized'?'Без категории':categoryName(applied.categories[0])):'Категории: '+applied.categories.length]);
  return `<div class="list-state"><select id="toggle-sort" aria-label="Порядок операций"><option value="new" ${applied.sort==='new'?'selected':''}>Сначала новые</option><option value="old" ${applied.sort==='old'?'selected':''}>Сначала старые</option></select>${active()?'<button type="button" data-reset-applied>Сбросить</button>':''}</div>${chips.length?`<div class="filter-chips">${chips.map(([key,label])=>`<button type="button" data-clear-group="${key}" aria-label="Убрать фильтр: ${esc(label)}">${esc(label)}${icon('close')}</button>`).join('')}</div><p class="match-label" role="status">Найдено: ${selected().length}</p>`:''}`;
 }
 const open=()=>{draft=structuredClone(applied);resetPosition('Фильтры операций');navigate('Фильтры операций');};
 const checks=(key,values)=>values.map(([id,label])=>`<label class="filter-check"><span>${esc(label)}</span><input type="checkbox" name="${key}" value="${esc(id)}" ${draft[key].includes(id)?'checked':''}></label>`).join('');
 function categoryChecks(){return doc().categories.filter(c=>!c.parentId&&!c.mergedInto).map(c=>{const children=doc().categories.filter(x=>x.parentId===c.id&&!x.mergedInto),id='filter-children-'+c.id;return `<div class="filter-category-group"><div class="filter-category-parent">${checks('categories',[[c.id,c.name+(c.archived?' · В архиве':'')]])}${operationMark(c.type)}${children.length?`<button type="button" class="icon-button branch-toggle" data-filter-branch="${esc(id)}" aria-label="Подкатегории: ${esc(c.name)}" aria-expanded="false" aria-controls="${esc(id)}">${branchMark()}</button>`:''}</div>${children.length?`<div class="filter-category-children" id="${esc(id)}" hidden>${checks('categories',children.map(x=>[x.id,x.name+(x.archived?' · В архиве':'')]))}</div>`:''}</div>`;}).join('')+checks('categories',[['uncategorized','Без категории']]);}
 function page(){draft??=structuredClone(applied);const f=draft;
  const kinds=['expense','income','transfer',...Object.keys(names).filter(k=>!['expense','income','transfer'].includes(k)&&doc().operations.some(o=>o.kind===k))];
  return `<form class="filter-form"><section class="filter-group"><h2>Порядок операций</h2><p>По дате операции</p><select name="sort" aria-label="Порядок операций"><option value="new" ${f.sort==='new'?'selected':''}>Сначала новые</option><option value="old" ${f.sort==='old'?'selected':''}>Сначала старые</option></select></section>
  <section class="filter-group"><h2>Период</h2><select name="period" aria-label="Период">${[['all','За всё время'],['month',periodLabel({period:'month'})],['week','Последние 7 дней'],['custom','Выбрать даты']].map(([v,label])=>`<option value="${v}" ${f.period===v?'selected':''}>${esc(label)}</option>`).join('')}</select><div class="filter-date-pair" ${f.period==='custom'?'':'hidden'}><label>С даты<input type="date" name="from" value="${esc(f.from)}"></label><label>По дату<input type="date" name="to" value="${esc(f.to)}"></label></div><p class="filter-date-error" role="alert"></p></section>
  <section class="filter-group"><h2>Тип операции</h2><button type="button" class="filter-all" data-all="kinds">Все типы</button>${checks('kinds',kinds.map(k=>[k,names[k]]))}</section>
  <section class="filter-group"><details><summary>Счета <span data-selected="accounts"></span>${icon('chevron')}</summary><button type="button" class="filter-all" data-all="accounts">Все счета</button>${checks('accounts',doc().accounts.map(a=>[a.id,a.name+(a.archived?' · В архиве':'')]))}<p>Перевод виден по счёту отправителя и получателя.</p></details></section>
  <section class="filter-group"><details><summary>Категории <span data-selected="categories"></span>${icon('chevron')}</summary><button type="button" class="filter-all" data-all="categories">Все категории</button>${categoryChecks()}<p>Выбор основной категории включает её подкатегории.</p></details></section>
  <div class="filter-actions"><button type="submit" class="filter-apply">Показать · <span data-match-count>${selected(f).length}</span></button><button type="button" data-reset-draft>Сбросить настройки</button></div></form>`;
 }
 function sync(){const form=root.querySelector('.filter-form');if(!form)return;const invalid=invalidRange(draft);
  form.querySelector('[data-match-count]').textContent=selected(draft).length;
  for(const key of ['kinds','accounts','categories']){form.querySelector('[data-all="'+key+'"]').setAttribute('aria-pressed',String(!draft[key].length));const label=form.querySelector('[data-selected="'+key+'"]');if(label)label.textContent=draft[key].length?'Выбрано: '+draft[key].length:key==='accounts'?'Все счета':'Все категории';}
  form.querySelector('.filter-date-error').textContent=invalid?'Дата начала должна быть не позже даты окончания.':'';
  form.querySelector('[type=submit]').disabled=invalid;root.querySelector('#apply-filters').disabled=invalid;
  document.dispatchEvent(new Event('finrate-surface'));
 }
 function apply(){if(!draft||invalidRange(draft))return;applied=structuredClone(draft);draft=null;resetPosition();back();}
 function bind(){root.querySelector('#operation-filters')?.addEventListener('click',open);root.querySelector('#search-filters')?.addEventListener('click',open);root.querySelector('#apply-filters')?.addEventListener('click',apply);
  root.querySelector('#toggle-sort')?.addEventListener('change',e=>{
   document.dispatchEvent(new Event('finrate-scroll-reset'));
   applied.sort=e.currentTarget.value;
   // Move existing cards. Preserve their listeners, keyboard focus and other filters.
   const container=root.querySelector('#history-results'),rows=new Map([...container.querySelectorAll('[data-operation]')].map(el=>[el.dataset.operation,el])),fragment=document.createDocumentFragment();
   for(const o of selected()){const el=rows.get(o.id);if(el)fragment.append(el);}container.append(fragment);root.querySelector('main').scrollTo({top:0,behavior:'instant'});document.dispatchEvent(new Event('finrate-surface'));
  });
  const redraw=()=>{resetPosition();render();root.querySelector('main')?.scrollTo(0,0);};
  root.querySelectorAll('[data-reset-applied]').forEach(b=>b.onclick=()=>{applied=defaultFilters();redraw();});
  root.querySelectorAll('[data-clear-group]').forEach(b=>b.onclick=()=>{const key=b.dataset.clearGroup;if(key==='period'){applied.period='all';applied.from='';applied.to='';}else applied[key]=[];redraw();});
  const form=root.querySelector('.filter-form');if(!form)return;
  form.querySelectorAll('[data-filter-branch]').forEach(button=>button.onclick=()=>{const pane=document.getElementById(button.dataset.filterBranch);pane.hidden=!pane.hidden;button.setAttribute('aria-expanded',String(!pane.hidden));});
  form.addEventListener('submit',e=>{e.preventDefault();apply();});
  form.querySelectorAll('[data-all]').forEach(b=>b.onclick=()=>{draft[b.dataset.all]=[];form.querySelectorAll('input[name="'+b.dataset.all+'"]').forEach(el=>el.checked=false);sync();});
  form.querySelector('[data-reset-draft]').onclick=()=>{draft=defaultFilters();render();};
  form.onchange=e=>{const el=e.target,key=el.name;if(['sort','period','from','to'].includes(key)){draft[key]=el.value;if(key==='period')form.querySelector('.filter-date-pair').hidden=el.value!=='custom';}else if(['kinds','accounts','categories'].includes(key))draft[key]=[...form.querySelectorAll('input[name="'+key+'"]:checked')].map(x=>x.value);sync();};sync();
 }
 return {selected,active,summary,open,page,bind,clear:()=>{applied=defaultFilters();draft=null;}};
}
