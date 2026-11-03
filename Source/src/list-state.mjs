import {resolveCategory} from './block02.mjs';
import {normalized} from './model.mjs';
const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// View settings only: never attach these values to the financial document.
export const defaultFilters=()=>({sort:'new',period:'all',from:'',to:'',kinds:[],accounts:[],categories:[]});
export const filterCount=f=>Number(f.period!=='all')+Number(!!f.kinds.length)+Number(!!f.accounts.length)+Number(!!f.categories.length);
export const invalidRange=f=>f.period==='custom'&&!!f.from&&!!f.to&&f.from>f.to;
export function dateRange(f,now=new Date()){
 if(f.period==='custom')return [f.from,f.to];
 if(f.period==='month')return [localDate(new Date(now.getFullYear(),now.getMonth(),1)),localDate(new Date(now.getFullYear(),now.getMonth()+1,0))];
 if(f.period==='week'){const from=new Date(now);from.setDate(from.getDate()-6);return [localDate(from),localDate(now)];}
 return ['',''];
}
export function selectOperations(doc,f,{query='',text=o=>o.note||'',now=new Date()}={}){
 if(invalidRange(f))return [];
 const [from,to]=dateRange(f,now),q=normalized(query);
 const categories=new Set(f.categories.map(id=>id==='uncategorized'?id:resolveCategory(doc,id)?.id||id));
 const categoryMatches=o=>{
  if(!categories.size)return true;
  const allocations=o.allocations||[];
  if(categories.has('uncategorized')&&(!allocations.length||allocations.reduce((s,a)=>s+a.amount,0)<o.amount||allocations.some(a=>!a.categoryId)))return true;
  return allocations.some(a=>{const c=resolveCategory(doc,a.categoryId);return c&&(categories.has(c.id)||categories.has(c.parentId));});
 };
 return doc.operations.map((o,index)=>({o,index})).filter(({o})=>(!from||o.date>=from)&&(!to||o.date<=to)&&(!f.kinds.length||f.kinds.includes(o.kind)||o.transferTarget==='external'&&f.kinds.includes('expense'))&&(!f.accounts.length||f.accounts.includes(o.accountId)||f.accounts.includes(o.toAccountId))&&categoryMatches(o)&&(!q||normalized(text(o)).includes(q))).sort((a,b)=>(f.sort==='old'?1:-1)*(a.o.date.localeCompare(b.o.date)||a.index-b.index)).map(x=>x.o);
}
