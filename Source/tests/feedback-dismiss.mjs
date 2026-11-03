// Explicit user dismissal for smoke tests: financial has no X in approved G1.
export async function dismissFeedback(page){
 for(let i=0;i<30;i++){
  const notice=page.locator('.feedback-notice:visible');if(!await notice.count())return;
  await page.waitForFunction(()=>[...document.querySelectorAll('.feedback-notice')].every(e=>e.getAnimations().length===0));if(!await notice.count())return;
  if(await notice.locator('.feedback-close').count())await notice.locator('.feedback-close').click();
  else{const r=await notice.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2,r.y-70,{steps:5});await page.mouse.up();}
  await page.waitForTimeout(150);
 }
 throw Error('Notification queue did not finish after explicit user dismissals');
}
