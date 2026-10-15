export const MODULES={character:['Personnages','Les héros de votre campagne'],journal:['Chroniques','La mémoire de vos aventures'],document:['Documents','Cartes, lettres et ressources'],message:['Échanges','Les conversations du groupe'],note:['Notes MJ','Votre préparation confidentielle'],item:['Objets','Le catalogue de votre campagne'],feedback:['Retours bêta','Améliorons le hub ensemble']};
export const STATS=['FOR','AGI','CON','INT','PER','CHA'];
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeLink(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
export function canEdit(record,user,campaign){return campaign.owner_id===user.id||(record.owner_id===user.id&&['character','message','feedback'].includes(record.kind));}
export function validateRecord(r){
 if(!r||!MODULES[r.kind]||typeof r.title!=='string'||!r.title.trim()||r.title.length>160)throw Error('Titre ou type de contenu invalide.');
 if(typeof r.body!=='string'||r.body.length>30000)throw Error('Texte trop long (30 000 caractères maximum).');
 if(!['group','mj'].includes(r.visibility))throw Error('Visibilité invalide.');
 if(!r.data||Array.isArray(r.data)||typeof r.data!=='object'||new TextEncoder().encode(JSON.stringify(r.data)).length>100000)throw Error('Données invalides ou trop volumineuses.');
 return {kind:r.kind,title:r.title.trim(),body:r.body,data:r.data,visibility:r.visibility};
}
export function validateBackup(b){
 if(b?.format!=='guiltanas-hcfg-1'||!b.campaign||typeof b.campaign.name!=='string'||!b.campaign.name.trim()||b.campaign.name.length>100||!Array.isArray(b.records)||b.records.length>10000)throw Error('Sauvegarde du hub configurable invalide.');
 if(b.campaign.settings!=null&&(!b.campaign.settings||Array.isArray(b.campaign.settings)||typeof b.campaign.settings!=='object'||new TextEncoder().encode(JSON.stringify(b.campaign.settings)).length>20000))throw Error('Réglages de campagne invalides.');
 if(b.campaign.description!=null&&(typeof b.campaign.description!=='string'||b.campaign.description.length>4000))throw Error('Description de campagne invalide.');
 return {campaign:{name:b.campaign.name,description:b.campaign.description||'',settings:b.campaign.settings||{}},records:b.records.map(validateRecord)};
}
