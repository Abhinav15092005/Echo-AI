function hdr(headers,name){
if(!headers)return null;const lo=name.toLowerCase();
for(const k of Object.keys(headers))if(k.toLowerCase()===lo)return headers[k];
return null;
}
function durToMs(s){
if(!s)return null;const t=String(s).trim();
if(/^\d+(\.\d+)?$/.test(t))return parseFloat(t)*1000;
let sum=0;const re=/(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)/gi;let m;
while((m=re.exec(t))){const n=parseFloat(m[1]);const u=m[2].toLowerCase();sum+=n*({ms:1,s:1e3,m:6e4,h:36e5,d:864e5}[u]||0)}
return sum||null;
}
function retryMs(v){
if(!v)return null;const t=String(v).trim();
if(/^\d+(\.\d+)?$/.test(t))return parseFloat(t)*1000;
const d=durToMs(t);if(d!=null)return d;
const dt=Date.parse(t);return isNaN(dt)?null:Math.max(0,dt-Date.now());
}
export class KeyPool{
constructor(keys,{onAnnounce=()=>{},onUpdate=()=>{}}={}){
this.keys=keys.map((k,i)=>({...k,index:i,limitRequests:null,remainingRequests:null,
limitTokens:null,remainingTokens:null,resetRequestsAt:null,resetTokensAt:null,
cooldownUntil:0,lastUsed:0,successes:0,failures:0,invalid:false,warned:false}));
this.onAnnounce=onAnnounce;this.onUpdate=onUpdate;
}
snapshot(){return this.keys.map(k=>({...k}))}
updateFromHeaders(key,headers){
const lr=hdr(headers,'x-ratelimit-limit-requests');
const rr=hdr(headers,'x-ratelimit-remaining-requests');
const lt=hdr(headers,'x-ratelimit-limit-tokens');
const rt=hdr(headers,'x-ratelimit-remaining-tokens');
const rR=hdr(headers,'x-ratelimit-reset-requests');
const rT=hdr(headers,'x-ratelimit-reset-tokens');
if(lr!=null)key.limitRequests=+lr;
if(rr!=null)key.remainingRequests=+rr;
if(lt!=null)key.limitTokens=+lt;
if(rt!=null)key.remainingTokens=+rt;
if(rR)key.resetRequestsAt=Date.now()+(durToMs(rR)||0);
if(rT)key.resetTokensAt=Date.now()+(durToMs(rT)||0);
if(key.remainingRequests===0)key.cooldownUntil=Math.max(key.cooldownUntil,key.resetRequestsAt||Date.now()+6e4);
this.onUpdate(this.snapshot());
}
pick(){
const now=Date.now();
const av=this.keys.filter(k=>!k.invalid&&k.cooldownUntil<=now&&(k.remainingRequests==null||k.remainingRequests>0));
if(!av.length)return null;
av.sort((a,b)=>{
const ar=a.remainingRequests==null?Infinity:a.remainingRequests;
const br=b.remainingRequests==null?Infinity:b.remainingRequests;
return br!==ar?br-ar:a.lastUsed-b.lastUsed;
});
const c=av[0];c.lastUsed=now;return c;
}
mark429(key,headers){
const ms=retryMs(hdr(headers,'retry-after'))??6e4;
key.cooldownUntil=Date.now()+ms;key.failures++;key.remainingRequests=0;
this.updateFromHeaders(key,headers);return ms;
}
markInvalid(key){key.invalid=true;key.cooldownUntil=Date.now()+864e5;this.onUpdate(this.snapshot())}
markSuccess(key){key.successes++}
soonestCooldown(){
const now=Date.now();
const u=this.keys.filter(k=>!k.invalid&&k.cooldownUntil>now).map(k=>k.cooldownUntil).sort((a,b)=>a-b);
return u[0]||null;
}
maybeWarn(key){
if(key.warned)return;
if(key.remainingRequests!=null&&key.remainingRequests<=50){
key.warned=true;
this.onAnnounce('Warning. '+key.name+' has only '+key.remainingRequests+' requests remaining today.');
}
}
}