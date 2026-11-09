import {totals,fail} from './model.mjs';
// Projection of an already validated FinRate document, not another ledger.
export function reportPeriod(document,month){
 if(typeof month!=='string'||!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)||month<'0001-01')fail('DATE');
 if(!document||!['RUB','USD','EUR','GBP'].includes(document.currency)||!Array.isArray(document.accounts)||!Array.isArray(document.operations))fail('SCHEMA');
 for(const row of [...document.accounts,...document.operations])if(row.currency!==undefined&&row.currency!==document.currency)fail('CURRENCY');
 const [year,index]=month.split('-').map(Number),leap=year%4===0&&(year%100!==0||year%400===0),last=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][index-1],from=month+'-01',to=month+'-'+last;
 const {income,expense,result}=totals(document,{from,to});
 const hasFacts=document.operations.some(o=>!o.cancelled&&!o.pending&&o.date>=from&&o.date<=to&&(['income','expense','refund'].includes(o.kind)||o.kind==='transfer'&&o.transferTarget==='external'));
 return {from,to,currency:document.currency,income,expense,result,empty:!hasFacts};
}
