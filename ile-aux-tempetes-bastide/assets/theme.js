(()=>{
  'use strict';
  const KEY='iot_bastide_theme_v1';
  const modes=['auto','light','dark'];
  const labels={auto:'◐ Auto',light:'☀ Clair',dark:'☾ Sombre'};
  const saved=localStorage.getItem(KEY);
  let mode=modes.includes(saved)?saved:'auto';
  const own=document.currentScript?.src||location.href;
  if(!document.querySelector('link[data-bastide-theme]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('theme.css?v=3',own).href;
    link.dataset.bastideTheme='1';
    document.head.appendChild(link);
  }
  function effective(){return mode==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode}
  function apply(){
    document.documentElement.dataset.theme=mode;
    document.documentElement.dataset.effectiveTheme=effective();
    document.documentElement.style.colorScheme=effective();
    const button=document.getElementById('bastide-theme-toggle');
    if(button){button.textContent=labels[mode];button.setAttribute('aria-label','Thème actuel : '+labels[mode]+'. Changer de thème.');button.title='Thème : '+labels[mode]}
  }
  function mount(){
    if(document.getElementById('bastide-theme-toggle'))return;
    const button=document.createElement('button');
    button.id='bastide-theme-toggle';
    button.type='button';
    button.onclick=()=>{mode=modes[(modes.indexOf(mode)+1)%modes.length];localStorage.setItem(KEY,mode);apply()};
    document.body.appendChild(button);
    apply();
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(mode==='auto')apply()});
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
