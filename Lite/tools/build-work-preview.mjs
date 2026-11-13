import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
// The in-chat adapter uses synthetic sequential IDs only. The real app keeps
// crypto.randomUUID and requires HTTPS. No global browser API is patched.
await build({entryPoints:['tools/work-preview.mjs'],bundle:true,format:'iife',target:'safari16',outfile:'evidence/work-ios02/preview.js',plugins:[{name:'memory-preview-ids',setup(b){b.onLoad({filter:/[\\/]src[\\/]model\.mjs$/},async({path})=>({contents:'let previewId=0;\n'+(await readFile(path,'utf8')).replace('crypto.randomUUID()',"('preview-'+(++previewId))"),loader:'js'}));}}]});
