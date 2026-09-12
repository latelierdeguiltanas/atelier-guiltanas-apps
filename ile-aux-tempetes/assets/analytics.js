/* Île aux Tempêtes — analytics public (GA4)
   Propriété GA4 : L’Île aux Tempêtes — ID de mesure G-5T7R70G1ZG.
   Les pages MJ/admin ne chargent pas ce fichier. */
(()=>{
  const ID=(window.IAT_GA_MEASUREMENT_ID||'G-5T7R70G1ZG').trim();
  if(!/^G-[A-Z0-9]+$/i.test(ID)) return;

  const CONSENT_KEY='iat_analytics_consent_v1';
  let loaded=false;

  function loadGA(){
    if(loaded) return; loaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){dataLayer.push(arguments)};
    const s=document.createElement('script');
    s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ID);
    document.head.appendChild(s);
    gtag('js',new Date());
    gtag('config',ID,{send_page_view:true,anonymize_ip:true});
    document.addEventListener('click',trackClick,true);
  }

  function textOf(el){
    return (el.getAttribute?.('aria-label')||el.getAttribute?.('title')||el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,100);
  }

  function trackClick(e){
    const el=e.target?.closest?.('a,button,[role="button"],input[type="button"],input[type="submit"]');
    if(!el) return;
    const href=el.getAttribute?.('href')||'';
    if(/(^|\/)mj\//i.test(href)) return;
    gtag('event','ui_click',{
      page_path:location.pathname,
      element_type:(el.tagName||'').toLowerCase(),
      element_text:textOf(el)||'(sans libellé)',
      link_url:href||undefined
    });
  }

  function setConsent(value){
    localStorage.setItem(CONSENT_KEY,value);
    document.getElementById('iat-analytics-consent')?.remove();
    if(value==='granted') loadGA();
  }

  function showConsent(){
    if(document.getElementById('iat-analytics-consent')) return;
    const box=document.createElement('div');
    box.id='iat-analytics-consent';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-label','Mesure d’audience');
    box.style.cssText='position:fixed;z-index:2147483647;left:12px;right:12px;bottom:12px;max-width:720px;margin:auto;background:#101719;color:#f5efe3;border:1px solid #78633d;border-radius:16px;padding:14px 15px;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 12px 40px #0008';
    box.innerHTML='<div style="font-weight:800;margin-bottom:6px">Mesure d’audience</div><div style="color:#c8c8c0">Autorises-tu les statistiques anonymes pour savoir quelles pages sont consultées, combien de temps elles sont utilisées et quels boutons sont cliqués ?</div><div style="display:flex;gap:8px;margin-top:12px"><button id="iat-analytics-ok" style="flex:1;border:0;border-radius:10px;padding:10px;font-weight:800;background:#d7b16b;color:#111">Accepter</button><button id="iat-analytics-no" style="flex:1;border:1px solid #596164;border-radius:10px;padding:10px;font-weight:800;background:#20292c;color:#fff">Refuser</button></div>';
    document.body.appendChild(box);
    box.querySelector('#iat-analytics-ok').onclick=()=>setConsent('granted');
    box.querySelector('#iat-analytics-no').onclick=()=>setConsent('denied');
  }

  const choice=localStorage.getItem(CONSENT_KEY);
  if(choice==='granted') loadGA();
  else if(choice!=='denied'){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',showConsent,{once:true});
    else showConsent();
  }
})();