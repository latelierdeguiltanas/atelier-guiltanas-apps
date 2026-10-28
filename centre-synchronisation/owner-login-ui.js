(()=>{'use strict';
const $=q=>document.querySelector(q),A=window.GuiltanasOwnerAuth;
async function show(message=''){
 $('#locked').hidden=false;$('#content').hidden=true;$('#owner-logout').hidden=true;
 $('#owner-login-form').hidden=true;$('#owner-setup-form').hidden=true;$('#auth-retry').hidden=true;
 $('#auth-error').textContent=message;
 try{
  const status=await A.request('status');
  $('#owner-login-form').hidden=!status.configured;
  $('#owner-setup-form').hidden=!!status.configured;
  $('#auth-title').textContent=status.configured?'Connexion à Pilotage Guiltanas':'Activer Pilotage Guiltanas';
  $('#lock-text').textContent=status.configured?'Ton compte propriétaire est indépendant de toutes les campagnes.':'Crée ton accès Atelier une seule fois avec le code d’activation transmis dans cette conversation.';
 }catch(e){$('#auth-error').textContent=e.message;$('#auth-retry').hidden=false;}
}
async function finish(){await window.PilotageReload?.()}
$('#owner-login-form').onsubmit=async e=>{
 e.preventDefault();const button=$('#owner-login-submit');button.disabled=true;$('#auth-error').textContent='';
 try{await A.login($('#owner-password').value);$('#owner-password').value='';await finish();}
 catch(e){$('#auth-error').textContent=e.message}
 finally{button.disabled=false}
};
$('#owner-setup-form').onsubmit=async e=>{
 e.preventDefault();const button=$('#owner-setup-submit');button.disabled=true;$('#auth-error').textContent='';
 try{
  const pass=$('#owner-setup-password').value;
  if(pass!==$('#owner-setup-confirm').value)throw Error('Les deux mots de passe ne correspondent pas.');
  await A.setup($('#owner-bootstrap').value,pass);
  $('#owner-bootstrap').value='';$('#owner-setup-password').value='';$('#owner-setup-confirm').value='';
  await finish();
 }catch(e){$('#auth-error').textContent=e.message}
 finally{button.disabled=false}
};
$('#auth-retry').onclick=()=>show();
$('#owner-logout').onclick=async()=>{
 if(!confirm('Déconnecter le cockpit de cet appareil ?'))return;
 try{await A.logout()}catch{A.clear()}
 await show('Déconnexion effectuée.');
};
window.GuiltanasLogin={show};
})();