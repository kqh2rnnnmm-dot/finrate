// Optional UI preferences. Old documents remain valid without adding defaults to storage.
export function uiPreferences(settings={}){
 return {colorPalette:settings.colorPalette==='color'?'color':'neutral',notificationsEnabled:settings.notificationsEnabled!==false,financialNotifications:settings.financialNotifications!==false,systemNotifications:settings.systemNotifications!==false};
}
export function notificationAllowed(item,settings){const p=uiPreferences(settings);return !!(item.error||item.mandatory||p.notificationsEnabled&&(item.level==='financial'?p.financialNotifications:p.systemNotifications));}
export function notificationForm(form){return Object.fromEntries(['notificationsEnabled','financialNotifications','systemNotifications'].map(key=>[key,form.elements[key].checked]));}
