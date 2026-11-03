// Compare captures made by the same pinned browser/runtime, not arbitrary OS font renderers.
import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const rows=[];for(const theme of ['light','dark'])for(const screen of ['home','operations','accounts','categories','plans','chooser','form','note','security','data']){
 const before=`evidence/g1-before-chromium-neutral-${theme}-${screen}.png`,after=before.replace('-before-','-after-'),a=await readFile(before),b=await readFile(after),hash=x=>createHash('sha256').update(x).digest('hex');rows.push({theme,screen,before,after,identical:a.equals(b),beforeSHA256:hash(a),afterSHA256:hash(b)});
}
await writeFile('evidence/g1-neutral-before-after.json',JSON.stringify({baseMain:'025fa8e07d35c354376cfa316187e914010f196d',build:'g1-theme01',compared:rows.length,identical:rows.filter(x=>x.identical).length,scope:'390×844, same Chromium runtime, both themes; new Settings controls and FAQ content excluded',rows},null,2)+'\n');assert.ok(rows.every(x=>x.identical),JSON.stringify(rows.filter(x=>!x.identical)));console.log('PASS 20/20 unchanged neutral screen PNGs');
