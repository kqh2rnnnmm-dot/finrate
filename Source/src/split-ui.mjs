import {branchMark} from './category-branch.mjs';
/* Shared allocation editor; persistent allocations keep their existing flat format. */
import {copy,money} from './model.mjs';
import {icon} from './icons.mjs';
import {createFieldEditor} from './field-editor.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createSplitUI({document:d,sheet,pop,amt,categoryName,categoryPicker}){
 const fields=createFieldEditor({sheet,pop});
 function open(f,changed,{oldAmount=null}={}){
  let total;try{total=money(f.amount||'0');}catch{return;}if(total<=0)return;
  const unique=new Map();for(const row of copy(f.split||[])){const found=unique.get(row.categoryId);if(found)found.amount=String((money(found.amount)+money(row.amount))/100);else unique.set(row.categoryId,row);}const rows=[...unique.values()];let root,accepted=false;
  const used=()=>rows.reduce((s,r)=>s+money(r.amount),0),left=()=>total-used();
  const expanded=new Set();
  function grouped(){const groups=new Map();rows.forEach((row,index)=>{const c=d().categories.find(c=>c.id===row.categoryId),id=c.parentId||c.id;if(!groups.has(id))groups.set(id,[]);groups.get(id).push({row,index,c});});return [...groups].map(([id,parts])=>({id,parts,name:categoryName(id),total:parts.reduce((n,x)=>n+money(x.row.amount),0),children:parts.some(x=>x.c.parentId)}));}
  function draw(){root.querySelector('.split-content').innerHTML=`<section class="split-summary"><span>Сумма расхода</span><strong class="split-remaining">${amt(total)}</strong></section><div class="split-items">${grouped().map(g=>g.children?`<details class="allocation-group category-branch" data-split-group="${esc(g.id)}" ${expanded.has(g.id)?'open':''}><summary><strong>${esc(g.name)}</strong><span>${amt(g.total)}</span>${branchMark()}</summary><div class="allocation-children">${g.parts.map(x=>`<button type="button" class="split-item" data-flat-part="${x.index}"><span>${x.c.parentId?esc(x.c.name):'Без подкатегории'}</span><span>${amt(money(x.row.amount))}</span><span>${icon('edit')}</span></button>`).join('')}</div></details>`:`<button type="button" class="split-item" data-flat-part="${g.parts[0].index}" data-split-group="${esc(g.id)}"><span><strong>${esc(g.name)}</strong></span><span>${amt(g.total)}</span><span>${icon('edit')}</span></button>`).join('')}</div>${left()>0?`<div class="detail-row"><span>Без категории</span><strong>${amt(left())}</strong></div>`:''}${left()<0?'<p class="hint">Сумма расхода уменьшилась. Уменьшите суммы частей.</p>':''}<button type="button" class="button secondary" id="flat-add" ${left()<=0||rows.length>=100?'disabled':''}>${icon('plus')} Добавить часть</button>`;
   root.querySelectorAll('details[data-split-group]').forEach(el=>el.ontoggle=()=>{if(el.open)expanded.add(el.dataset.splitGroup);else expanded.delete(el.dataset.splitGroup);});
   root.querySelectorAll('[data-flat-part]').forEach(b=>b.onclick=()=>part(Number(b.dataset.flatPart)));root.querySelector('#flat-add').onclick=()=>part(-1);root.querySelector('#flat-done').disabled=left()<0;
  }
  function part(index){
   const original=index>=0?rows[index]:null,cat=d().categories.find(c=>c.id===(original?.categoryId||f.subcategoryId||f.categoryId)),item={kind:'expense',categoryId:cat?.parentId||cat?.id||'',subcategoryId:cat?.parentId?cat.id:'',amount:original?.amount||''};
   const max=left()+(original?money(original.amount):0);let el;
   const pick=(key,label,value)=>`<button class="pick-button" type="button" data-flat-field="${key}"><span>${label}</span><strong>${esc(value)}</strong><span>${icon('chevron')}</span></button>`;
   function redraw(){el.querySelector('.flat-part-fields').innerHTML=pick('category','Категория',item.categoryId?categoryName(item.categoryId):'Выбрать')+(item.categoryId&&d().categories.some(c=>c.parentId===item.categoryId&&!c.archived&&!c.mergedInto)?pick('subcategory','Подкатегория',item.subcategoryId?categoryName(item.subcategoryId):'Без подкатегории'):'')+pick('amount','Сумма части',item.amount?amt(money(item.amount)):'Указать сумму')+`<p class="hint">Доступно: ${amt(max)}</p>`;
    el.querySelector('[data-flat-field=category]').onclick=()=>categoryPicker(item,'categoryId',redraw,{allowClear:false});el.querySelector('[data-flat-field=subcategory]')?.addEventListener('click',()=>categoryPicker(item,'subcategoryId',redraw,{allowClear:true}));
    el.querySelector('[data-flat-field=amount]').onclick=()=>fields.open('Сумма части',item.amount,value=>{item.amount=value;redraw();},{numeric:true,min:.01,max:max/100,required:true});
    el.querySelector('#flat-part-done').disabled=!item.categoryId||!item.amount||money(item.amount)<=0||money(item.amount)>max;
   }
   el=sheet(index<0?'Добавить часть':'Часть расхода','<div class="flat-part-fields"></div>'+(index>=0?'<button type="button" class="text-button danger" id="flat-remove">Удалить часть</button>':'')+'<button type="button" class="button" id="flat-part-done">Готово</button>',p=>{el=p;redraw();p.querySelector('#flat-part-done').onclick=()=>{const row={categoryId:item.subcategoryId||item.categoryId,amount:item.amount};if(index<0){const same=rows.find(x=>x.categoryId===row.categoryId);if(same)same.amount=String((money(same.amount)+money(row.amount))/100);else rows.push(row);}else{rows[index]=row;const unique=new Map();for(const r of rows){const other=unique.get(r.categoryId);if(other)other.amount=String((money(other.amount)+money(r.amount))/100);else unique.set(r.categoryId,{...r});}rows.splice(0,rows.length,...unique.values());}pop();draw();};p.querySelector('#flat-remove')?.addEventListener('click',()=>{rows.splice(index,1);pop();draw();});},{state:()=>JSON.stringify(item),save:()=>el.querySelector('#flat-part-done').click()});
  }
  root=sheet('Распределить расход','<div class="split-content"></div><button type="button" class="button" id="flat-done">Применить распределение</button>',p=>{root=p;draw();p.querySelector('#flat-done').onclick=()=>{if(left()<0)return;f.split=copy(rows);f.isSplit=true;f.splitTotal=f.amount;accepted=true;pop();};},{state:()=>JSON.stringify(rows),save:()=>root.querySelector('#flat-done').click(),onBack:()=>{if(!accepted&&oldAmount!==null)f.amount=oldAmount;changed();}});
 }
 return {open};
}
