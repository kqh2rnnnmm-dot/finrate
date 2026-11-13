import {mountLite,demoDocument} from '../src/work-ui.mjs';
import {createDocument,validateDocument} from '../src/model.mjs';
let doc=demoDocument();
mountLite(document.getElementById('fr-inline-product'),{
  get:()=>doc,
  async save(next){validateDocument(next);doc=structuredClone(next);return doc;},
  async restore(next){validateDocument(next);doc=structuredClone(next);return doc;},
  async reset(){doc=createDocument();return doc;}
},{preview:true});
