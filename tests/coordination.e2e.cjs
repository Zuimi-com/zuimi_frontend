const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const base = process.env.ZUIMI_E2E_BASE_URL || 'http://127.0.0.1:3302';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw Error('Run this suite only against an isolated local QA environment.');
const prefix = `QA ${Date.now()}`;

test('coordination page persists all workspace and creator-funnel flows through real APIs', {timeout: 300000}, async t => {
 const browser = await chromium.launch({executablePath:process.env.ZUIMI_BROWSER_PATH || '/opt/brave.com/brave/brave',headless:true,args:['--no-sandbox']});
 const context = await browser.newContext({baseURL:base,permissions:['clipboard-read','clipboard-write']});
 const page = await context.newPage();
 page.setDefaultTimeout(60000);
 const errors=[], responses=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().includes('/api/'))responses.push({path:new URL(r.url()).pathname,status:r.status()});});
 const api=async(path,method='GET',data)=>{
  const r=await context.request.fetch(`/api/admin/backend/coordination/${path}`,{method,data,headers:{Origin:base}});
  return {status:r.status(),data:await r.json()};
 };
 const section=async name=>page.getByRole('navigation',{name:'Workspace navigation'}).getByRole('button',{name,exact:true}).click();
 const saveDialog=async(method='POST',expected=201)=>{
  const response=page.waitForResponse(r=>r.url().includes('/coordination/work')&&r.request().method()===method&&![307,308].includes(r.status()));
  await page.getByRole('dialog').getByRole('button',{name:'Save item',exact:true}).click();
  const r=await response;assert.equal(r.status(),expected,await r.text());
  const data=await r.json();
  if(expected<300)await page.getByRole('dialog').waitFor({state:'hidden'});
  return data;
 };
 const add=async({title,kind,owner='CTO',details='',dependency,trigger='Add work item'})=>{
  await page.getByRole('button',{name:trigger,exact:true}).click();
  const d=page.getByRole('dialog');
  await d.getByLabel('Title',{exact:true}).fill(title);
  if(kind)await d.getByLabel(/^Type/).selectOption(kind);
  await d.getByLabel(/^Workstream \/ accountable role/).selectOption(owner);
  await d.getByLabel('Person responsible',{exact:true}).fill('QA Owner');
  if(details)await d.locator('textarea').fill(details);
  if(dependency)await d.locator('select[multiple]').selectOption(dependency);
  return saveDialog();
 };
 const edit=async title=>page.getByRole('button',{name:title,exact:true}).first().click();
 const close=async()=>page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click();
 const checkpoint=async(name,body)=>{
   let failure;
   await t.test(name,async()=>{try{await body();}catch(error){failure=error;await page.screenshot({path:'/tmp/zuimi-coordination-e2e-failure.png',fullPage:true});throw error;}});
   if(failure)throw failure;
 };
 let prerequisite,dependent,campaign,application;
 try {
  await checkpoint('staff gate rejects anonymous and non-staff access',async()=>{
   const anon=await browser.newContext({baseURL:base});
   assert.equal((await anon.request.get('/api/admin/backend/coordination/work/')).status(),401);
   const viewer=await anon.request.post('/api/admin/session/login',{data:{email:'coordination-viewer@example.test',password:'CoordinationTest123!'}});
   assert.equal(viewer.status(),403);await anon.close();
   const login=await context.request.post('/api/admin/session/login',{data:{email:process.env.ZUIMI_E2E_ADMIN_EMAIL||'coordination-admin@example.test',password:process.env.ZUIMI_E2E_ADMIN_PASSWORD||'CoordinationTest123!'}});
   assert.equal(login.status(),200,await login.text());
   await page.goto('/eco/boarddash/55019/');await page.getByRole('button',{name:'Add work item',exact:true}).waitFor();
  });
  await checkpoint('create, edit, reload, dependencies, revision history and conflict recovery',async()=>{
   prerequisite=await add({title:`${prefix} prerequisite`});
   dependent=await add({title:`${prefix} dependent`,dependency:prerequisite.id});
   await section('Team workstreams');await edit(dependent.title);
   await page.getByRole('dialog').getByLabel(/^Status/).selectOption('done');
   await saveDialog('PATCH',400);await page.getByRole('dialog').getByRole('alert').filter({hasText:'prerequisites'}).waitFor();await close();
   await edit(prerequisite.title);await page.getByRole('dialog').getByLabel(/^Status/).selectOption('done');await saveDialog('PATCH',200);
   await edit(dependent.title);await page.getByRole('dialog').getByLabel(/^Status/).selectOption('done');dependent=await saveDialog('PATCH',200);
   await page.reload();await section('Team workstreams');await edit(dependent.title);
   await page.getByText('Revision history · 2 saved changes',{exact:true}).waitFor();
   const external=await api(`work/${dependent.id}/`,'PATCH',{revision:dependent.revision,next_action:'Updated by another admin'});assert.equal(external.status,200);
   await saveDialog('PATCH',409);await page.getByRole('dialog').getByRole('alert').filter({hasText:'Another admin'}).waitFor();await close();
   assert.equal((await api(`work/${dependent.id}/`)).data.next_action,'Updated by another admin');
  });
  await checkpoint('MVP checklist import, acceptance and persistence',async()=>{
   await section('MVP scope');await page.getByRole('button',{name:'Add suggested MVP checklist',exact:true}).click();
   await page.getByRole('checkbox').first().waitFor();
   await page.getByRole('button',{name:'Add suggested MVP checklist',exact:true}).waitFor();
   const box=page.getByRole('checkbox').first();const nextChecked=!(await box.isChecked());const accepted=page.waitForResponse(r=>r.url().includes('/coordination/work')&&r.request().method()==='PATCH'&&r.status()===200);await box.setChecked(nextChecked);await accepted;
   await page.waitForFunction(expected=>document.querySelector('input[type=checkbox]')?.checked===expected,nextChecked);
   await page.reload();await section('MVP scope');assert.equal(await page.getByRole('checkbox').first().isChecked(),nextChecked);
   const scopes=(await api('work/')).data.filter(x=>x.kind==='scope');assert.equal(scopes.length,10);
  });
  await checkpoint('weekly goals, commitments, decisions, blockers and meetings persist',async()=>{
   await section('Weekly goals');await add({title:`${prefix} goal`,trigger:'Add weekly goal'});await add({title:`${prefix} commitment`,trigger:'Add commitment'});
   await section('Decisions & notes');await add({title:`${prefix} decision`,trigger:'Add decision',details:'An explicit decision'});
   await page.getByRole('button',{name:'Blockers',exact:true}).click();await add({title:`${prefix} blocker`,trigger:'Add blocker'});
   await page.getByRole('button',{name:'Meetings',exact:true}).click();await add({title:`${prefix} meeting`,trigger:'Add meeting',details:'Attendees, decisions and follow-up'});
   const work=(await api('work/')).data;for(const kind of ['goal','commitment','decision','blocker','meeting'])assert.ok(work.some(i=>i.kind===kind&&i.title.startsWith(prefix)));
  });
  await checkpoint('CEO idea-to-post, scheduling, publication evidence and reusable templates',async()=>{
   await section('CEO · X studio');await page.getByRole('button',{name:'Ideas',exact:true}).click();
   await add({title:`${prefix} idea`,trigger:'Add idea',details:'A draft post for the team'});
   await page.getByRole('button',{name:'Draft post',exact:true}).last().click();await saveDialog();
   await page.getByRole('button',{name:'Posts',exact:true}).click();await edit(`${prefix} idea`);
   const d=page.getByRole('dialog');await d.getByLabel(/^Status/).selectOption('scheduled');await d.getByLabel(/Planned publishing date/).fill('2026-11-17');await saveDialog('PATCH',200);
   await edit(`${prefix} idea`);await page.getByRole('dialog').getByLabel(/^Status/).selectOption('published');await saveDialog('PATCH',400);
   await page.getByRole('dialog').getByLabel(/Published on/).fill('2026-11-17T10:00');await page.getByRole('dialog').getByLabel('Live X / Twitter post URL',{exact:true}).fill('https://x.com/zuimi_qa/status/123');await saveDialog('PATCH',200);
   await page.getByRole('button',{name:'Templates',exact:true}).click();await add({title:`${prefix} template`,trigger:'Create reusable template',details:'Reusable draft copy'});
   await page.getByRole('button',{name:'Use for a post',exact:true}).last().click();await saveDialog();
   const work=(await api('work/')).data;assert.ok(work.some(i=>i.kind==='post'&&i.status==='published'&&i.title===`${prefix} idea`));assert.ok(work.some(i=>i.kind==='post'&&i.details==='Reusable draft copy'));
  });
  await checkpoint('campaign creation, copy, disable and reactivation',async()=>{
   await section('Campaign links');await page.getByLabel('Campaign / placement name',{exact:true}).fill(`${prefix} X campaign`);
   const created=page.waitForResponse(r=>r.url().includes('/coordination/campaigns')&&r.request().method()==='POST'&&![307,308].includes(r.status()));await page.getByRole('button',{name:'Generate explicit link',exact:true}).click();const r=await created;assert.equal(r.status(),201);campaign=await r.json();
   assert.equal(await page.getByLabel('New campaign link',{exact:true}).inputValue(),`${base}/go/${campaign.code}/`);
   const row=page.getByRole('row').filter({hasText:campaign.name});await row.getByRole('button',{name:'Copy link',exact:true}).click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),`${base}/go/${campaign.code}/`);
   await row.getByRole('button',{name:'Disable link',exact:true}).click();await row.getByRole('button',{name:'Reactivate',exact:true}).waitFor();await row.getByRole('button',{name:'Reactivate',exact:true}).click();await row.getByRole('button',{name:'Disable link',exact:true}).waitFor();
  });
  await checkpoint('public tracked creator application feeds board review and analytics',async()=>{
   const visitor=await browser.newContext({baseURL:base});const publicPage=await visitor.newPage();
   await publicPage.goto(`/go/${campaign.code}/`);assert.equal(new URL(publicPage.url()).origin,base);
   for(const [name,value] of Object.entries({name:'QA Filmmaker',email:`qa-${Date.now()}@example.test`,country:'Nigeria',role:'Director',film_title:`${prefix} film`,genre:'Drama',synopsis:'A fictional QA film.'}))await publicPage.locator(`[name="${name}"]`).fill(value);
   await publicPage.locator('[name="film_stage"]').selectOption('Completed');await publicPage.locator('[name="rights_confirmed"]').check();await publicPage.locator('[name="consent"]').check();
   const submitted=publicPage.waitForResponse(r=>r.url().includes('/api/creators/apply')&&r.request().method()==='POST'&&![307,308].includes(r.status()));await publicPage.locator('form button[type=submit],form button:not([type])').last().click();const response=await submitted;assert.equal(response.status(),201,await response.text());
   const payload=response.request().postDataJSON();
   const retry=await visitor.request.post('/api/creators/apply',{headers:{Origin:base},data:payload});assert.equal(retry.status(),201);
   await publicPage.getByText('Your story is in the pipeline.',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Refresh workspace',exact:true}).click();await section('Creator pipeline');const review=page.locator('details.zb-review').filter({hasText:`${prefix} film`});await review.locator('summary').click();
   await review.getByLabel(/^Review status/).selectOption('reviewing');await review.getByLabel('Internal review / next follow-up',{exact:true}).fill('Check distribution rights');const savedReview=page.waitForResponse(r=>r.url().includes('/review')&&r.request().method()==='PATCH'&&r.status()===200);await review.getByRole('button',{name:'Save review',exact:true}).click();await savedReview;
   application=(await api('applications/')).data.find(a=>a.film_title===`${prefix} film`);assert.equal(application.status,'reviewing');assert.equal(application.review_notes,'Check distribution rights');assert.equal(application.latest_source.code,campaign.code);
   const stale=await api(`applications/${application.id}/review/`,'PATCH',{status:'approved',updated_at:'2000-01-01T00:00:00Z'});assert.equal(stale.status,409);
   const analytics=(await api('campaigns/analytics/')).data.rows.find(c=>c.code===campaign.code);assert.equal(analytics.applications,1);assert.equal(analytics.unique_visitors,1);assert.equal(analytics.conversion_rate,100);
   const previewClicks=analytics.clicks;
   await visitor.request.head(`/go/${campaign.code}/`);
   await visitor.request.get(`/go/${campaign.code}/`,{headers:{'User-Agent':'Twitterbot/1.0'}});
   assert.equal((await api('campaigns/analytics/')).data.rows.find(c=>c.code===campaign.code).clicks,previewClicks);
   const second=await api('campaigns/','POST',{name:`${prefix} WhatsApp`,source:'whatsapp',medium:'messaging'});assert.equal(second.status,201);
   await publicPage.goto(`/go/${second.data.code}/`);await publicPage.goto('/creators/apply/');
   const another=await visitor.request.post('/api/creators/apply',{headers:{Origin:base},data:{...payload,film_title:`${prefix} second film`}});assert.equal(another.status(),201);
   const attributed=(await api('applications/')).data.find(a=>a.film_title===`${prefix} second film`);
   assert.equal(attributed.first_source.code,campaign.code);assert.equal(attributed.latest_source.code,second.data.code);
   await page.goto('/admin/creator-applications/');await page.getByText(`${prefix} film`,{exact:false}).first().waitFor();await visitor.close();
  });
  await checkpoint('expired access refreshes without losing staff access and foreign origins are rejected',async()=>{
   await context.addCookies([{name:'zuimi_admin_access',value:'expired',url:base}]);
   const refreshed=await api('work/');assert.equal(refreshed.status,200);
   const foreign=await context.request.post('/api/admin/backend/coordination/work/',{headers:{Origin:'https://evil.example'},data:{title:'Must not save'}});assert.equal(foreign.status(),403);
   const crossSiteApplication=await context.request.post('/api/creators/apply',{headers:{Origin:'https://evil.example'},data:{}});assert.equal(crossSiteApplication.status(),403);
   assert.deepEqual(errors,[]);
  });
  fs.writeFileSync('/tmp/zuimi-coordination-browser-results.json',JSON.stringify({prefix,errors,responses},null,2));
 } finally {
  await page.screenshot({path:'/tmp/zuimi-coordination-e2e.png',fullPage:true}).catch(()=>{});
  await context.close();await browser.close();
 }
});
