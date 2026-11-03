import {precacheAndRoute,matchPrecache,cleanupOutdatedCaches} from 'workbox-precaching';
import {registerRoute,NavigationRoute} from 'workbox-routing';
precacheAndRoute(self.__WB_MANIFEST,{ignoreURLParametersMatching:[]});
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(async()=>await matchPrecache('index.html')||new Response('Подключитесь к интернету и снова откройте FinRate. Данные на устройстве не изменены.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}}),{denylist:[/[?&](code|state|token|access_token|error)=/]}));
// No API caching, background queue, forced activation or cloud integration.
// Activation is requested only after the user accepts the update in the UI.
let approvedUpdate=false;
self.addEventListener('message',event=>{if(event.data?.type==='FINRATE_APPLY_UPDATE'){approvedUpdate=true;event.waitUntil(self.skipWaiting());}});
self.addEventListener('activate',event=>{if(approvedUpdate)event.waitUntil(self.clients.claim());});
