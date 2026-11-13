/* Fonctions pures, testables sans navigateur ; aucune écriture ni envoi réseau. */
(function(root){
  'use strict';
  const IDS=['vax','hammerz','lelio','loris'],COINS=['PC','PA','PE','PO','PP'];
  function normalizeQty(value,max){
    const n=Number(value);
    if(!Number.isSafeInteger(n)||n<1||n>max)throw new Error('Quantité incorrecte (maximum '+max+').');
    return n;
  }
  function buildDraft(pack,assignments,already={}){
    if(!pack||!Array.isArray(pack.items))throw new Error('Pack inconnu.');
    if(!Array.isArray(assignments))throw new Error('Choix de distribution incorrects.');
    const groups=new Map(),seen=new Set(),draftUsed=new Map();
    for(const a of assignments){
      const row=pack.items.find(x=>x.id===a.lineId);
      if(!row)throw new Error('Objet inconnu dans le pack.');
      if(!IDS.includes(a.playerId))throw new Error('Destinataire inconnu.');
      const qty=normalizeQty(a.qty,row.qty);
      const lineKey=pack.id+':'+row.id+':'+a.playerId;
      if(seen.has(lineKey))throw new Error('Ligne envoyée deux fois dans ce lot.');
      const consumed=Object.entries(already).filter(([key])=>key.startsWith(pack.id+':'+row.id+':')).reduce((sum,[,record])=>sum+Math.max(0,Number(record?.qty??record)||0),0);
      if(already[lineKey])throw new Error('Déjà envoyé à '+a.playerId+' : '+row.name+'.');
      const inDraft=draftUsed.get(pack.id+':'+row.id)||0;
      if(qty+consumed+inDraft>row.qty)throw new Error('Quantité totale dépassée pour '+row.name+' : '+(consumed+inDraft+qty)+'/'+row.qty+'.');
      draftUsed.set(pack.id+':'+row.id,inDraft+qty);
      seen.add(lineKey);
      if(!groups.has(a.playerId))groups.set(a.playerId,{playerId:a.playerId,items:[],money:Object.fromEntries(COINS.map(c=>[c,0])),keys:[],labels:[]});
      const g=groups.get(a.playerId);
      g.keys.push(lineKey);g.labels.push(qty+' × '+row.name);
      if(row.type==='money'){
        if(!COINS.includes(row.currency))throw new Error('Monnaie inconnue.');
        g.money[row.currency]+=qty;
      }else{
        g.items.push({name:row.name,qty,category:row.category||'Trésor',notes:row.notes||'',mediaUrl:'',charges:0,chargesMax:0});
      }
    }
    return [...groups.values()].map(g=>({
      playerId:g.playerId,
      keys:g.keys,
      labels:g.labels,
      body:{playerId:g.playerId,items:g.items,money:g.money,summary:'Récompense · '+pack.title}
    }));
  }
  root.IATRewardCore={buildDraft,IDS,COINS};
})(typeof window!=='undefined'?window:globalThis);
