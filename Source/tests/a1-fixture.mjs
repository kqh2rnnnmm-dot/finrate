// Audit fixtures are entirely fictional. Secrets are generated per run and never serialized to evidence.
import {newDocument,addAccount,addCategory,changed,totals,validateDocument} from '../src/model.mjs';
import {saveFact} from '../src/block02.mjs';import {saveDraft} from '../src/operations.mjs';
import {saveRecurringIncome,incomeOccurrences,confirmPlannedIncome,forecast} from '../src/planning.mjs';import {creditSummary} from '../src/credit.mjs';
export const secret=()=>crypto.randomUUID()+crypto.randomUUID();
export function auditDocument(){
 const d=newDocument();addAccount(d,{id:'a',name:'Audit fictional debit',opening:10000000});addAccount(d,{id:'b',name:'Audit fictional wallet',opening:0});addAccount(d,{id:'c',name:'Audit fictional credit',financeType:'credit',credit:{limit:5000000,grace:{mode:'days',days:55}}});
 addCategory(d,{id:'food',name:'Audit fictional food'});addCategory(d,{id:'sub',name:'Audit fictional subcategory',parentId:'food'});addCategory(d,{id:'salary',name:'Audit fictional income',type:'income'});
 saveFact(d,{id:'debit-expense',kind:'expense',accountId:'a',amount:33345,date:'2026-10-10',allocations:[{categoryId:'sub',amount:33345}],note:'Audit fictional note'});
 saveFact(d,{id:'salary-fact',kind:'income',accountId:'a',amount:200000,date:'2026-10-10',allocations:[{categoryId:'salary',amount:200000}]});
 saveFact(d,{id:'transfer',kind:'transfer',accountId:'a',toAccountId:'b',amount:50000,date:'2026-10-10'});
 saveFact(d,{id:'credit-buy',kind:'expense',accountId:'c',amount:120000,date:'2026-10-10',allocations:[{categoryId:'food',amount:120000}]});
 saveFact(d,{id:'repayment',kind:'transfer',accountId:'a',toAccountId:'c',amount:120000,date:'2026-10-11'});
 saveFact(d,{id:'refund',kind:'refund',referenceId:'credit-buy',accountId:'c',amount:40000,date:'2026-10-12',refundChoice:'keep',allocations:[{categoryId:'food',amount:40000}]});
 saveRecurringIncome(d,{id:'plan',name:'Audit fictional plan',amount:800000,repeat:'monthly',day:3,weekday:1,month:1,accountId:'a',categoryId:'salary'},'2026-11-01');const occurrence=incomeOccurrences(d,'2026-11-03','2026-11-03')[0];confirmPlannedIncome(d,occurrence.id,{id:'plan-fact',date:'2026-11-03',today:'2026-11-03',accountId:'a',amount:300000},{final:false});d.planning.onboarding='skipped';
 saveDraft(d,{id:'draft',kind:'expense',amount:'12.34',date:'2026-11-03',accountId:'a',categoryId:'food',toAccountId:'',note:'Audit fictional draft',fee:'',feeMode:'extra',inTransit:false,split:[]},'draft');
 Object.assign(d.settings,{appearance:'dark',colorPalette:'color',notificationsEnabled:false,financialNotifications:false,systemNotifications:true,topPalette:'olive',bottomPalette:'plum'});changed(d,'audit.fixture');return validateDocument(d);
}
export function financialState(d){return {totals:totals(d),credit:creditSummary(d,'c','2026-11-03'),modes:Object.fromEntries(['month','m2','m3','m4','all'].map(mode=>[mode,forecast(d,'2026-11-03',mode)])),operations:d.operations.length,events:d.events.length,drafts:d.drafts.length,settings:d.settings};}
