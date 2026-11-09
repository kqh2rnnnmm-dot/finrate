import {totals,fail} from './model.mjs';
// The document is single-currency. No conversions, mutations or second ledger.
export function monthlyReport(d,month){
 if(typeof month!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||month<'0001-01')fail('DATE');
 if(!d||!['RUB','USD','EUR','GBP'].includes(d.currency)||!Array.isArray(d.accounts)||!Array.isArray(d.operations))fail('SCHEMA');
 if(d.accounts.some(a=>a.currency&&a.currency!==d.currency)||d.operations.some(o=>o.currency&&o.currency!==d.currency))fail('CURRENCY');
 const [year,m]=month.split('-').map(Number),leap=year%4===0&&(year%100!==0||year%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31],from=month+'-01',to=month+'-'+days[m-1];
 const {income,expense,result}=totals(d,{from,to});
 const empty=!d.operations.some(o=>!o.cancelled&&!o.pending&&o.date>=from&&o.date<=to&&['income','expense','refund'].includes(o.kind)||!o.cancelled&&!o.pending&&o.date>=from&&o.date<=to&&o.kind==='transfer'&&o.transferTarget==='external');
 return {month,from,to,currency:d.currency,income,expense,result,empty};
}
