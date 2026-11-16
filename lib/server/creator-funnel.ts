import 'server-only';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getApiBaseUrl } from '@/lib/get-api-base-url';
const options = {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:30*24*60*60};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function sameOrigin(request:NextRequest) { return request.headers.get('origin') === request.nextUrl.origin; }
export function publicHeaders(request:NextRequest) {const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();return {'Content-Type':'application/json',...(forwarded?{'X-Forwarded-For':forwarded}:{})};}
export async function recordVisit(request:NextRequest,code?:string) {
 const jar=await cookies();
 if(!code&&jar.has('zuimi_creator_last'))return;
 if(code&&!uuid.test(code))return;
 const agent=request.headers.get('user-agent')??'';
 if(/bot|crawler|spider|preview|facebookexternalhit|slack|whatsapp|linkedin/i.test(agent)||request.headers.get('purpose')==='prefetch'||request.headers.get('sec-purpose')?.includes('prefetch'))return;
 const stored=jar.get('zuimi_creator_visitor')?.value;
 const visitor=stored&&uuid.test(stored)?stored:crypto.randomUUID();
 const response=await fetch(`${getApiBaseUrl()}/coordination/public/visit/`,{method:'POST',headers:publicHeaders(request),body:JSON.stringify({visitor,code:code??null,user_agent:agent.slice(0,1000),referrer:(request.headers.get('referer')??'').slice(0,2048)}),cache:'no-store'});
 if(!response.ok)return;
 const data=await response.json();
 if(typeof data.token!=='string')return;
 jar.set('zuimi_creator_visitor',visitor,options);
 if(!jar.has('zuimi_creator_first'))jar.set('zuimi_creator_first',data.token,options);
 jar.set('zuimi_creator_last',data.token,options);
}
