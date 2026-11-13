import {createOpenProfile} from './open-profile.mjs';
import {mountLite} from './work-ui.mjs';
import {createVault,backupBlob,parseBackup,authorizeVault} from './crypto.mjs';
const root=document.getElementById('finrate-lite'),session=createOpenProfile();
function sizeToKeyboard(){root.style.height=Math.min(innerHeight,window.visualViewport?.height||innerHeight)+'px';}
window.addEventListener('resize',sizeToKeyboard);window.visualViewport?.addEventListener('resize',sizeToKeyboard);sizeToKeyboard();
session.exportBackup=async password=>{const {vault}=await createVault(session.get(),password);const url=URL.createObjectURL(backupBlob(vault)),a=document.createElement('a');a.href=url;a.download='FinRate_Lite_backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
session.importBackup=async(file,secret,mode)=>{const vault=await parseBackup(file),opened=await authorizeVault(vault,secret,mode);try{await session.restore(opened.doc);}finally{opened.raw.fill(0);}};
async function start(){await session.open();mountLite(root,session);}
start().catch(error=>{root.replaceChildren();const h=document.createElement('h1'),p=document.createElement('p'),b=document.createElement('button');h.textContent='Не удалось открыть тестовую базу';p.textContent=error.code==='ACCESS_LOST'?'Не найден локальный ключ. Нужна сохранённая копия.':error.message;b.textContent='Повторить';b.onclick=()=>location.reload();root.append(h,p,b);});
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
