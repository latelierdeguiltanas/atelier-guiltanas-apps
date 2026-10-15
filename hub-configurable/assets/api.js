// Public publishable key only. Access is enforced by PostgreSQL RLS.
const URL='https://jitatmdbipjkvjstcgdc.supabase.co';
const KEY='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
const SESSION='guiltanas.hub-configurable.session.v1';
export class HubAPI {
 constructor(){this.session=this.read();this.refreshing=null;}
 read(){try{return JSON.parse(localStorage.getItem(SESSION)||'null');}catch{return null;}}
 save(s){if(s?.access_token){s.expires_at=s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600);this.session=s;localStorage.setItem(SESSION,JSON.stringify(s));}else{this.session=null;localStorage.removeItem(SESSION);}}
 async raw(path,{method='GET',body,token,headers={}}={}){
  const res=await fetch(URL+path,{method,headers:{apikey:KEY,...(token?{Authorization:`Bearer ${token}`} : {}),...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(25000)});
  const text=await res.text();let data;try{data=text?JSON.parse(text):null;}catch{throw Error('Réponse inattendue du serveur. Réessayez dans quelques instants.');}
  if(!res.ok){const error=new Error(data?.msg||data?.message||data?.error_description||data?.error||`Erreur serveur ${res.status}`);error.status=res.status;throw error;}return data;
 }
 async token(){
  this.session=this.read();if(!this.session)throw Error('Connectez-vous pour ouvrir votre campagne.');
  if(this.session.expires_at>Date.now()/1000+60)return this.session.access_token;
  if(!this.refreshing){const refresh=async()=>{this.session=this.read();if(this.session?.expires_at>Date.now()/1000+60)return this.session.access_token;try{const s=await this.raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:this.session?.refresh_token}});this.save(s);return s.access_token;}catch(e){if(e.status===400||e.status===401)this.save(null);throw e;}};
   this.refreshing=(navigator.locks?navigator.locks.request('hcfg-session-refresh',refresh):refresh()).finally(()=>this.refreshing=null);
  }return this.refreshing;
 }
 async rest(path,options={}){return this.raw('/rest/v1/'+path,{...options,token:await this.token()});}
 async rpc(name,body){return this.rest('rpc/hcfg_'+name,{method:'POST',body});}
 async login(email,password){const s=await this.raw('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});this.save(s);return s;}
 async signup(email,password){const s=await this.raw('/auth/v1/signup',{method:'POST',body:{email,password}});if(s.access_token)this.save(s);return s;}
 async verifyLink(link){const u=new globalThis.URL(link);if(u.origin!==URL||u.pathname!='/auth/v1/verify')throw Error('Collez le lien de confirmation Supabase reçu par e-mail.');const type=u.searchParams.get('type');if(!['signup','recovery','email','magiclink'].includes(type))throw Error('Type de lien non pris en charge.');const token_hash=u.searchParams.get('token_hash')||u.searchParams.get('token');if(!token_hash)throw Error('Lien incomplet.');const s=await this.raw('/auth/v1/verify',{method:'POST',body:{token_hash,type}});this.save(s);return type;}
 async recover(email){return this.raw('/auth/v1/recover',{method:'POST',body:{email}});}
 async password(password){return this.raw('/auth/v1/user',{method:'PUT',token:await this.token(),body:{password}});}
 async logout(){try{await this.raw('/auth/v1/logout',{method:'POST',token:await this.token()});}finally{this.save(null);}}
 async user(){const u=await this.raw('/auth/v1/user',{token:await this.token()});this.session.user=u;return u;}
 campaigns(){return this.rest('hcfg_campaigns?select=*&order=created_at.desc&limit=100');}
 async records(cid){const all=[];for(let offset=0;offset<10000;offset+=1000){const rows=await this.rest(`hcfg_records?campaign_id=eq.${encodeURIComponent(cid)}&select=*&order=created_at.asc,id.asc&limit=1000&offset=${offset}`);all.push(...rows);if(rows.length<1000)return all;}throw Error('Campagne très volumineuse : contactez Math pour augmenter la capacité de cette bêta. Aucun export incomplet ne sera produit.');}
 members(cid){return this.rest(`hcfg_members?campaign_id=eq.${encodeURIComponent(cid)}&select=*&order=joined_at.asc&limit=200`);}
 create(record){return this.rest('hcfg_records',{method:'POST',body:record,headers:{Prefer:'return=representation'}});}
 async updateRecord(record,changes){const rows=await this.rest(`hcfg_records?id=eq.${record.id}&revision=eq.${record.revision}`,{method:'PATCH',body:changes,headers:{Prefer:'return=representation'}});if(!rows.length)throw Error('Cette fiche a changé ou votre accès a été retiré. Fermez le formulaire puis actualisez avant de recommencer.');return rows[0];}
 async updateCampaign(c,changes){const rows=await this.rest(`hcfg_campaigns?id=eq.${c.id}&revision=eq.${c.revision}`,{method:'PATCH',body:changes,headers:{Prefer:'return=representation'}});if(!rows.length)throw Error('La campagne a changé. Actualisez avant de recommencer.');return rows[0];}
 async remove(record){const rows=await this.rest(`hcfg_records?id=eq.${record.id}&revision=eq.${record.revision}`,{method:'DELETE',headers:{Prefer:'return=representation'}});if(!rows.length)throw Error('Suppression impossible : actualisez la campagne.');}
 async removeMember(cid,uid){await this.rest(`hcfg_members?campaign_id=eq.${cid}&user_id=eq.${uid}`,{method:'DELETE'});}
}
