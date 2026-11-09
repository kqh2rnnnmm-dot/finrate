import {reportPeriod} from './report-period.mjs';
import {formatMoney} from './ui-values.mjs';
import {localDate} from './operations.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createReportView({app,root,forecast}){
 let selected=null;
 function summary(){const month=selected||localDate().slice(0,7);let values;try{values=reportPeriod(app.document,month);}catch{return '<section class="panel" data-period-report><h2>Обзор за месяц</h2><p role="alert">Обзор недоступен. Проверьте месяц и валюту данных: разные валюты нельзя объединить без курса.</p></section>';}
  return `<section class="panel period-report" data-period-report><h2>Обзор за месяц</h2><label>Период отчёта<input type="month" data-report-month value="${month}" min="0001-01" max="9999-12" required></label><p class="hint">${values.from} — ${values.to} · ${values.currency}</p><dl>${[['Доходы','income'],['Расходы','expense'],['Результат периода','result']].map(([label,key])=>`<dt>${label}</dt><dd tabindex="0" class="period-report-value" data-report-value="${key}" aria-label="${label}: ${escape(formatMoney(values[key],values.currency))}">${escape(formatMoney(values[key],values.currency))}</dd>`).join('')}</dl><p class="hint">${values.empty?'В этом месяце нет подтверждённых доходов, расходов или возвратов.':'Результат — доходы минус расходы с учётом возвратов. Это не изменение остатка на счетах.'}</p></section>`;
 }
 function page(){return summary()+forecast.page();}
 function bind(){const field=root.querySelector('[data-report-month]');if(!field)return;field.addEventListener('change',()=>{if(!field.value||!field.validity.valid){field.reportValidity();return;}selected=field.value;root.querySelector('[data-period-report]').outerHTML=summary();bind();root.querySelector('[data-report-month]')?.focus();});}
 return {page,bind,clear:()=>{selected=null;}};
}
