import {icon} from './icons.mjs';
// One existing FinRate chevron for available subcategories across FinRate.
export const branchMark=()=>'<span class="branch-mark" aria-hidden="true">'+icon('chevron')+'</span>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function allocationGroups(doc,rows,amt){
 const groups=new Map();for(const row of rows){const c=doc.categories.find(c=>c.id===row.categoryId)||{id:'uncategorized',name:'Без категории'};const id=c.parentId||c.id;if(!groups.has(id))groups.set(id,{c:doc.categories.find(c=>c.id===id)||c,rows:[],total:0});const g=groups.get(id);g.rows.push({c,amount:row.amount});g.total+=row.amount;}
 return [...groups.values()].map(g=>g.rows.some(x=>x.c.parentId)?`<details class="allocation-group category-branch"><summary><strong>${esc(g.c.name)}</strong><span>${amt(g.total)}</span>${branchMark()}</summary><div class="allocation-children">${g.rows.map(x=>`<div class="detail-row"><span>${x.c.parentId?esc(x.c.name):'Без подкатегории'}</span><strong>${amt(x.amount)}</strong></div>`).join('')}</div></details>`:`<div class="detail-row"><span>${esc(g.c.name)}</span><strong>${amt(g.total)}</strong></div>`).join('');
}

export function operationMark(type){
 const label={expense:'Расход',income:'Доход',transfer:'Перевод'}[type];
 return label?'<span class="operation-type-mark '+type+'" role="img" aria-label="'+label+'">'+icon(type)+'</span>':'';
}
