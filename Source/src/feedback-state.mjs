// Ephemeral UI state only: no database, history, credentials or automatic retry.
export function createFeedbackState(){
 let current=null,waiting=[];
 return {
  get current(){return current;},get pending(){return waiting.length;},
  push(item){if(!item?.title)return false;const next={duration:item.error?8000:3000,...item};
   if(next.error){waiting=[];current=next;return true;}
   if(current?.error){waiting=[];current=next;return true;}
   if(current){waiting.push(next);return false;}current=next;return true;
  },
  dismiss(){current=waiting.shift()||null;return current;},
  clear(){current=null;waiting=[];}
 };
}
