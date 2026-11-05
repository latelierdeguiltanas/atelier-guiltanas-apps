/* Choix explicite de situations, sans modifier la fiche ni les sauvegardes. */
(function(){'use strict';
const API=window.FOH_HISTORY_CONTEXT_N1,P=window.__FOH_PRODUCT__,E=window.__FOH_ENGINE__;if(!API||!P||!E)return;
const examples={
 community:[['Interaction sociale avec ma communauté professionnelle',{socialInteraction:true,sameProfessionalCommunity:true}],['Interlocuteur extérieur à ma communauté',{socialInteraction:true,sameProfessionalCommunity:false}]],
 courtier_secrets:[['Trouver une information secrète',{test:'secret_information'}],['Obtenir une information sensible',{test:'sensitive_information'}],['Perception auditive',{test:'auditory_perception'}],['Perception visuelle : autre capacité',{test:'visual_perception'}]],
 courtier_details:[['Perception visuelle',{test:'visual_perception'}],['Percer un mensonge',{test:'detect_lie'}],['Décoder le langage corporel',{test:'read_body_language'}],['Perception auditive : autre capacité',{test:'auditory_perception'}]],
 scholar_persuasion:[['Test de CHA pour convaincre',{test:'convince',characteristic:'cha'}],['Test d’INT : ce bonus ne s’applique pas',{test:'convince',characteristic:'int'}]],
 expert_work:[['Test ou travail dans mon métier',{relatesToChosenProfession:true}],['Activité étrangère à mon métier',{relatesToChosenProfession:false}]]
};
let panel;const node=(parent,tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;parent.appendChild(el);return el;};
const character=()=>{const r=E.computeCharacterN1(P.buildState());return r.errors?.length?null:r.sticky?.characterState;};
function render(){try{const host=document.getElementById('summary-content');if(!host||host.hidden)return;const c=character();if(!c)return;const owned=API.available(c);if(!owned.length){if(panel)panel.hidden=true;return;}
 if(!panel){panel=document.createElement('details');panel.id='foh-history-context';panel.style.cssText='margin:14px 0;padding:12px;border:1px solid #877553;border-radius:10px;background:#171511;color:#f5f0e5;min-width:0';node(panel,'summary','Calculs des historiques en situation');node(panel,'p','Choisis la situation réelle avec le MJ. Ces effets conditionnels ne changent pas les caractéristiques permanentes.');
  const label=node(panel,'label','Règle acquise : '),a=node(label,'select');a.id='foh-history-ability';
  const label2=node(panel,'label','Situation : '),b=node(label2,'select');b.id='foh-history-example';
  for(const l of [label,label2])l.style.cssText='display:grid;gap:7px;margin:10px 0;min-width:0';for(const select of [a,b])select.style.cssText='width:100%;min-width:0;max-width:100%;box-sizing:border-box;padding:9px;background:#171511;color:white';
  const button=node(panel,'button','Calculer les effets');button.type='button';button.id='foh-history-run';const out=node(panel,'div');out.id='foh-history-result';out.setAttribute('aria-live','polite');out.style.cssText='white-space:pre-wrap;margin-top:10px';
  a.addEventListener('change',()=>{b.replaceChildren();examples[a.value].forEach(([text],i)=>{const o=node(b,'option',text);o.value=String(i);});out.textContent='';});
  button.addEventListener('click',()=>{try{const current=character();if(!current)throw Error('Fiche incomplète.');const r=API.resolve(current,a.value,examples[a.value][Number(b.value)][1]),lines=[r.applies?'Règle applicable dans cette situation.':'Règle NON applicable dans cette situation.'];if(r.modifiers.skillBonus!=null)lines.push('Bonus de compétence : +'+r.modifiers.skillBonus);if(r.modifiers.bonusDie)lines.push('Dé bonus : oui');if(r.modifiers.workTimeMultiplier!=null)lines.push('Temps de travail : × '+r.modifiers.workTimeMultiplier);for(const message of [...r.requirements,...r.notes])lines.push(message);lines.push('Référence : voies d’historique COF2, p. '+r.sourcePage+'.');out.textContent=lines.join('\n');}catch(e){out.textContent='Calcul impossible : '+e.message;}});
  host.insertAdjacentElement('afterend',panel);
 }
 panel.hidden=false;const a=panel.querySelector('#foh-history-ability'),signature=owned.join('|');if(a.dataset.available!==signature){const previous=a.value;a.replaceChildren();for(const key of owned){const o=node(a,'option',API.rules[key].title);o.value=key;}a.dataset.available=signature;if(owned.includes(previous))a.value=previous;a.dispatchEvent(new Event('change'));}
}catch(e){/* Une fiche en cours de saisie n'a pas encore de projection valide. */}}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});};const host=document.querySelector('main');if(host)new MutationObserver(schedule).observe(host,{subtree:true,childList:true});schedule();
})();
