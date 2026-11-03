// Ephemeral UI state only: no database, history, credentials or automatic retry.
export function createFeedbackState(){
 let current=null,waiting=[];
 const required=item=>!!(item?.error||item?.mandatory);
 return {
  get current(){return current;},get pending(){return waiting.length;},
  push(item){if(!item?.title)return false;const next={duration:item.error||item.mandatory?0:item.level==='financial'?5000:3000,...item};
   if(required(next)){waiting=waiting.filter(required);if(required(current)){waiting.push(next);return false;}current=next;return true;}
   if(current?.error&&next.resolveError){current=next;return true;}
   if(current){waiting.push(next);return false;}current=next;return true;
  },
  filter(allowed){waiting=waiting.filter(allowed);if(current&&!allowed(current))current=waiting.shift()||null;},
  dismiss(){current=waiting.shift()||null;return current;},
  clear(){current=null;waiting=[];}
 };
}
