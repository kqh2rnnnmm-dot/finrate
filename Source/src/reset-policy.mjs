import {copy,newDocument,validateDocument,fail} from './model.mjs';
import {defaultPlanning,planningMode} from './planning.mjs';
import {uiPreferences} from './ui-settings.mjs';
export const RESET_MODES=Object.freeze({
 financial:{title:'Очистить финансовые данные',word:'ОЧИСТИТЬ ФИНАНСЫ',action:'Очистить финансовые данные'},
 categories:{title:'Очистить данные и категории',word:'ОЧИСТИТЬ КАТЕГОРИИ',action:'Очистить данные и категории'},
 all:{title:'Полный сброс FinRate',word:'СБРОСИТЬ FINRATE',action:'Удалить все данные'}
});
const rootKeys=new Set(['schema','datasetId','currency','createdAt','updatedAt','revision','accounts','categories','operations','events','drafts','operationEdits','categoryEdits','accountEdits','settings','planning']);
const settingKeys=new Set(['defaultOperation','theme','autoLock','lastAccountId','appearance','topPalette','bottomPalette','homeTiles','homeTileStyle','edgeSide','colorPalette','notificationsEnabled','financialNotifications','systemNotifications']);
const known=(object,keys)=>Object.keys(object||{}).every(k=>keys.has(k));
export function assertResetMode(mode){if(!Object.hasOwn(RESET_MODES,mode))fail('FORMAT');}
export function assertResetSupported(d,mode){
 assertResetMode(mode);if(mode==='all')return;
 if(!known(d,rootKeys)||!known(d.settings,settingKeys)||d.categories.some(c=>!known(c,new Set(['id','name','type','parentId','archived','mergedInto'])))||d.settings.homeTiles.some(t=>!known(t,new Set(['metric','accountId','creditMetric']))))fail('RESET_UNSUPPORTED');
}
export function resetSummary(d,mode,safety,entry){
 assertResetSupported(d,mode);
 return {mode,accounts:d.accounts.length,categories:d.categories.filter(c=>!c.parentId).length,subcategories:d.categories.filter(c=>c.parentId).length,operations:d.operations.length,plans:d.planning?.incomes.length||0,occurrences:d.planning?.occurrences.length||0,links:d.planning?.links.length||0,drafts:d.drafts.length,events:d.events.length,edits:d.operationEdits.length+d.accountEdits.length+d.categoryEdits.length,safety,entry:entry.mode,currency:d.currency,autoLock:d.settings.autoLock};
}
export function clearedDocument(d,mode){
 assertResetSupported(d,mode);if(mode==='all')fail('FORMAT');
 const n=newDocument(d.currency);n.datasetId=d.datasetId;n.createdAt=d.createdAt;n.revision=d.revision+1;
 if(mode==='financial'){
  n.categories=copy(d.categories);n.settings=copy(d.settings);n.settings.lastAccountId=null;
  n.settings.homeTiles=d.settings.homeTiles.map(t=>({metric:t.metric==='credit'?'account':t.metric}));
 }else Object.assign(n.settings,uiPreferences(),{edgeSide:'right',homeTileStyle:'numbers'});
 n.settings.autoLock=d.settings.autoLock;
 n.planning={...defaultPlanning(),mode:mode==='financial'?planningMode(d):'month',onboarding:'skipped'};
 return validateDocument(n);
}
// Compare the complete parsed container independent of JSON property ordering.
export function sameContainer(a,b){const stable=x=>x&&typeof x==='object'?Array.isArray(x)?x.map(stable):Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;return JSON.stringify(stable(a))===JSON.stringify(stable(b));}
