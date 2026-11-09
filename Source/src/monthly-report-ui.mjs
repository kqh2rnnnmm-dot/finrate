import {monthlyReport} from './monthly-report.mjs';
import {localDate} from './operations.mjs';
import {formatMoney} from './ui-values.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createMonthlyReportUI({app,root,forecast}){
 let month=null;
 function overview(){const selected=month||localDate().slice(0,7);try{const r=monthlyReport(app.document,selected);return `<section class="panel monthly-report" data-monthly-report><h2>Обзор за месяц</h2><label>Месяц обзора<input type="month" name="report-month" value="${selected}" min="0001-01" max="9999-12" required></label><p class="hint">${r.from} — ${r.to} · ${esc(r.currency)}</p><dl>${[['Доходы',r.income],['Расходы',r.expense],['Результат периода',r.result]].map(([label,n])=>`<dt>${label}</dt><dd class="monthly-report-money" tabindex="0" aria-label="${label}: ${esc(formatMoney(n,r.currency))}">${esc(formatMoney(n,r.currency))}</dd>`).join('')}</dl><p class="hint">${r.empty?'За этот месяц нет подтверждённых доходов, расходов или возвратов.':'Результат периода — доходы минус чистые расходы. Возвраты уменьшают расходы в месяце возврата.'}</p></section>`;}catch{return '<section class="panel" data-monthly-report><h2>Обзор за месяц</h2><p role="alert">Не удалось рассчитать обзор. Проверьте месяц и валюту данных. Суммы разных валют не объединяются.</p></section>';}}
 function page(){return overview()+forecast.page();}
 function bind(){const el=root.querySelector('[name=report-month]');el?.addEventListener('change',()=>{if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(el.value)||el.value<'0001-01'){el.setCustomValidity('Выберите корректный месяц');el.reportValidity();return;}month=el.value;root.querySelector('[data-monthly-report]').outerHTML=overview();bind();root.querySelector('[name=report-month]')?.focus();});}
 function clear(){month=null;}
 return {page,bind,clear};
}
