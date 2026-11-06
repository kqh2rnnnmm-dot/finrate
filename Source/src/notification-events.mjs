import {limitTransitions,formatLimitAmount} from './limits.mjs';
import {notificationAllowed} from './ui-settings.mjs';
// Read-only snapshots of committed actions; never performs or repeats a financial write.
import {formatMoney} from './ui-values.mjs';
const kinds={expense:'Расход',income:'Доход',transfer:'Перевод',refund:'Возврат',adjustment:'Корректировка'};
const actions=new Set(['operation.add','operation.edit','operation.cancel','planning.confirm','account.reconcile','transfer.send','transfer.receive','transfer.return','transfer.cancel']);
export function completedNotification(before,after){
 if(!before||!after||before.datasetId!==after.datasetId)return {};
 const event=after.events.at(-1);if(!event||event.id===before.events.at(-1)?.id)return {};
 if(event.action.startsWith('security.'))return {mandatory:true,detail:event.action==='security.none'?'Проверка при входе отключена. Рекомендуется пароль или PIN.':''};
 if(!actions.has(event.action)&&!event.action.startsWith('transfer.'))return {};
 const previous=new Map(before.operations.map(o=>[o.id,o]));
 const meaningful=o=>{const {note,...value}=o;return JSON.stringify(value);};
 const records=after.operations.filter(o=>!previous.has(o.id)||meaningful(o)!==meaningful(previous.get(o.id))).map(o=>({id:o.id,kind:kinds[o.kind]||'Операция',amount:formatMoney(o.amount,after.currency),account:after.accounts.find(a=>a.id===o.accountId)?.name||'Счёт не найден',destination:o.transferTarget==='external'?o.recipient:after.accounts.find(a=>a.id===o.toAccountId)?.name,date:o.date,cancelled:!!o.cancelled,stage:o.stage||''}));
 if(!records.length)return {}; // Honest system confirmation when no genuine operation detail exists.
 const first=records[0];return {level:'financial',financial:records,detail:`${first.kind} · ${first.amount} · ${first.account}`};
}

// Same feedback queue/permission contract, no delivery cursor or financial writes.
export function completedLimitNotifications(before,after,today,{committed=true}={}){
 if(!committed||!after||!notificationAllowed({level:'financial'},after.settings))return [];
 const rows=limitTransitions(before,after,today);if(!rows.length)return [];
 const titles=rows.slice(0,3).map(r=>r.state==='exceeded'?`Лимит на «${r.name}» превышен на ${formatLimitAmount(r.exactExceeded,after.currency)}`:`На «${r.name}» потрачено ${String(r.percent).replace('.',',')}% лимита`);
 return [{title:titles.join('\n')+(rows.length>3?'\nЕщё лимитов: '+(rows.length-3):''),level:'financial'}];
}
