import {readFile,chmod} from 'node:fs/promises';
// Optional local test-runtime binary; the application never imports this tool.
export async function chromiumPath(){const path=process.env.FINRATE_CHROMIUM||(await readFile('evidence/chromium-path.txt','utf8').catch(()=> '')).trim()||undefined;if(path)await chmod(path,0o755).catch(()=>{});return path;}
