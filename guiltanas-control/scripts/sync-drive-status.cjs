#!/usr/bin/env node
/*
 * Guiltanas Control: Drive -> GitHub Pages public projection.
 * Auth: Google service account with read-only access to individual Drive documents.
 * Deploy only content explicitly between GC_PUBLIC_STATE_BEGIN/END markers.
 * No npm dependencies. Run from GitHub Actions.
 */
'use strict';
const fs=require('node:fs'), crypto=require('node:crypto');
const file='guiltanas-control/data/projects.json';
const saText=process.env.GC_DRIVE_SA_JSON;
const idsText=process.env.GC_DRIVE_DOC_IDS;
if(!saText||!idsText){console.log('Guiltanas Control: Google Drive credentials not configured; sync skipped.');process.exit(0)}
const sa=JSON.parse(saText), ids=JSON.parse(idsText);
if(!sa.private_key||!sa.client_email||!ids||typeof ids!=='object')throw new Error('Drive service account or document map incomplete');
const b64=x=>Buffer.from(typeof x==='string'?x:JSON.stringify(x)).toString('base64url');
async function token(){
 const now=Math.floor(Date.now()/1000), header={alg:'RS256',typ:'JWT'};
 const claims={iss:sa.client_email,scope:'https://www.googleapis.com/auth/documents.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3000};
 const unsigned=b64(header)+'.'+b64(claims), sign=crypto.createSign('RSA-SHA256');
 sign.update(unsigned);sign.end();
 const assertion=unsigned+'.'+sign.sign(sa.private_key).toString('base64url');
 const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion});
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
 const payload=await response.json();if(!response.ok||!payload.access_token)throw Error('Google authentication failed: '+response.status);
 return payload.access_token;
}
function bodyText(content){
 let out='';
 for(const e of content||[]){
   if(e.paragraph)for(const el of e.paragraph.elements||[])out+=el.textRun?.content||'';
   if(e.table)for(const row of e.table.tableRows||[])for(const cell of row.tableCells||[])out+=bodyText(cell.content);
 }
 return out;
}
function tabsText(tabs){
 let out='';
 for(const tab of tabs||[]){
  out+=bodyText(tab.documentTab?.body?.content);
  out+=tabsText(tab.childTabs);
 }
 return out;
}
function cut(x,max=1100){return String(x==null?'':x).slice(0,max)}
function onlyHttpsGithub(u){try{const x=new URL(u);return x.protocol==='https:'&&x.hostname==='github.com'?x.href:null}catch{return null}}
function safePublic(p,id){
 if(p.id!==id)throw Error('Project id mismatch: '+id);
 // Field-level allowlist. Only explicitly public fields are exported.
 return {
   id:cut(p.id,80),name:cut(p.name,140),family:cut(p.family,100),priority:cut(p.priority,30),
   status:cut(p.status,70),status_label:cut(p.status_label,140),
   summary:cut(p.summary,800),last_update:p.last_update?cut(p.last_update,15):null,
   progress_percent:typeof p.progress_percent==='number'&&Number.isFinite(p.progress_percent)&&p.progress_percent>=0&&p.progress_percent<=100?p.progress_percent:null,
   progress_basis:cut(p.progress_basis,800),
   current_work:p.current_work?{id:cut(p.current_work.id,90),state:cut(p.current_work.state,40),opened_date:cut(p.current_work.opened_date,15),objective:cut(p.current_work.objective,350)}:null,
   phases:Array.isArray(p.phases)?p.phases.slice(0,40).map(x=>({id:cut(x.id,80),name:cut(x.name,200),status:cut(x.status,60),detail:cut(x.detail,800),progress_percent:typeof x.progress_percent==='number'&&Number.isFinite(x.progress_percent)&&x.progress_percent>=0&&x.progress_percent<=100?x.progress_percent:null})):[],
   tests:p.tests?{manual_pack_total:Number.isInteger(p.tests.manual_pack_total)?p.tests.manual_pack_total:null,manual_pack_verified:Number.isInteger(p.tests.manual_pack_verified)?p.tests.manual_pack_verified:null,status:cut(p.tests.status,80),link:onlyHttpsGithub(p.tests.link)}:null,
   timeline:Array.isArray(p.timeline)?p.timeline.slice(-100).map(x=>({date:cut(x.date,15),kind:cut(x.kind,40),title:cut(x.title,200),detail:cut(x.detail,1000)})):[],
   next_action:cut(p.next_action,800),
   links:{repository:onlyHttpsGithub(p.links?.repository),chatgpt:null}
 };
}
async function main(){
 const auth=await token();
 const original=JSON.parse(fs.readFileSync(file,'utf8'));
 const indexed=new Map(original.projects.map(p=>[p.id,p]));
 for(const [id,docId] of Object.entries(ids)){
   if(!indexed.has(id))throw Error('Unknown project '+id);
   if(!/^[A-Za-z0-9_-]+$/.test(docId))throw Error('Invalid doc ID for '+id);
   const response=await fetch('https://docs.googleapis.com/v1/documents/'+encodeURIComponent(docId)+'?includeTabsContent=true',{headers:{Authorization:'Bearer '+auth}});
   if(!response.ok)throw Error('Cannot read Drive state for '+id+': '+response.status);
   const doc=await response.json();
   const all=tabsText(doc.tabs)||bodyText(doc.body?.content);
   const matches=[...all.matchAll(/GC_PUBLIC_STATE_BEGIN\s*([\s\S]*?)\s*GC_PUBLIC_STATE_END/g)];
   if(!matches.length)throw Error('No public state marker for '+id);
   const block=JSON.parse(matches[matches.length-1][1]);
   indexed.set(id,safePublic(block,id));
   console.log('Read public project state: '+id);
 }
 const next={...original,projects:original.projects.map(p=>indexed.get(p.id))};
 const changes=JSON.stringify(next.projects)!==JSON.stringify(original.projects);
 if(!changes){console.log('No state changes; repository unchanged.');return}
 next.last_published_date=new Date().toISOString().slice(0,10);
 next.last_published_reason='Drive automated projection';
 next.sync_contract='drive_state_published_by_github_actions';
 fs.writeFileSync(file,JSON.stringify(next,null,2)+'\n');
 console.log('Public project state updated (commit handled by GitHub Actions).');
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
