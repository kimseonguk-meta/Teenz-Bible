import{a_ as m,a$ as y,b0 as T,b1 as D,b2 as Y,b3 as P,b4 as Ce,b5 as Ne,b6 as X,b7 as Oe,b8 as De,b9 as Pe,ba as S,n as Q,y as Z,w as ee,x as te,bb as j,bc as Re}from"./index-GemFix1132.js";const ne="@firebase/installations",R="0.6.22";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oe=1e4,re=`w:${R}`,ie="FIS_v2",Me="https://firebaseinstallations.googleapis.com/v1",Fe=3600*1e3,Ke="installations",$e="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qe={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},l=new Y(Ke,$e,qe);function ae(e){return e instanceof Ce&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function se({projectId:e}){return`${Me}/projects/${e}/installations`}function ce(e){return{token:e.token,requestStatus:2,expiresIn:je(e.expiresIn),creationTime:Date.now()}}async function ue(e,t){const o=(await t.json()).error;return l.create("request-failed",{requestName:e,serverCode:o.code,serverMessage:o.message,serverStatus:o.status})}function de({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function Le(e,{refreshToken:t}){const n=de(e);return n.append("Authorization",xe(t)),n}async function fe(e){const t=await e();return t.status>=500&&t.status<600?e():t}function je(e){return Number(e.replace("s","000"))}function xe(e){return`${ie} ${e}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Be({appConfig:e,heartbeatServiceProvider:t},{fid:n}){const o=se(e),r=de(e),i=t.getImmediate({optional:!0});if(i){const a=await i.getHeartbeatsHeader();a&&r.append("x-firebase-client",a)}const s={fid:n,authVersion:ie,appId:e.appId,sdkVersion:re},c={method:"POST",headers:r,body:JSON.stringify(s)},d=await fe(()=>fetch(o,c));if(d.ok){const a=await d.json();return{fid:a.fid||n,registrationStatus:2,refreshToken:a.refreshToken,authToken:ce(a.authToken)}}else throw await ue("Create Installation",d)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pe(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const He=/^[cdef][\w-]{21}$/,O="";function We(){try{const e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;const n=Ue(e);return He.test(n)?n:O}catch{return O}}function Ue(e){return Ve(e).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function k(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const le=new Map;function ge(e,t){const n=k(e);we(n,t),Ge(n,t)}function we(e,t){const n=le.get(e);if(n)for(const o of n)o(t)}function Ge(e,t){const n=Je();n&&n.postMessage({key:e,fid:t}),ze()}let p=null;function Je(){return!p&&"BroadcastChannel"in self&&(p=new BroadcastChannel("[Firebase] FID Change"),p.onmessage=e=>{we(e.data.key,e.data.fid)}),p}function ze(){le.size===0&&p&&(p.close(),p=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ye="firebase-installations-database",Xe=1,g="firebase-installations-store";let E=null;function M(){return E||(E=P(Ye,Xe,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(g)}}})),E}async function I(e,t){const n=k(e),r=(await M()).transaction(g,"readwrite"),i=r.objectStore(g),s=await i.get(n);return await i.put(t,n),await r.done,(!s||s.fid!==t.fid)&&ge(e,t.fid),t}async function he(e){const t=k(e),o=(await M()).transaction(g,"readwrite");await o.objectStore(g).delete(t),await o.done}async function A(e,t){const n=k(e),r=(await M()).transaction(g,"readwrite"),i=r.objectStore(g),s=await i.get(n),c=t(s);return c===void 0?await i.delete(n):await i.put(c,n),await r.done,c&&(!s||s.fid!==c.fid)&&ge(e,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function F(e){let t;const n=await A(e.appConfig,o=>{const r=Qe(o),i=Ze(e,r);return t=i.registrationPromise,i.installationEntry});return n.fid===O?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function Qe(e){const t=e||{fid:We(),registrationStatus:0};return be(t)}function Ze(e,t){if(t.registrationStatus===0){if(!navigator.onLine){const r=Promise.reject(l.create("app-offline"));return{installationEntry:t,registrationPromise:r}}const n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},o=et(e,n);return{installationEntry:n,registrationPromise:o}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:tt(e)}:{installationEntry:t}}async function et(e,t){try{const n=await Be(e,t);return I(e.appConfig,n)}catch(n){throw ae(n)&&n.customData.serverCode===409?await he(e.appConfig):await I(e.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function tt(e){let t=await x(e.appConfig);for(;t.registrationStatus===1;)await pe(100),t=await x(e.appConfig);if(t.registrationStatus===0){const{installationEntry:n,registrationPromise:o}=await F(e);return o||n}return t}function x(e){return A(e,t=>{if(!t)throw l.create("installation-not-found");return be(t)})}function be(e){return nt(e)?{fid:e.fid,registrationStatus:0}:e}function nt(e){return e.registrationStatus===1&&e.registrationTime+oe<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ot({appConfig:e,heartbeatServiceProvider:t},n){const o=rt(e,n),r=Le(e,n),i=t.getImmediate({optional:!0});if(i){const a=await i.getHeartbeatsHeader();a&&r.append("x-firebase-client",a)}const s={installation:{sdkVersion:re,appId:e.appId}},c={method:"POST",headers:r,body:JSON.stringify(s)},d=await fe(()=>fetch(o,c));if(d.ok){const a=await d.json();return ce(a)}else throw await ue("Generate Auth Token",d)}function rt(e,{fid:t}){return`${se(e)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function K(e,t=!1){let n;const o=await A(e.appConfig,i=>{if(!me(i))throw l.create("not-registered");const s=i.authToken;if(!t&&st(s))return i;if(s.requestStatus===1)return n=it(e,t),i;{if(!navigator.onLine)throw l.create("app-offline");const c=ut(i);return n=at(e,c),c}});return n?await n:o.authToken}async function it(e,t){let n=await B(e.appConfig);for(;n.authToken.requestStatus===1;)await pe(100),n=await B(e.appConfig);const o=n.authToken;return o.requestStatus===0?K(e,t):o}function B(e){return A(e,t=>{if(!me(t))throw l.create("not-registered");const n=t.authToken;return dt(n)?{...t,authToken:{requestStatus:0}}:t})}async function at(e,t){try{const n=await ot(e,t),o={...t,authToken:n};return await I(e.appConfig,o),n}catch(n){if(ae(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await he(e.appConfig);else{const o={...t,authToken:{requestStatus:0}};await I(e.appConfig,o)}throw n}}function me(e){return e!==void 0&&e.registrationStatus===2}function st(e){return e.requestStatus===2&&!ct(e)}function ct(e){const t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+Fe}function ut(e){const t={requestStatus:1,requestTime:Date.now()};return{...e,authToken:t}}function dt(e){return e.requestStatus===1&&e.requestTime+oe<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ft(e){const t=e,{installationEntry:n,registrationPromise:o}=await F(t);return o?o.catch(console.error):K(t).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function pt(e,t=!1){const n=e;return await lt(n),(await K(n,t)).token}async function lt(e){const{registrationPromise:t}=await F(e);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gt(e){if(!e||!e.options)throw v("App Configuration");if(!e.name)throw v("App Name");const t=["projectId","apiKey","appId"];for(const n of t)if(!e.options[n])throw v(n);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function v(e){return l.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ye="installations",wt="installations-internal",ht=e=>{const t=e.getProvider("app").getImmediate(),n=gt(t),o=D(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:o,_delete:()=>Promise.resolve()}},bt=e=>{const t=e.getProvider("app").getImmediate(),n=D(t,ye).getImmediate();return{getId:()=>ft(n),getToken:r=>pt(n,r)}};function mt(){y(new T(ye,ht,"PUBLIC")),y(new T(wt,bt,"PRIVATE"))}mt();m(ne,R);m(ne,R,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yt="/firebase-messaging-sw.js",Tt="/firebase-cloud-messaging-push-scope",Te="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",It="https://fcmregistrations.googleapis.com/v1",Ie="google.c.a.c_id",kt="google.c.a.c_l",At="google.c.a.ts",St="google.c.a.e",V=1e4;var H;(function(e){e[e.DATA_MESSAGE=1]="DATA_MESSAGE",e[e.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(H||(H={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var w;(function(e){e.PUSH_RECEIVED="push-received",e.NOTIFICATION_CLICKED="notification-clicked"})(w||(w={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function f(e){const t=new Uint8Array(e);return btoa(String.fromCharCode(...t)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Et(e){const t="=".repeat((4-e.length%4)%4),n=(e+t).replace(/\-/g,"+").replace(/_/g,"/"),o=atob(n),r=new Uint8Array(o.length);for(let i=0;i<o.length;++i)r[i]=o.charCodeAt(i);return r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _="fcm_token_details_db",vt=5,W="fcm_token_object_Store";async function _t(e){if("databases"in indexedDB&&!(await indexedDB.databases()).map(i=>i.name).includes(_))return null;let t=null;return(await P(_,vt,{upgrade:async(o,r,i,s)=>{if(r<2||!o.objectStoreNames.contains(W))return;const c=s.objectStore(W),d=await c.index("fcmSenderId").get(e);if(await c.clear(),!!d){if(r===2){const a=d;if(!a.auth||!a.p256dh||!a.endpoint)return;t={token:a.fcmToken,createTime:a.createTime??Date.now(),subscriptionOptions:{auth:a.auth,p256dh:a.p256dh,endpoint:a.endpoint,swScope:a.swScope,vapidKey:typeof a.vapidKey=="string"?a.vapidKey:f(a.vapidKey)}}}else if(r===3){const a=d;t={token:a.fcmToken,createTime:a.createTime,subscriptionOptions:{auth:f(a.auth),p256dh:f(a.p256dh),endpoint:a.endpoint,swScope:a.swScope,vapidKey:f(a.vapidKey)}}}else if(r===4){const a=d;t={token:a.fcmToken,createTime:a.createTime,subscriptionOptions:{auth:f(a.auth),p256dh:f(a.p256dh),endpoint:a.endpoint,swScope:a.swScope,vapidKey:f(a.vapidKey)}}}}}})).close(),await S(_),await S("fcm_vapid_details_db"),await S("undefined"),Ct(t)?t:null}function Ct(e){if(!e||!e.subscriptionOptions)return!1;const{subscriptionOptions:t}=e;return typeof e.createTime=="number"&&e.createTime>0&&typeof e.token=="string"&&e.token.length>0&&typeof t.auth=="string"&&t.auth.length>0&&typeof t.p256dh=="string"&&t.p256dh.length>0&&typeof t.endpoint=="string"&&t.endpoint.length>0&&typeof t.swScope=="string"&&t.swScope.length>0&&typeof t.vapidKey=="string"&&t.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nt="firebase-messaging-database",Ot=1,h="firebase-messaging-store";let C=null;function ke(){return C||(C=P(Nt,Ot,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(h)}}})),C}async function Dt(e){const t=Ae(e),o=await(await ke()).transaction(h).objectStore(h).get(t);if(o)return o;{const r=await _t(e.appConfig.senderId);if(r)return await $(e,r),r}}async function $(e,t){const n=Ae(e),r=(await ke()).transaction(h,"readwrite");return await r.objectStore(h).put(t,n),await r.done,t}function Ae({appConfig:e}){return e.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pt={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},u=new Y("messaging","Messaging",Pt);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Rt(e,t){const n=await L(e),o=Se(t),r={method:"POST",headers:n,body:JSON.stringify(o)};let i;try{i=await(await fetch(q(e.appConfig),r)).json()}catch(s){throw u.create("token-subscribe-failed",{errorInfo:s?.toString()})}if(i.error){const s=i.error.message;throw u.create("token-subscribe-failed",{errorInfo:s})}if(!i.token)throw u.create("token-subscribe-no-token");return i.token}async function Mt(e,t){const n=await L(e),o=Se(t.subscriptionOptions),r={method:"PATCH",headers:n,body:JSON.stringify(o)};let i;try{i=await(await fetch(`${q(e.appConfig)}/${t.token}`,r)).json()}catch(s){throw u.create("token-update-failed",{errorInfo:s?.toString()})}if(i.error){const s=i.error.message;throw u.create("token-update-failed",{errorInfo:s})}if(!i.token)throw u.create("token-update-no-token");return i.token}async function Ft(e,t){const o={method:"DELETE",headers:await L(e)};try{const i=await(await fetch(`${q(e.appConfig)}/${t}`,o)).json();if(i.error){const s=i.error.message;throw u.create("token-unsubscribe-failed",{errorInfo:s})}}catch(r){throw u.create("token-unsubscribe-failed",{errorInfo:r?.toString()})}}function q({projectId:e}){return`${It}/projects/${e}/registrations`}async function L({appConfig:e,installations:t}){const n=await t.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e.apiKey,"x-goog-firebase-installations-auth":`FIS ${n}`})}function Se({p256dh:e,auth:t,endpoint:n,vapidKey:o}){const r={web:{endpoint:n,auth:t,p256dh:e}};return o!==Te&&(r.web.applicationPubKey=o),r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kt=10080*60*1e3;async function $t(e){const t=await Lt(e.swRegistration,e.vapidKey),n={vapidKey:e.vapidKey,swScope:e.swRegistration.scope,endpoint:t.endpoint,auth:f(t.getKey("auth")),p256dh:f(t.getKey("p256dh"))},o=await Dt(e.firebaseDependencies);if(o){if(jt(o.subscriptionOptions,n))return Date.now()>=o.createTime+Kt?qt(e,{token:o.token,createTime:Date.now(),subscriptionOptions:n}):o.token;try{await Ft(e.firebaseDependencies,o.token)}catch(r){console.warn(r)}return U(e.firebaseDependencies,n)}else return U(e.firebaseDependencies,n)}async function qt(e,t){try{const n=await Mt(e.firebaseDependencies,t),o={...t,token:n,createTime:Date.now()};return await $(e.firebaseDependencies,o),n}catch(n){throw n}}async function U(e,t){const o={token:await Rt(e,t),createTime:Date.now(),subscriptionOptions:t};return await $(e,o),o.token}async function Lt(e,t){const n=await e.pushManager.getSubscription();return n||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Et(t)})}function jt(e,t){const n=t.vapidKey===e.vapidKey,o=t.endpoint===e.endpoint,r=t.auth===e.auth,i=t.p256dh===e.p256dh;return n&&o&&r&&i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function G(e){const t={from:e.from,collapseKey:e.collapse_key,messageId:e.fcmMessageId};return xt(t,e),Bt(t,e),Vt(t,e),t}function xt(e,t){if(!t.notification)return;e.notification={};const n=t.notification.title;n&&(e.notification.title=n);const o=t.notification.body;o&&(e.notification.body=o);const r=t.notification.image;r&&(e.notification.image=r);const i=t.notification.icon;i&&(e.notification.icon=i)}function Bt(e,t){t.data&&(e.data=t.data)}function Vt(e,t){if(!t.fcmOptions&&!t.notification?.click_action)return;e.fcmOptions={};const n=t.fcmOptions?.link??t.notification?.click_action;n&&(e.fcmOptions.link=n);const o=t.fcmOptions?.analytics_label;o&&(e.fcmOptions.analyticsLabel=o)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ht(e){return typeof e=="object"&&!!e&&Ie in e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wt(e){if(!e||!e.options)throw N("App Configuration Object");if(!e.name)throw N("App Name");const t=["projectId","apiKey","appId","messagingSenderId"],{options:n}=e;for(const o of t)if(!n[o])throw N(o);return{appName:e.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function N(e){return u.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(t,n,o){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const r=Wt(t);this.firebaseDependencies={app:t,appConfig:r,installations:n,analyticsProvider:o}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gt(e){try{e.swRegistration=await navigator.serviceWorker.register(yt,{scope:Tt}),e.swRegistration.update().catch(()=>{}),await Jt(e.swRegistration)}catch(t){throw u.create("failed-service-worker-registration",{browserErrorMessage:t?.message})}}async function Jt(e){return new Promise((t,n)=>{const o=setTimeout(()=>n(new Error(`Service worker not registered after ${V} ms`)),V),r=e.installing||e.waiting;e.active?(clearTimeout(o),t()):r?r.onstatechange=i=>{i.target?.state==="activated"&&(r.onstatechange=null,clearTimeout(o),t())}:(clearTimeout(o),n(new Error("No incoming service worker found.")))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zt(e,t){if(!t&&!e.swRegistration&&await Gt(e),!(!t&&e.swRegistration)){if(!(t instanceof ServiceWorkerRegistration))throw u.create("invalid-sw-registration");e.swRegistration=t}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Yt(e,t){t?e.vapidKey=t:e.vapidKey||(e.vapidKey=Te)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ee(e,t){if(!navigator)throw u.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw u.create("permission-blocked");return await Yt(e,t?.vapidKey),await zt(e,t?.serviceWorkerRegistration),$t(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xt(e,t,n){const o=Qt(t);(await e.firebaseDependencies.analyticsProvider.get()).logEvent(o,{message_id:n[Ie],message_name:n[kt],message_time:n[At],message_device_time:Math.floor(Date.now()/1e3)})}function Qt(e){switch(e){case w.NOTIFICATION_CLICKED:return"notification_open";case w.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zt(e,t){const n=t.data;if(!n.isFirebaseMessaging)return;e.onMessageHandler&&n.messageType===w.PUSH_RECEIVED&&(typeof e.onMessageHandler=="function"?e.onMessageHandler(G(n)):e.onMessageHandler.next(G(n)));const o=n.data;Ht(o)&&o[St]==="1"&&await Xt(e,n.messageType,o)}const J="@firebase/messaging",z="0.12.26";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const en=e=>{const t=new Ut(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),e.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",n=>Zt(t,n)),t},tn=e=>{const t=e.getProvider("messaging").getImmediate();return{getToken:o=>Ee(t,o)}};function nn(){y(new T("messaging",en,"PUBLIC")),y(new T("messaging-internal",tn,"PRIVATE")),m(J,z),m(J,z,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ve(){try{await Oe()}catch{return!1}return typeof window<"u"&&De()&&Pe()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function on(e=Ne()){return ve().then(t=>{if(!t)throw u.create("unsupported-browser")},t=>{throw u.create("indexed-db-unsupported")}),D(X(e),"messaging").getImmediate()}async function rn(e,t){return e=X(e),Ee(e,t)}nn();const an={apiKey:"AIzaSyCJ5qm_sCzkUfFGC8WcTGbjfviBz_SyNAg",authDomain:"teens-bible-94271.firebaseapp.com",projectId:"teens-bible-94271",storageBucket:"teens-bible-94271.firebasestorage.app",messagingSenderId:"226355097233",appId:"1:226355097233:web:838afede878c9915225930"},sn=j().length>0?j()[0]:Re(an),cn="BLBx-hf5M3pCJBEAHdPiOEpGgD-EXAMPLE-REPLACE-WITH-REAL-KEY";let b=null;async function un(){try{return await ve()}catch{return!1}}async function dn(){return b||(await un()?(b=on(sn),b):null)}async function pn(){try{if(!("Notification"in window)||await Notification.requestPermission()!=="granted")return null;const t=await navigator.serviceWorker.register("/firebase-messaging-sw.js"),n=await dn();if(!n)return null;const o=await rn(n,{vapidKey:cn,serviceWorkerRegistration:t});return o||null}catch(e){return console.error("Error getting FCM token:",e),null}}async function ln(e){const t=Q.currentUser?.uid;if(t)try{await Z(ee(te,`users/${t}/fcmTokens/${e.substring(0,20)}`),{token:e,platform:"web",updatedAt:Date.now(),userAgent:navigator.userAgent.substring(0,100)})}catch(n){console.error("Error saving FCM token:",n)}}async function gn(e){const t=Q.currentUser?.uid;if(t)try{await Z(ee(te,`users/${t}/reminderSettings`),{...e,updatedAt:Date.now()})}catch(n){console.error("Error saving reminder settings:",n)}}export{un as isFCMSupported,pn as requestNotificationPermission,ln as saveFCMToken,gn as saveReminderSettings};
