import { cookies } from 'next/headers';
import { NextRequest,NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/get-api-base-url';
import { publicHeaders,sameOrigin } from '@/lib/server/creator-funnel';
const fields=['name','email','phone','company','country','role','film_title','film_stage','genre','synopsis','portfolio_url','rights_confirmed','consent','website'];
export async function POST(request:NextRequest) {
 if(!sameOrigin(request))return NextResponse.json({detail:'Invalid request origin.'},{status:403});
 try{
  const raw=await request.text();if(raw.length>40000)return NextResponse.json({detail:'Application is too large.'},{status:413});
  let data;try{data=JSON.parse(raw);}catch{return NextResponse.json({detail:'Invalid application.'},{status:400});}
  if(!data||typeof data!=='object'||Array.isArray(data))return NextResponse.json({detail:'Invalid application.'},{status:400});
  const jar=await cookies();
  const body={...Object.fromEntries(fields.filter(f=>f in data).map(f=>[f,data[f]])),first_token:jar.get('zuimi_creator_first')?.value,last_token:jar.get('zuimi_creator_last')?.value};
  const response=await fetch(`${getApiBaseUrl()}/coordination/public/apply/`,{method:'POST',headers:publicHeaders(request),body:JSON.stringify(body),cache:'no-store'});
  if(response.status>=500)return NextResponse.json({detail:'Applications are temporarily unavailable. Please retry shortly.'},{status:503});
  return NextResponse.json(await response.json(),{status:response.status,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({detail:'We could not submit your application. Please retry shortly.'},{status:503});}
}
