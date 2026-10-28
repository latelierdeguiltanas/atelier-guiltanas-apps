import {storage,lock} from './storage.js';
const URL='https://jitatmdbipjkvjstcgdc.supabase.co/rest/v1/rpc/hcfg_link_api';
const KEY='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
export function secret(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');}
export function accessLink(space,token){return location.origin+location.pathname+'#space='+space+'&key='+token;}

/* Code portable: 16 octets UUID + 32 octets du jeton MJ. Même secret que le lien MJ, mais sans URL. */
export function recoveryCode(workspace){
  if(workspace?.role!=='mj'||!/^[a-f0-9-]{36}$/i.test(workspace.id||'')||!/^[a-f0-9]{64}$/.test(workspace.token||''))throw Error('Accès MJ requis');
  const hex=workspace.id.replace(/-/g,'').toLowerCase()+workspace.token.toLowerCase();
  const bytes=new Uint8Array(hex.match(/../g).map(v=>parseInt(v,16)));
  let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  return 'G2-'+btoa(binary).split('+').join('-').split('/').join('_').replace(/=+$/,'');
}
export function parseRecoveryCode(value){
  const compact=String(value||'').trim().split(' ').join('');
  if(!/^G2-[A-Za-z0-9_-]{64}$/.test(compact))throw Error('Code de récupération invalide.');
  let bytes;try{const raw=atob(compact.slice(3).replace(/-/g,'+').replace(/_/g,'/'));bytes=Uint8Array.from(raw,c=>c.charCodeAt(0))}catch{throw Error('Code de récupération illisible.')}
  if(bytes.length!==48)throw Error('Code de récupération incomplet.');
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  const u=hex.slice(0,32),id=u.slice(0,8)+'-'+u.slice(8,12)+'-'+u.slice(12,16)+'-'+u.slice(16,20)+'-'+u.slice(20),token=hex.slice(32);
  return{id,token};
}

export function parseLink(text){let hash;try{hash=new globalThis.URL(text,location.href).hash.slice(1);}catch{throw Error('Lien incomplet.');}const p=new URLSearchParams(hash),id=p.get('space'),token=p.get('key');if(!/^[a-f0-9-]{36}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(token||''))throw Error('Ce lien d’accès est incomplet.');return {id,token};}
export class HubAPI{
 constructor(store=storage){this.store=store;}
 async call(w,action,data={}){const r=await fetch(URL,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_action:action,p_space:w.id,p_token:w.token,p_data:data}),signal:AbortSignal.timeout(25000)});const d=await r.json();if(!r.ok)throw Error(d.message||'Le serveur ne répond pas correctement.');return d;}
 async create(name,format){const id=crypto.randomUUID(),token=secret();const w={id,token,role:'mj',character_id:null,remote:false,seed:{name,format},queue:[],state:{campaign:{id,name,format,description:'',settings:{},revision:1,owner_id:'mj'},records:[]}};await this.persist(w);return w;}
 async openLink(text){const {id,token}=parseLink(text);let w=await this.store.get(id+'-'+token.slice(0,12));if(w)return this.normal(w);w={id,token,role:null,remote:true,queue:[]};const d=await this.call(w,'get');Object.assign(w,d);await this.persist(w);return w;}
 // The local database key includes the link identity: PJ and MJ caches never mix.
 key(w){return w.id+'-'+w.token.slice(0,12);}
 async persist(w){const value={...w,space_id:w.id,id:this.key(w)};await this.store.put(value);}
 normal(w){if(w.space_id)return {...w,id:w.space_id};return w;}
 async all(){return (await this.store.all()).map(w=>this.normal(w)).filter((w,i,a)=>a.findIndex(v=>this.key(v)===this.key(w))===i);}
 async load(w){return this.normal(await this.store.get(this.key(w))||w);}
 async save(w,action,data){return lock(this.key(w),async()=>{w=await this.load(w);const op={action,data:{...data,op_id:crypto.randomUUID()}};
  if(action==='save'){const old=w.state.records.find(r=>r.id===data.record.id);if((old?.revision||0)!==data.expected)throw Error('Cette fiche a changé sur cet appareil. Rouvrez-la avant de modifier.');const record={...data.record,revision:data.expected+1,created_at:old?.created_at||new Date().toISOString(),updated_at:new Date().toISOString()};w.state.records=w.state.records.filter(r=>r.id!==record.id).concat(record);}
  else if(action==='delete')w.state.records=w.state.records.filter(r=>r.id!==data.id);
  else if(action==='settings'){if(w.state.campaign.revision!==data.expected)throw Error('Réglages modifiés dans un autre onglet. Actualisez.');w.state.campaign={...data.campaign,revision:data.expected+1};}
  w.queue.push(op);await this.persist(w);return w;
 });}
 async sync(input){return lock(this.key(input),async()=>{let w=await this.load(input);if(!w.remote){await this.call(w,'create',w.seed);w.remote=true;await this.persist(w);}
  while(w.queue.length){const op=w.queue[0];await this.call(w,op.action,op.data);w.queue.shift();await this.persist(w);}
  const d=await this.call(w,'get');Object.assign(w,d);w.syncedAt=new Date().toISOString();await this.persist(w);return w;
 });}
 async playerLink(input,character_id){let w=await this.sync(input);const token=secret();await this.call(w,'link',{character_id,token,op_id:crypto.randomUUID()});w.links={...w.links,[character_id]:token};await this.persist(w);return {workspace:w,link:accessLink(w.id,token)};}
 async revoke(w,character_id){await this.call(w,'revoke',{character_id,op_id:crypto.randomUUID()});w=await this.load(w);if(w.links)delete w.links[character_id];await this.persist(w);return w;}
 async serverVersion(input){return lock(this.key(input),async()=>{let w=await this.load(input);const d=await this.call(w,'get');Object.assign(w,d,{queue:[]});await this.persist(w);return w;});}
}
