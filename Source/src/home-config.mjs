import {copy,fail} from './model.mjs';
import {icon} from './icons.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const HOME_STYLES={numbers:'Крупные показатели',details:'Полезные подробности',rows:'Компактный обзор'};
export const HOME_METRICS={credit:'Кредитный счёт',expense:'Расходы за месяц',income:'Доходы за месяц',last:'Последняя операция',payment:'Ближайший платёж',limits:'Лимиты',reserves:'Резервы',goal:'Выбранная цель',debts:'Долги',account:'Остаток счёта',drafts:'Черновики'};
export const homeStyle=settings=>Object.hasOwn(HOME_STYLES,settings.homeTileStyle)?settings.homeTileStyle:'numbers';
const options=(rows,value)=>Object.entries(rows).map(([key,label])=>`<option value="${key}" ${key===String(value)?'selected':''}>${esc(label)}</option>`).join('');
export function createHomeConfig({app,sheet,pop,perform,captureReturn}){
 const d=()=>app.document;
 function snapshot(){return {style:homeStyle(d().settings),tiles:copy(d().settings.homeTiles)};}
 function commit(draft,finish){return perform(()=>{
  if(!Object.hasOwn(HOME_STYLES,draft.style)||draft.tiles.length<1||draft.tiles.length>6||draft.tiles.some(t=>!Object.hasOwn(HOME_METRICS,t.metric)||t.accountId&&!d().accounts.some(a=>a.id===t.accountId)))fail('SCHEMA');
  return app.mutate('home.configure',n=>{n.settings.homeTiles=copy(draft.tiles);n.settings.homeTileStyle=draft.style;});
 },'',finish);}
 function open(){const finish=captureReturn(),draft=snapshot();let el;
  const save=()=>commit(draft,finish);
  function draw(){el.querySelector('.sheet-body').innerHTML=`<form id="home-config-form"><label>Вид блоков<select id="home-display-style" name="homeTileStyle">${options(HOME_STYLES,draft.style)}</select></label><label>Количество блоков<select id="tile-count" name="count">${options({1:'1 — широкая',2:'2 — друг под другом',3:'3 — две сверху, широкая снизу',4:'4 — сетка 2×2',5:'5 — четыре и широкая снизу',6:'6 — сетка 2×3'},draft.tiles.length)}</select></label>${draft.tiles.length>4?'<p class="hint home-density-hint">При пяти–шести блоках подробности сокращаются по доступному месту. Полные сведения открываются нажатием на блок.</p>':''}<h3>Содержимое и порядок</h3>${draft.tiles.map((t,i)=>`<button type="button" class="list-button" data-config-tile="${i}">${i+1}. ${esc(HOME_METRICS[t.metric])}<span class="control-action" aria-hidden="true">${icon('chevron')}</span></button>`).join('')}<button type="submit" class="button" id="home-config-done">Готово</button></form>`;
   el.querySelector('#home-display-style').onchange=e=>draft.style=e.target.value;
   el.querySelector('#tile-count').onchange=e=>{const count=Number(e.target.value);draft.tiles=draft.tiles.slice(0,count);while(draft.tiles.length<count)draft.tiles.push({metric:['expense','last','income','drafts','expense','income'][draft.tiles.length]});draw();};
   el.querySelectorAll('[data-config-tile]').forEach(b=>b.onclick=()=>editTile(draft,Number(b.dataset.configTile),()=>{pop();draw();}));
   el.querySelector('form').onsubmit=e=>{e.preventDefault();save();};
  }
  el=sheet('Настройка блоков','<form id="home-config-form"></form>',node=>{el=node;node.dataset.homeConfig='true';draw();},{focus:true,state:()=>JSON.stringify(draft),save});
 }
 function editTile(draft,index,accept){const original=copy(draft.tiles),tile=copy(original[index]),form={tile,position:index};let el;
  function save(){const next=copy(original);next.splice(index,1);next.splice(form.position,0,copy(form.tile));draft.tiles=next;return accept();}
  function draw(){const accounts=d().accounts.filter(a=>(!a.archived||a.id===form.tile.accountId)&&(form.tile.metric!=='credit'||a.financeType==='credit'));el.querySelector('.sheet-body').innerHTML=`<form id="home-tile-form"><label>Показатель<select name="metric">${options(HOME_METRICS,form.tile.metric)}</select></label>${['account','credit'].includes(form.tile.metric)?`<label>${form.tile.metric==='credit'?'Кредитный счёт':'Счёт'}<select name="accountId" ${form.tile.metric==='credit'?'required':''}><option value="">Выберите счёт</option>${accounts.map(a=>`<option value="${esc(a.id)}" ${a.id===form.tile.accountId?'selected':''}>${esc(a.name)}${a.archived?' · Архив':''}</option>`).join('')}</select></label>`:''}${form.tile.metric==='credit'?`<label>Что показывать<select name="creditMetric">${options({due:'Платёж этого месяца',total:'Общий долг'},form.tile.creditMetric||'due')}</select></label>${!accounts.length?'<p class="hint">Сначала создайте кредитный счёт в разделе «Счета и кошельки».</p>':''}`:''}<label>Позиция<select name="position">${options(Object.fromEntries(draft.tiles.map((_,i)=>[i,'Место '+(i+1)])),form.position)}</select></label><button type="button" class="button secondary danger" id="home-tile-remove" ${draft.tiles.length===1?'disabled':''}>Убрать блок</button><button type="submit" class="button" id="home-tile-done">Готово</button></form>`;
   el.querySelector('[name=metric]').onchange=e=>{form.tile={metric:e.target.value,...(e.target.value==='account'&&tile.accountId?{accountId:tile.accountId}:{}),...(e.target.value==='credit'?{creditMetric:'due',accountId:d().accounts.find(a=>a.financeType==='credit'&&!a.archived)?.id||''}:{})};draw();};
   el.querySelector('[name=accountId]')?.addEventListener('change',e=>{if(e.target.value)form.tile.accountId=e.target.value;else delete form.tile.accountId;});
   el.querySelector('[name=creditMetric]')?.addEventListener('change',e=>form.tile.creditMetric=e.target.value);
   el.querySelector('[name=position]').onchange=e=>form.position=Number(e.target.value);
   el.querySelector('#home-tile-remove').onclick=()=>{draft.tiles=original.filter((_,i)=>i!==index);accept();};
   el.querySelector('form').onsubmit=e=>{e.preventDefault();save();};
  }
  el=sheet('Блок '+(index+1),'<form id="home-tile-form"></form>',node=>{el=node;node.dataset.homeTileEditor='true';draw();},{focus:true,state:()=>JSON.stringify(form),save});
 }
 function direct(index){const draft=snapshot(),finish=captureReturn();editTile(draft,index,()=>commit(draft,finish));}
 function remove(index){if(d().settings.homeTiles.length<=1)return;const finish=captureReturn(),draft=snapshot(),original=copy(draft.tiles);sheet('Убрать блок?',`<p>${esc(HOME_METRICS[draft.tiles[index].metric])}</p><button class="button danger" id="home-remove-confirm">Убрать блок</button>`,el=>el.querySelector('#home-remove-confirm').onclick=()=>{draft.tiles=original.filter((_,i)=>i!==index);commit(draft,finish);},{mode:'compact'});}
 return {open,direct,remove};
}
