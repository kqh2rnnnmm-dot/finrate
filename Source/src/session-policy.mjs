// Only elapsed time and a short-lived download intent; no key or financial data.
export function createSessionPolicy(clock=()=>Date.now()){
 let hiddenAt=null,externalUntil=0;
 return {
  hide(){if(hiddenAt===null)hiddenAt=clock();},
  expired(minutes){return hiddenAt!==null&&minutes>=0&&clock()-hiddenAt>=minutes*60000;},
  remaining(minutes){return minutes<0?Infinity:Math.max(0,minutes*60000-(hiddenAt===null?0:clock()-hiddenAt));},
  resume(){hiddenAt=null;externalUntil=0;},
  expectDownload(){externalUntil=clock()+2000;},
  consumeDownload(){const allowed=externalUntil>0&&clock()<=externalUntil;externalUntil=0;return allowed;}
 };
}
