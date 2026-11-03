/* UI-only hierarchy. Stored drafts and operations keep the existing flat parts. */
import {money,copy,addSafe,fail} from './model.mjs';
export const partTotal=rows=>rows.reduce((sum,row)=>addSafe(sum,money(row.amount)),0);
export function splitTree(document,parts){
 const groups=new Map();
 for(const row of parts){if(!row.categoryId)continue;const category=document.categories.find(c=>c.id===row.categoryId);if(!category)fail('CATEGORY');
  const parentId=category.parentId||category.id;let group=groups.get(parentId);
  if(!group){group={categoryId:parentId,subcategoryId:'',amount:'0',children:[]};groups.set(parentId,group);}
  group.amount=((money(group.amount)+money(row.amount))/100).toFixed(2);
  if(category.parentId)group.children.push({categoryId:parentId,subcategoryId:category.id,amount:row.amount,children:[]});
 }
 return [...groups.values()];
}
export function flatParts(nodes){
 const rows=[];
 for(const node of nodes){const amount=money(node.amount),children=node.children||[],used=partTotal(children);if(amount<=0||used>amount)fail('SPLIT_SUM');
  if(children.length){for(const child of children){if(child.categoryId!==node.categoryId||!child.subcategoryId||money(child.amount)<=0)fail('SCHEMA');rows.push({categoryId:child.subcategoryId,amount:child.amount});}if(amount>used)rows.push({categoryId:node.categoryId,amount:((amount-used)/100).toFixed(2)});}
  else rows.push({categoryId:node.subcategoryId||node.categoryId,amount:node.amount});
 }
 if(rows.length>100)fail('SIZE');return copy(rows);
}
export function availablePart(total,rows,index=-1){return Math.max(0,total-rows.reduce((sum,row,i)=>i===index?sum:addSafe(sum,money(row.amount)),0));}
