import { NextRequest,NextResponse } from 'next/server';
import { recordVisit } from '@/lib/server/creator-funnel';
export const dynamic='force-dynamic';
type Context={params:Promise<{code:string}>};
export async function GET(request:NextRequest,{params}:Context) {
 const {code}=await params;
 try{await recordVisit(request,code);}catch{/* Creator access remains available during a tracking outage. */}
 return NextResponse.redirect(new URL('/creators/apply/',request.url),{status:302,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'strict-origin-when-cross-origin'}});
}
export async function HEAD(request:NextRequest) {return NextResponse.redirect(new URL('/creators/apply/',request.url),{status:302,headers:{'Cache-Control':'private, no-store'}});}
