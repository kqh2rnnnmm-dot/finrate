import {mountLite,demoDocument} from '../src/work-ui.mjs';
import {createDocument,validateDocument,apply,event,today} from '../src/model.mjs';
let doc=demoDocument();doc.events=[];doc.edits=[];doc.revision=0;doc.settings.theme='dark';doc=apply(doc,event(doc,'income',{amount:10000000,allocate:true,plan:doc.initialPlan},today()));
mountLite(document.getElementById('fr-inline-product'),{
  get:()=>doc,
  async save(next){validateDocument(next);doc=structuredClone(next);return doc;},
  async restore(next){validateDocument(next);doc=structuredClone(next);return doc;},
  async reset(){doc=createDocument();return doc;}
},{preview:true});
