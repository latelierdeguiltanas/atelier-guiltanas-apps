/* Table MJ Nespresso — packs officialisés, cadeaux, stock ; aucun envoi sans confirmation.
   Réutilise l'API nespresso-inventory et ses requestId idempotents. */
(()=>{
'use strict';
const A=window.NespressoEconomy,C=window.IATRewardCore,PACKS=window.IAT_SCENARIO_PACKS;
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const LEDGER='iat_nespresso_scenario_ledger_v1',QUEUE='iat_nespresso_scenario_queue_v1';
const pnames={vax:"Vax’Ildan",hammerz:'Hammerz',lelio:'Lelio',loris:'Prométhée'};
let state=null,current=PACKS[0]?.id,busy=false,currentItem=null,seenEvents=[];
const json=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback;}};
let ledger=json(LEDGER,{});
const putLedger=()=>localStorage.setItem(LEDGER,JSON.stringify(ledger));
function message(text,kind=''){const e=$('message');e.textContent=text;e.className='notice '+kind;}
const money=(pc)=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format((Number(pc)||0)/100)+' PO';
const sumUsed=(pack,row)=>Object.entries(ledger).filter(([k])=>k.startsWith(pack.id+':'+row.id+':')).reduce((s,[k,v])=>s+Math.max(0,Number(v?.qty??v)||0),0);
function openTab(name){for(const s of ['packs','shop','history'])$('view-'+s).hidden=s!==name;
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===name)));
 if(name==='history')drawHistory();if(name==='shop')drawShop();
}
function getPack(){return PACKS.find(p=>p.id===current)||PACKS[0];}
function drawPackList(){
 const q=($('pack-search').value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 $('pack-list').innerHTML=PACKS.filter(p=>(p.title+' '+p.scene+' '+p.chapter).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)).map(p=>{
   const total=p.items.length,used=p.items.filter(r=>sumUsed(p,r)>=r.qty).length;
   return '<button class="pack '+(current===p.id?'active':'')+'" data-pack="'+esc(p.id)+'"><span class="state">'+esc(p.chapter)+' · '+(p.status==='officiel'?'Officiel':'Scène MJ')+'</span><b>'+esc(p.title)+'</b><small>'+esc(p.scene)+'</small><small>'+used+'/'+total+' lignes totalement remises</small></button>';
 }).join('')||'<p>Aucun pack correspondant.</p>';
}
function drawPack(){
 const p=getPack();if(!p)return;
 $('pack-title').textContent=p.title;$('pack-chapter').textContent=p.chapter;
 $('pack-scene').textContent=p.scene+' · '+p.source;$('pack-note').textContent=p.note;
 $('pack-count').textContent=p.items.length+' types de remise';
 const options='<option value="">— Choisir un PJ —</option>'+C.IDS.map(id=>'<option value="'+id+'">'+esc(pnames[id])+'</option>').join('');
 $('pack-lines').innerHTML=p.items.map((r,i)=>{
   const used=sumUsed(p,r),remain=Math.max(0,r.qty-used),spent=Object.entries(ledger).filter(([k])=>k.startsWith(p.id+':'+r.id+':')).map(([k,v])=>pnames[v.to]||v.to||k.split(':')[2]);
   const disabled=remain===0?'disabled':'',checked=i<3||p.id!=='runara-cadeaux'?'checked':'';
   const val=r.valuePO?' · valeur '+r.valuePO+' PO / unité':'';
   return '<div class="reward"><div><label><input type="checkbox" data-include="'+esc(r.id)+'" '+checked+' '+disabled+'> <b style="display:inline">'+esc(r.name)+'</b></label><small>'+esc(r.notes||'')+val+'</small>'+
      (used?'<div class="done">✓ '+used+'/'+r.qty+' déjà remis · '+esc(spent.join(', '))+'</div>':'')+'</div>'+
      '<div><label>Destinataire<select data-recipient="'+esc(r.id)+'" '+disabled+'>'+options+'</select></label></div>'+
      '<div><label>'+(r.type==='money'?'PO':'Quantité')+'<input type="number" min="1" max="'+remain+'" value="'+(remain||0)+'" data-qty="'+esc(r.id)+'" '+disabled+'></label></div></div>';
 }).join('');
 $('pack-progress').textContent=json(QUEUE,null)?'Envoi interrompu à reprendre avant tout nouvel envoi.':'';
 $('send-pack').disabled=busy||!!json(QUEUE,null);
 $('retry-pack').disabled=busy||!json(QUEUE,null);
 drawPackList();
}
function collect(){
 const p=getPack(),assignments=[],blank=[];
 for(const row of p.items){
   const on=document.querySelector('[data-include="'+row.id+'"]');
   if(!on?.checked||on.disabled)continue;
   const playerId=document.querySelector('[data-recipient="'+row.id+'"]')?.value;
   if(!playerId){blank.push(row.name);continue;}
   assignments.push({lineId:row.id,playerId,qty:Number(document.querySelector('[data-qty="'+row.id+'"]')?.value)});
 }
 if(blank.length)throw new Error('Choisis un destinataire ou décoche : '+blank.join(' · '));
 if(!assignments.length)throw new Error('Aucune récompense attribuée : choisis au moins un objet et un PJ.');
 if(p.id==='runara-cadeaux'){
   const ids=assignments.map(a=>a.playerId);
   if(new Set(ids).size!==ids.length)throw new Error('Runara offre une potion par PJ : un destinataire apparaît deux fois.');
 }
 return assignments;
}
async function sendPack(){
 if(busy||json(QUEUE,null))return;
 let p=getPack(),assignments,dispatch;
 try{assignments=collect();dispatch=C.buildDraft(p,assignments,ledger)}
 catch(e){return message(e.message,'error');}
 const list=dispatch.map(d=>pnames[d.playerId]+' : '+d.labels.join(', ')).join('\n');
 const pending=dispatch.filter(d=>state?.players?.find(p=>p.id===d.playerId)?.initialized===false).map(d=>pnames[d.playerId]);
 const warn=(state?.events||[]).some(e=>e.action==='send')?'\nATTENTION : des envois MJ antérieurs existent déjà. Vérifie que ce n’est pas une remise en double.\n':'';
 const risk=pending.length?'\nSacs non initialisés : '+pending.join(', ')+'. La remise sera enregistrée côté serveur mais restera à récupérer.':'';
 if(!confirm('Distribuer « '+p.title+' » ?\n\n'+list+warn+risk+'\n\nValider envoi réel ?'))return;
 const lines=dispatch.map(d=>({playerId:d.playerId,body:d.body,requestId:crypto.randomUUID(),rows:d.keys.map(key=>{
   const a=assignments.find(v=>key===p.id+':'+v.lineId+':'+v.playerId);return{key,qty:a.qty};
 })}));
 localStorage.setItem(QUEUE,JSON.stringify({packId:p.id,createdAt:new Date().toISOString(),lines,done:[]}));
 await runQueue();
}
async function runQueue(){
 if(busy)return;const q=json(QUEUE,null);if(!q)return message('Aucun envoi en attente.');
 busy=true;$('send-pack').disabled=true;$('retry-pack').disabled=true;
 try{
   while(q.lines.length){
     const x=q.lines[0];
     await A.call('send',{body:x.body,requestId:x.requestId});
     const now=new Date().toISOString();
     for(const row of x.rows)ledger[row.key]={qty:row.qty,to:x.playerId,at:now,packId:q.packId};
     putLedger();
     q.done.push({playerId:x.playerId,rows:x.rows,at:now});
     q.lines.shift();
     localStorage.setItem(QUEUE,JSON.stringify(q));
     message('Envoi confirmé : '+pnames[x.playerId]+' · '+q.done.length+' destinataire(s) traité(s).','ok');
   }
   localStorage.removeItem(QUEUE);
   message('✓ Distribution enregistrée pour '+q.done.length+' destinataire(s). Les joueurs non synchronisés récupéreront le lot après connexion de leur sac.','ok');
   await refresh(false);
 }catch(e){
   message('Envoi interrompu : '+e.message+'. Ne recommence pas le pack : utilise « Reprendre un envoi interrompu » avec les mêmes identifiants.','error');
 }finally{busy=false;drawPack();drawHistory();}
}
function drawHistory(){
 const rows=Object.entries(ledger).sort((a,b)=>String(b[1]?.at).localeCompare(String(a[1]?.at)));
 const pending=json(QUEUE,null);
 let out=pending?'<p class="warntext">⚠ Envoi en attente pour '+pending.lines.length+' PJ. Reprendre depuis « Packs » pour éviter les doublons.</p>':'';
 if(!rows.length)out+='<p>Aucune distribution de pack confirmée sur ce navigateur.</p>';
 else out+='<div class="stock-list">'+rows.map(([key,v])=>{
   const pack=PACKS.find(p=>p.id===v.packId)||{},row=pack.items?.find(r=>key===pack.id+':'+r.id+':'+v.to);
   const p=state?.players?.find(x=>x.id===v.to);
   return '<div class="stock-item"><div><b>'+esc(row?.name||key)+'</b><small>'+esc(pack.title||v.packId)+' · '+esc(pnames[v.to])+' · '+esc(v.at?new Date(v.at).toLocaleString('fr-FR'):'')+'</small></div><span class="'+(p?.initialized?'done':'warntext')+'">'+(p?.initialized?'Sac serveur actif':'En attente de synchronisation')+'</span><b>× '+Number(v.qty||1)+'</b></div>';
 }).join('')+'</div>';
 const activity=(state?.events||[]).filter(e=>e.action==='send').slice(0,12);
 out+='<h3>Dernières opérations MJ côté serveur</h3>'+(activity.length?activity.map(e=>'<p><small>'+esc(new Date(e.created_at).toLocaleString('fr-FR'))+' · '+esc(pnames[e.player_id]||e.player_id)+' · '+esc(e.summary)+'</small></p>').join(''):'<p class="muted">Aucune opération remontée par le serveur.</p>');
 $('history-content').innerHTML=out;
}
function chooseProduct(id){
 currentItem=state?.items.find(x=>x.id===id)||null;
 const f=$('product-form');f.reset();
 f.elements.id.value=currentItem?.id||'';f.elements.name.value=currentItem?.name||'';
 f.elements.category.value=currentItem?.category||'Équipement';f.elements.price_po.value=((currentItem?.price_copper||0)/100).toFixed(2);
 f.elements.stock.value=currentItem?.stock??'';
 f.elements.active.value=currentItem?.active===false?'0':'1';f.elements.description.value=currentItem?.description||'';
 $('product-status').textContent=currentItem?'Article existant — modification sans changer son identifiant.':'Nouveau produit (rien n’est enregistré avant confirmation).';
}
function drawShop(){
 if(!state)return;
 const products=state.items||[],q=($('shop-search').value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const shown=products.filter(p=>(p.name+' '+p.category+' '+p.description).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'fr'));
 $('shop-totals').innerHTML='<div class="total"><b>'+products.length+'</b> articles</div><div class="total"><b>'+products.filter(p=>p.stock===null).length+'</b> en stock illimité</div><div class="total"><b>'+products.filter(p=>p.stock!==null).length+'</b> stocks limités</div>';
 $('stock-list').innerHTML=shown.map(item=>{
   const lines=(item.description||'').split('\n'),effect=lines.find(x=>/\bd\d+\b|CA |avantage|soign/i.test(x))||lines[0]||'';
   return '<div class="stock-item"><div><b>'+esc(item.name)+'</b><small>'+esc(item.category)+' · '+esc(effect.slice(0,140))+'</small></div><div class="stockcol"><b>'+money(item.price_copper)+'</b><small>'+ (item.stock===null?'Stock : ∞ (illimité)':item.stock===0?'Rupture de stock':'Stock : '+item.stock) +'</small></div><button class="btn" data-edit="'+esc(item.id)+'">Modifier</button></div>';
 }).join('')||'<p>Aucun article correspondant.</p>';
}
async function saveProduct(e){
 e.preventDefault();if(busy)return;
 const f=e.currentTarget,v=f.elements;
 const name=v.name.value.trim(),stock=v.stock.value===''?null:Number(v.stock.value);
 const price=Math.round(Number(v.price_po.value)*100);
 if(!name||!Number.isSafeInteger(price)||price<0||!(stock===null||(Number.isSafeInteger(stock)&&stock>=0)))
   return message('Nom, prix ou stock invalide.','error');
 const payload={id:v.id.value||'',name,category:v.category.value.trim()||'Équipement',description:v.description.value,price_copper:price,stock,active:v.active.value==='1'};
 if(!confirm((payload.id?'Modifier':'Créer')+' « '+name+' » au prix de '+money(price)+' avec stock '+(stock===null?'illimité':stock)+' ?'))return;
 busy=true;
 try{
   await A.mutate('shop-save',payload,'mj-shop');
   message('Article enregistré dans la boutique de Mila : '+name+'.','ok');
   await refresh(false);
   chooseProduct(state?.items?.find(x=>x.name===name)?.id||'');
 }catch(ex){message('Stock non enregistré : '+ex.message+'. Réessaie l’opération en attente depuis la table économique.','error')}
 finally{busy=false;}
}
async function refresh(showMessage=true){
 if(busy&&showMessage)return;
 try{
  const response=await A.call('admin');
  if(!response?.players||!Array.isArray(response.items))throw new Error('Données MJ incomplètes.');
  state=response;$('gate').hidden=true;
  drawPackList();drawPack();drawShop();drawHistory();
  if(showMessage)message('Connexion MJ active · '+response.players.length+' joueurs · '+response.items.length+' articles.','ok');
 }catch(e){state=null;$('gate').hidden=false;message('Accès MJ nécessaire : '+e.message,'error');}
}
$('connect').addEventListener('submit',async e=>{
 e.preventDefault();
 let raw=$('access').value.trim();
 try{const u=new URL(raw);raw=new URLSearchParams(u.hash.replace(/^#/,'')).get('key')||'';}catch{}
 if(raw.length<32)return $('gate-error').textContent='Colle le lien MJ complet ou une clé valide.';
 const prior=localStorage.getItem('iat_mj_handout_token');
 localStorage.setItem('iat_mj_handout_token',raw);
 try{
   await refresh(false);
   if(!state)throw new Error('Accès non confirmé.');
   $('gate-error').textContent='';$('access').value='';
   message('Accès MJ confirmé.','ok');
 }catch(e){
   if(prior===null)localStorage.removeItem('iat_mj_handout_token');else localStorage.setItem('iat_mj_handout_token',prior);
   $('gate-error').textContent=e.message;
 }
});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>openTab(b.dataset.tab));
$('pack-search').oninput=drawPackList;
$('pack-list').addEventListener('click',e=>{const b=e.target.closest('[data-pack]');if(!b)return;current=b.dataset.pack;drawPack();});
$('pack-assign-all').onclick=()=>{
 const to=$('pack-target-all').value;
 if(!to)return message('Choisis d’abord un destinataire.','error');
 let count=0;
 getPack().items.forEach(row=>{
   const sel=document.querySelector('[data-recipient="'+row.id+'"]'),check=document.querySelector('[data-include="'+row.id+'"]');
   if(sel&&!sel.disabled){sel.value=to;check.checked=true;count++;}
 });
 message(count+' ligne(s) du pack affectée(s) à '+pnames[to]+'. Vérifie puis confirme l’envoi.','ok');
};
$('send-pack').onclick=sendPack;
$('retry-pack').onclick=runQueue;
$('shop-search').oninput=drawShop;
$('stock-list').addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b)chooseProduct(b.dataset.edit);});
$('new-product').onclick=()=>chooseProduct('');
$('potion-3').onclick=()=>{
 const pot=state?.items.find(x=>x.name.toLowerCase().includes('potion de soins'));
 if(!pot)return message('Potion de soins introuvable dans le catalogue.','error');
 chooseProduct(pot.id);$('product-form').elements.stock.value=3;
 message('Potion de soins sélectionnée, stock proposé à 3. Clique sur « Enregistrer l’article » pour appliquer ce choix.','ok');
};
$('product-form').onsubmit=saveProduct;
$('refresh').onclick=()=>refresh();
chooseProduct('');
if(!A?.isMJ){message('Ce panneau est exclusivement réservé au MJ.','error');$('gate').hidden=false;}
else if(!A.key()){$('gate').hidden=false;message('Ouvre ton accès MJ existant pour consulter les récompenses.');}
else refresh();
})();
