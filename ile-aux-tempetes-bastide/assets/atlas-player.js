/* Refresh revealed maps while playing; hidden maps also close an open viewer. */
(()=>{
const A=window.BastideInventory,$=id=>document.getElementById(id),box=$('maps'),status=$('status'),viewer=$('viewer'),picture=$('viewerImage');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let maps=[],signature='',viewing='',busy=false;
function close(){viewer.hidden=true;picture.removeAttribute('src');viewing='';}
function wireImages(){box.querySelectorAll('img').forEach(img=>img.onerror=()=>{const frame=img.closest('.mapFrame');if(frame)frame.innerHTML=`<span class="loadError">La carte n’a pas chargé.<button type="button" data-retry="${esc(img.src)}">Réessayer</button></span>`;});}
async function refresh(){
 if(busy||document.hidden)return;busy=true;
 try{const data=await A.call('maps&_fresh='+Date.now());if(!Array.isArray(data.maps))throw Error('Atlas indisponible.');maps=data.maps;
  const next=JSON.stringify(maps);if(next!==signature){signature=next;box.innerHTML=maps.map(x=>`<article class="mapCard"><button data-map="${esc(x.id)}"><span class="mapFrame"><img src="${esc(x.image_url)}" alt="${esc(x.title)}" decoding="async" loading="lazy"></span><span class="mapText"><h2>${esc(x.title)}</h2><p>${esc(x.description)}</p></span></button></article>`).join('');wireImages();}
  if(viewing&&!maps.some(x=>x.id===viewing))close();
  status.textContent=maps.length?'Cartes révélées par le MJ · mise à jour automatique.':'Aucune carte révélée pour le moment.';
 }catch(e){status.textContent='Actualisation impossible : '+e.message;}finally{busy=false;}
}
document.addEventListener('click',e=>{const retry=e.target.closest('[data-retry]');if(retry){const img=document.createElement('img');img.alt='Carte';img.src=retry.dataset.retry+(retry.dataset.retry.includes('?')?'&':'?')+'reload='+Date.now();retry.closest('.mapFrame').replaceChildren(img);wireImages();return;}
 const button=e.target.closest('[data-map]');if(button){const x=maps.find(m=>m.id===button.dataset.map);if(!x)return;viewing=x.id;$('viewerTitle').textContent=x.title;picture.classList.remove('zoomed');picture.src=x.image_url;picture.alt=x.title;viewer.hidden=false;}
 if(e.target.id==='close')close();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
window.addEventListener('online',refresh);setInterval(refresh,8000);refresh();
})();
