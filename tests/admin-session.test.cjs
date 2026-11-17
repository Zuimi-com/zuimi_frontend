const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const {AsyncLocalStorage}=require('node:async_hooks');
function setup({fail=false}={}){
 const context=new AsyncLocalStorage(),timers=[];let refreshCalls=0;
 const code=ts.transpileModule(fs.readFileSync('lib/server/admin-session.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};
 const fetch=async(url,options)=>{
  if(url.endsWith('/token/generate-access-token/')){
   refreshCalls++;await new Promise(resolve=>setImmediate(resolve));
   return fail||refreshCalls>1?Response.json({error:'Rotated token is no longer valid'},{status:400}):Response.json({access:'fresh-access',refresh:'rotated-refresh'});
  }
  return options.headers.Authorization==='Bearer fresh-access'?Response.json({ok:true}):Response.json({detail:'Expired'},{status:401});
 };
 Function('require','module','exports','fetch','setTimeout',code)(id=>{
  if(id==='server-only')return {};
  if(id==='next/headers')return {cookies:async()=>context.getStore()};
  if(id==='@/lib/get-api-base-url')return {getApiBaseUrl:()=> 'http://qa.test/api'};
  throw Error(id);
 },mod,mod.exports,fetch,fn=>{timers.push(fn);return {unref(){}};});
 const jar=()=>{const values=new Map([['zuimi_admin_access','expired'],['zuimi_admin_refresh','original-refresh']]);return {get:name=>values.has(name)?{value:values.get(name)}:undefined,set:(name,value)=>values.set(name,value),delete:name=>values.delete(name)};};
 return {get refreshCalls(){return refreshCalls;},timers,jar,run:(store,path)=>context.run(store,()=>mod.exports.fetchWithAdminSession(path))};
}
test('simultaneous board requests share a refresh and each response receives the rotated cookies',async()=>{
 const h=setup(),jars=[h.jar(),h.jar(),h.jar()];
 const responses=await Promise.all(jars.map((jar,i)=>h.run(jar,['/coordination/work/','/coordination/applications/','/coordination/campaigns/analytics/'][i])));
 assert.deepEqual(responses.map(r=>r.status),[200,200,200]);assert.equal(h.refreshCalls,1);
 for(const jar of jars){assert.equal(jar.get('zuimi_admin_access').value,'fresh-access');assert.equal(jar.get('zuimi_admin_refresh').value,'rotated-refresh');}
});
test('failed shared refresh clears each request session without retaining a rejected cache entry',async()=>{
 const h=setup({fail:true}),jars=[h.jar(),h.jar()];
 const responses=await Promise.all(jars.map(jar=>h.run(jar,'/coordination/work/')));
 assert.deepEqual(responses.map(r=>r.status),[401,401]);assert.equal(h.refreshCalls,1);
 for(const jar of jars)assert.equal(jar.get('zuimi_admin_refresh'),undefined);
 await h.run(h.jar(),'/coordination/work/');assert.equal(h.refreshCalls,2);
});
test('a briefly queued old-cookie request reuses rotated tokens and the cache expires',async()=>{
 const h=setup();assert.equal((await h.run(h.jar(),'/coordination/work/')).status,200);
 assert.equal((await h.run(h.jar(),'/coordination/applications/')).status,200);assert.equal(h.refreshCalls,1);
 h.timers.forEach(fn=>fn());
 assert.equal((await h.run(h.jar(),'/coordination/work/')).status,401);assert.equal(h.refreshCalls,2);
});
