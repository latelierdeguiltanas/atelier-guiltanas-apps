(()=>{'use strict';
const $=q=>document.querySelector(q),A=window.GuiltanasOwnerAuth;
async function show(message=''){
 $('#locked').hidden=false;$('#content').hidden=true;$('#owner-logout').hidden=true;$('#owner-password-reset-open').hidden=true;
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

$('#owner-forgot-help').onclick=()=>{$('#owner-forgot-instructions').hidden=!$('#owner-forgot-instructions').hidden};
$('#owner-password-reset-open').onclick=()=>{
 if(!A.token()){show('Ouvre d’abord le Copilote depuis un appareil déjà connecté.');return}
 const dlg=$('#owner-password-reset-dialog');
 $('#owner-password-reset-result').textContent='';
 if(!dlg.open)dlg.showModal();
 $('#owner-password-reset-new').focus();
};
$('#owner-password-reset-close').onclick=()=>$('#owner-password-reset-dialog').close();
$('#owner-password-reset-dialog').addEventListener('close',()=>{
 $('#owner-password-reset-new').value='';$('#owner-password-reset-repeat').value='';
});
$('#owner-password-reset-form').onsubmit=async e=>{
 e.preventDefault();
 const b=$('#owner-password-reset-submit'),message=$('#owner-password-reset-result');
 const a=$('#owner-password-reset-new').value,c=$('#owner-password-reset-repeat').value;
 if(a!==c){message.textContent='Les mots de passe ne correspondent pas.';return}
 if(a.length<8){message.textContent='Le mot de passe doit contenir au moins 8 caractères.';return}
 b.disabled=true;message.textContent='Réinitialisation sécurisée en cours…';
 try{
  const response=await A.request('recover-from-session',{newPassword:a});
  if(!response.ok)throw Error('La confirmation du serveur est incomplète.');
  A.clear();
  $('#owner-password-reset-dialog').close();
  await show('Mot de passe modifié. Reconnecte-toi avec le nouveau sur cet appareil et ton ordinateur.');
 }catch(err){message.textContent=err.message}
 finally{b.disabled=false}
};
$('#auth-retry').onclick=()=>show();
$('#owner-logout').onclick=async()=>{
 if(!confirm('Déconnecter le cockpit de cet appareil ?'))return;
 try{await A.logout()}catch{A.clear()}
 await show('Déconnexion effectuée.');
};
window.GuiltanasLogin={show};
})();