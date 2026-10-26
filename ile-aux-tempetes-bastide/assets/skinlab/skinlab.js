/* Guiltanas SkinLab v0.1 - visuel uniquement */
(()=>{'use strict';
const hero=window.BASTIDE_CHARACTER,id=hero&&hero.id;
if(!['zepheline','vivelame','scanlan','wilfried','faelar','prepotante'].includes(id))return;
const presets={
 Bastide:['#19372a','#244835','#fbf4df','#b48d40','#302a20'],
 Feerie:['#4b355a','#764f89','#fff2fa','#ba77a8','#362c40'],
 Metal:['#242e37','#273644','#e1e8e8','#b07b46','#202b32'],
 Solaire:['#6a5232','#8e6628','#fff6e1','#c39236','#4b341b'],
 Barde:['#43263b','#632844','#fdf0e5','#d09b51','#3c2634'],
 Nocturne:['#141c2d','#222646','#dfe6f5','#8b9fd5','#222d42']};
const starter={zepheline:'Feerie',vivelame:'Metal',scanlan:'Barde',wilfried:'Solaire',faelar:'Bastide',prepotante:'Bastide'};
const key='guiltanas_skinlab_v1_'+id;
const classes={forme:['arrondi','doux','anguleux'],cadre:['rond','carre','hexagone','bouclier'],motif:['aucun','points','lignes','croisillons'],ornement:['aucun','fleurs','runes','rouages','soleil','musique']};
const glyph={fleurs:'✿',runes:'ᛟ',rouages:'⚙',soleil:'☼',musique:'♫'};
function fresh(t){return{colors:presets[t||starter[id]].slice(),forme:'arrondi',cadre:'rond',motif:'aucun',ornement:'aucun',intensite:12,zoom:1,portrait:'',active:false}}
function safe(x){const v=fresh();if(!x||typeof x!=='object')return v;
if(Array.isArray(x.colors)&&x.colors.length===5)x.colors.forEach((s,i)=>{if(typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s))v.colors[i]=s});
Object.keys(classes).forEach(k=>{if(classes[k].includes(x[k]))v[k]=x[k]});
v.intensite=Math.min(35,Math.max(0,Number(x.intensite)||0));v.zoom=Math.min(2,Math.max(1,Number(x.zoom)||1));
v.active=x.active===true;if(typeof x.portrait==='string'&&x.portrait.length<800000&&/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(x.portrait))v.portrait=x.portrait;return v}
let theme;try{theme=safe(JSON.parse(localStorage.getItem(key)||'null'))}catch{theme=fresh()}
let sheet,launch,modal;
const style=document.createElement('style');
style.textContent=[
'body.sl-on{--paper:var(--sl-card);--paper-2:var(--sl-card);--ink:var(--sl-ink);--line:var(--sl-accent);background:radial-gradient(circle at 20% 0%,var(--sl-head),transparent 38%),linear-gradient(145deg,var(--sl-bg),#0a1010)!important}',
'body.sl-on .paper{background:var(--sl-card)!important;border-color:var(--sl-accent)!important;border-radius:var(--sl-radius)!important}',
'body.sl-on .identity{background:linear-gradient(120deg,var(--sl-head),var(--sl-bg))!important;position:relative;gap:8px;border-bottom:3px solid var(--sl-accent)}',
'body.sl-on .identity h1{color:white!important;text-shadow:0 1px 2px #0008}',
'body.sl-on .identity small,body.sl-on .identity p{color:#fff1e6!important}',
'body.sl-on .level{border-color:var(--sl-accent)!important;color:white}',
'body.sl-on .resources{background:var(--sl-card)!important}',
'body.sl-on .section-title{background:var(--sl-accent)!important;color:var(--sl-contrast)!important}',
'body.sl-on .paper .card,body.sl-on .paper .ability,body.sl-on .paper .attack,body.sl-on .paper .item,body.sl-on .paper .value,body.sl-on .paper .stat,body.sl-on .paper .choice,body.sl-on .paper .path,body.sl-on .paper .rest-card{border-color:var(--sl-accent)!important;border-radius:var(--sl-radius)!important;background:var(--sl-card)!important;color:var(--sl-ink)!important}',
'body.sl-on .tabs button,body.sl-on .tabs .tab-link,body.sl-on .paper .mini-button{border-radius:var(--sl-btn-radius)!important;border-color:var(--sl-accent)!important}',
'body.sl-on .tabs button.active{background:var(--sl-accent)!important;color:var(--sl-contrast)!important}',
'body.sl-on .paper{position:relative;isolation:isolate}',
'body.sl-on .paper:before{content:"";pointer-events:none;position:absolute;inset:0;z-index:0;opacity:var(--sl-opacity);background-image:var(--sl-pattern);background-size:18px 18px}',
'body.sl-on .paper>*{position:relative;z-index:1}',
'body.sl-on .sl-portrait{order:-1;flex:0 0 72px;width:72px;height:72px;overflow:hidden;display:grid;place-items:center;background:var(--sl-card);border:3px solid var(--sl-accent);color:var(--sl-ink);font-size:30px;border-radius:var(--sl-frame)}',
'body.sl-on .sl-portrait.hexagone{clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}',
'body.sl-on .sl-portrait.bouclier{border-radius:4px 4px 24px 24px}',
'body.sl-on .sl-portrait img{width:100%;height:100%;object-fit:cover;transform:scale(var(--sl-zoom))}',
'body.sl-on .identity[data-sl-orn]:after{content:attr(data-sl-orn);position:absolute;right:60px;top:4px;color:var(--sl-accent);font-size:29px;opacity:.55;pointer-events:none}',
'#sl-launch{border:1px solid #c1a467;border-radius:999px;background:#244531;color:white;padding:7px 10px;min-height:34px;font:800 .74rem system-ui;cursor:pointer}',
'.sheet-top:has(#sl-launch){flex-wrap:wrap}',
'#sl-overlay{display:none;position:fixed;inset:0;z-index:2147483600;background:#030b0bdf;padding:9px;align-items:center;justify-content:center;font:13px system-ui;color:white}',
'#sl-overlay.sl-visible{display:flex}',
'#sl-overlay *{box-sizing:border-box}',
'#sl-overlay .sl-dialog{background:#142423;border:1px solid #bda36c;border-radius:15px;width:min(600px,100%);max-height:96dvh;overflow-y:auto;padding:15px;color:white}',
'#sl-overlay h2,#sl-overlay h3{color:#f2d692;margin:10px 0 8px}',
'#sl-overlay h2{font-size:1.15rem;margin:0}',
'#sl-overlay h3{font-size:.9rem}',
'#sl-overlay p{font-size:.77rem;color:#c8d5d0;line-height:1.4}',
'#sl-overlay .sl-row{display:flex;align-items:center;justify-content:space-between;gap:10px}',
'#sl-overlay .sl-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
'#sl-overlay .sl-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
'#sl-overlay label{display:block;font-size:.76rem;font-weight:700;min-width:0}',
'#sl-overlay input[type=color],#sl-overlay input[type=range],#sl-overlay input[type=file],#sl-overlay select{width:100%;display:block;margin-top:5px;min-height:34px;background:#223536;border:1px solid #5c7871;color:white;border-radius:8px}',
'#sl-overlay input[type=color]{padding:0}',
'#sl-overlay input[type=range]{min-height:20px;accent-color:#d8c88f}',
'#sl-overlay button{border:1px solid #78918a;border-radius:8px;min-height:36px;padding:8px;color:white;background:#2a403b;font:700 .76rem system-ui;cursor:pointer}',
'#sl-overlay .sl-presets button{background:var(--sl-swatch);text-shadow:0 1px 2px black;border:2px solid #6d7970}',
'#sl-overlay .sl-presets button[aria-pressed=true]{border-color:#ffe7a4}',
'#sl-overlay .sl-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}',
'#sl-overlay .sl-actions button{flex:1 1 auto}',
'#sl-feedback{min-height:15px;color:#ffe5ad!important}',
'@media(max-width:450px){body.sl-on .sl-portrait{width:52px;height:52px;flex-basis:52px;font-size:20px}body.sl-on .identity{padding:9px;gap:6px}body.sl-on .identity h1{font-size:clamp(1.2rem,6vw,1.65rem)}body.sl-on .identity p{font-size:.68rem}#sl-overlay{padding:3px;align-items:stretch}#sl-overlay .sl-dialog{max-height:100dvh;padding:12px}}'
].join('\n');document.head.appendChild(style);
const by=id=>document.getElementById(id);
function feedback(s){const e=by('sl-feedback');if(e)e.textContent=s}
function save(){try{localStorage.setItem(key,JSON.stringify(theme));return true}catch{feedback('Mémoire pleine : utilise Exporter JSON pour conserver ton style.');return false}}
function paint(){if(!sheet)return;document.body.classList.toggle('sl-on',theme.active);
const c=theme.colors;const value=parseInt(c[3].slice(1),16);const light=((value>>16)*.3+((value>>8&255)*.59)+(value&255)*.11)>150;
const vars={'--sl-bg':c[0],'--sl-head':c[1],'--sl-card':c[2],'--sl-accent':c[3],'--sl-ink':c[4],'--sl-contrast':light?'#1a2621':'white','--sl-radius':theme.forme==='anguleux'?'2px':theme.forme==='doux'?'9px':'16px','--sl-btn-radius':theme.forme==='anguleux'?'2px':theme.forme==='doux'?'9px':'999px','--sl-frame':theme.cadre==='carre'?'0':theme.cadre==='rond'?'50%':'15px','--sl-opacity':theme.intensite/100,'--sl-zoom':theme.zoom,'--sl-pattern':theme.motif==='points'?'radial-gradient(#777 1px,transparent 1px)':theme.motif==='lignes'?'repeating-linear-gradient(135deg,#777 0 1px,transparent 1px 15px)':theme.motif==='croisillons'?'repeating-linear-gradient(45deg,#777 0 1px,transparent 1px 12px)':'none'};
Object.entries(vars).forEach(([k,v])=>document.body.style.setProperty(k,String(v)));
sheet.querySelectorAll('.sl-portrait').forEach(e=>e.remove());
const header=sheet.querySelector('.identity');
if(header){if(theme.active){const holder=document.createElement('div');holder.className='sl-portrait '+theme.cadre;holder.setAttribute('aria-label','Portrait personnel');if(theme.portrait){const img=document.createElement('img');img.src=theme.portrait;img.alt='Portrait du personnage';holder.appendChild(img)}else holder.textContent='♟';header.prepend(holder)}if(theme.active&&theme.ornement!=='aucun')header.dataset.slOrn=glyph[theme.ornement];else delete header.dataset.slOrn}
if(launch)launch.textContent=theme.active?'🎨 Ma fiche':'🎨 Personnaliser';
if(modal?.classList.contains('sl-visible'))refresh()}
function refresh(){modal.querySelectorAll('[data-color]').forEach(e=>e.value=theme.colors[Number(e.dataset.color)]);modal.querySelectorAll('[data-prop]').forEach(e=>e.value=theme[e.dataset.prop]);by('sl-intensity').value=theme.intensite;by('sl-zoom').value=theme.zoom;by('sl-enable').textContent=theme.active?'Désactiver le style':'Activer le style';modal.querySelectorAll('[data-preset]').forEach(e=>e.setAttribute('aria-pressed',presets[e.dataset.preset].every((v,i)=>v===theme.colors[i])))}
function open(){modal.classList.add('sl-visible');document.body.style.overflow='hidden';refresh();modal.querySelector('[data-close]').focus()}
function close(){modal.classList.remove('sl-visible');document.body.style.overflow='';launch.focus()}
function selector(k,label,options){return '<label>'+label+'<select data-prop="'+k+'">'+options.map(v=>'<option value="'+v+'">'+v+'</option>').join('')+'</select></label>'}
async function prepare(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('JPEG, PNG ou WebP uniquement.');if(file.size>8e6)throw Error('Image trop lourde.');const bmp=await createImageBitmap(file);try{const canvas=document.createElement('canvas');canvas.width=canvas.height=440;const ctx=canvas.getContext('2d'),side=Math.min(bmp.width,bmp.height);ctx.drawImage(bmp,(bmp.width-side)/2,(bmp.height-side)/2,side,side,0,0,440,440);const url=canvas.toDataURL('image/jpeg',.74);if(url.length>800000)throw Error('Image encore trop lourde après compression.');return url}finally{bmp.close?.()}}
function install(){if(sheet||!document.querySelector('.sheet .identity')||!document.querySelector('.sheet .sheet-top'))return false;
sheet=document.querySelector('.sheet');launch=document.createElement('button');launch.type='button';launch.id='sl-launch';launch.textContent='🎨 Personnaliser';sheet.querySelector('.sheet-top').appendChild(launch);launch.onclick=open;
modal=document.createElement('div');modal.id='sl-overlay';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.innerHTML='<div class="sl-dialog"><div class="sl-row"><h2>🎨 Mon Atelier de Personnage</h2><button data-close aria-label="Fermer">×</button></div><p>Ce module modifie seulement l’apparence, jamais les PV, les pouvoirs ou les objets.</p><h3>Thèmes de départ</h3><div class="sl-presets" id="sl-presets"></div><h3>Couleurs personnalisées</h3><div class="sl-grid">'+['Fond','Bandeau','Cartes','Accents','Texte'].map((v,i)=>'<label>'+v+'<input type="color" data-color="'+i+'"></label>').join('')+'</div><h3>Formes et détails</h3><div class="sl-grid">'+selector('forme','Formes',classes.forme)+selector('cadre','Cadre du portrait',classes.cadre)+selector('ornement','Ornements',classes.ornement)+selector('motif','Texture',classes.motif)+'</div><label>Intensité du motif<input id="sl-intensity" type="range" min="0" max="35"></label><h3>Portrait personnel</h3><label>Importer une image<input type="file" accept="image/jpeg,image/png,image/webp" id="sl-photo"></label><label>Zoom du portrait<input type="range" min="1" max="2" step=".05" id="sl-zoom"></label><button id="sl-remove">Retirer le portrait</button><div class="sl-actions"><button id="sl-enable">Activer le style</button><button id="sl-export">Exporter JSON</button><button id="sl-import">Importer JSON</button><input hidden id="sl-import-file" type="file" accept=".json,application/json"><button id="sl-reset">Réinitialiser</button></div><p id="sl-feedback" role="status"></p><p>La sauvegarde est locale pour cette version. Pour changer de téléphone, exporte puis importe ton profil JSON.</p></div>';
document.body.appendChild(modal);const group=by('sl-presets');Object.entries(presets).forEach(([n,c])=>{const b=document.createElement('button');b.type='button';b.dataset.preset=n;b.textContent=n;b.style.setProperty('--sl-swatch','linear-gradient(120deg,'+c[0]+','+c[1]+')');b.onclick=()=>{const old=theme;theme=fresh(n);theme.portrait=old.portrait;theme.zoom=old.zoom;theme.active=true;save();paint();feedback('Style '+n+' appliqué.')};group.appendChild(b)});
modal.querySelector('[data-close]').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
modal.querySelectorAll('[data-color]').forEach(e=>e.oninput=()=>{theme.colors[Number(e.dataset.color)]=e.value;theme.active=true;save();paint()});
modal.querySelectorAll('[data-prop]').forEach(e=>e.onchange=()=>{theme[e.dataset.prop]=e.value;theme.active=true;save();paint()});
by('sl-intensity').oninput=e=>{theme.intensite=Number(e.target.value);theme.active=true;save();paint()};
by('sl-zoom').oninput=e=>{theme.zoom=Number(e.target.value);theme.active=true;save();paint()};
by('sl-enable').onclick=()=>{theme.active=!theme.active;save();paint();feedback(theme.active?'Style activé.':'Style désactivé, préférences conservées.')};
by('sl-remove').onclick=()=>{theme.portrait='';save();paint();feedback('Portrait retiré.')};
by('sl-photo').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{theme.portrait=await prepare(f);theme.active=true;save();paint();feedback('Portrait ajouté.')}catch(err){feedback('Import impossible : '+err.message)}e.target.value=''};
by('sl-export').onclick=()=>{const file=new Blob([JSON.stringify({format:'GUILTANAS_SKINLAB_1',id,theme})],{type:'application/json'});const u=URL.createObjectURL(file);const a=document.createElement('a');a.href=u;a.download='skinlab-'+id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1800);feedback('Profil exporté.')};
by('sl-import').onclick=()=>by('sl-import-file').click();
by('sl-import-file').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>900000)throw Error('Fichier trop volumineux.');const imported=JSON.parse(await f.text());if(imported.format!=='GUILTANAS_SKINLAB_1'||imported.id!==id)throw Error('Profil incorrect pour ce personnage.');theme=safe(imported.theme);theme.active=true;save();paint();feedback('Profil importé.')}catch(err){feedback(err.message)}e.target.value=''};
by('sl-reset').onclick=()=>{if(!confirm('Effacer les préférences visuelles et le portrait sur cet appareil ?'))return;theme=fresh();save();paint();feedback('Apparence initiale restaurée.')};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('sl-visible'))close()});
paint();return true;}
if(!install()){const observer=new MutationObserver(()=>{if(install())observer.disconnect()});observer.observe(document.documentElement,{subtree:true,childList:true});setTimeout(()=>observer.disconnect(),30000)}
})();