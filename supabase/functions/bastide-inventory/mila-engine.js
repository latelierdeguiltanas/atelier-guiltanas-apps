/* Deterministic, dependency-free dialogue: question -> subject -> answer slot.
   Runs in browser and identically in the hub's own server for persisted conversations. */
(function(root){'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const has=(q,pattern)=>pattern.test(q),word=(q,w)=>(' '+q+' ').includes(' '+norm(w)+' ');
const stop=new Set('un une des de du la le les a au aux et pour avec en mon ma mes ton ta tes son sa ses ce cette ces est sont tu vous je il elle me moi te nous quel quelle quelles quels que quoi comment pourquoi quand ou parle raconte montre savoir demande besoin donne voudrais est quoi combien prix coute cout coutent stock as avez vend vends avez vous acheter voudrais cherche cherche je puis peux peut on bonjour salut merci s il plait potion potions elixir elixirs'.split(' '));
const terms=s=>norm(s).split(' ').map(x=>x.length>4&&x.endsWith('s')?x.slice(0,-1):x).filter(x=>x.length>2&&!stop.has(x));
function oldContext(history,life){for(let i=history.length-1;i>=0;i--){const t=String(history[i].topic||'').split('|')[0],p=t.split(':');if(p[0]==='person')return{type:'person',key:p[1],intent:p[2]};if(p[0]==='self')return{type:'self',key:'mila',intent:p[1]};if(p[0]==='item')return{type:'item',key:p[1],intent:p[2]};if(p[0]==='sanctuary')return{type:'sanctuary',key:'sanctuary',intent:p[1]};if(life.people[t])return{type:'person',key:t,intent:'who'};}return null;}
function choose(values,history){const choices=Array.isArray(values)?values:[values];return choices.find(s=>!history.some(h=>String(h.reply||'').includes(s)))||choices[history.length%choices.length];}
function itemMatch(q,catalog){const query=terms(q),ranked=catalog.map(item=>{const t=terms(item.name);return{item,score:t.filter(x=>query.includes(x)).length,total:t.length};}).filter(x=>x.total&&x.score===x.total).sort((a,b)=>b.total-a.total);if(ranked.length&&ranked.filter(x=>x.total===ranked[0].total).length===1)return ranked[0].item;return null;}
function intent(q){
 if(has(q,/ca va|comment vas|comment te sens|heureuse|heureux|triste/))return 'feel';
 if(has(q,/depuis quand|depuis combien|combien de temps/))return 'duration';
 if(has(q,/comment.*fabri|comment.*prepar|comment.*alchim|comment.*bricol|peux.*fabriqu|tu fabriques|ta recette/))return 'craft';
 if(!has(q,/sans anecdote|pas d anecdote|pas d histoire/)&&has(q,/anecdote|raconte|une histoire|souvenir|que s est il passe|continue|encore une/))return 'story';
 if(has(q,/avec qui.*vis|vis.*avec qui/))return 'family';
 if(has(q,/quel age|quelle age|combien d annees|vieille|vieux/))return 'age';
 if(has(q,/frere|soeur|famille|parents|mere|pere/))return 'family';
 if(has(q,/compagnon amoureux|petit ami|petite amie|amoureux|amoureuse|celibataire|en couple|mariee|mari|amante|amoureux|quelqu un dans ta vie/))return 'romance';
 if(has(q,/detest|n aimes? pas|aimes pas|supportes pas|agace|enerve/))return 'dislikes';
 if(has(q,/qu est ce que.*aim|que.*aimes|aimes quoi|te plait|aime.*faire|passion|passe temps|loisir|plat prefere|repas|manges|manger|cuisine/))return has(q,/plat|repas|manges|manger|cuisine/)?'food':'likes';
 if(has(q,/peur|crain|effraie/))return 'fear';
 if(has(q,/reves|reve|souhait|aimerais|ambition|projet prefere/))return 'wish';
 if(has(q,/puis.*aider|peux.*aider|coup de main|besoin d aide|comment.*aider/))return 'help';
 if(has(q,/d ou.*viens|d ou.*vient|viens.*d ou|vient.*d ou|origine|avant.*repos|avant.*ici/))return 'origin';
 if(has(q,/journee|quotidien|habitudes|horaires|quand.*travail|quand.*dors|comment.*jour/))return 'routine';
 if(has(q,/que penses|qu en penses|ton avis|apprecies|tu l aimes|aimes tu|tu aimes|trouves.*comment/))return 'opinion';
 if(has(q,/connais|ton lien|votre lien|ta relation|vos relations|t entends|vous entendez|pour toi|es proche|ton amie|ton ami/))return 'bond';
 if(has(q,/pourquoi|pour quelle raison|comment ca se fait/))return 'why';
 if(has(q,/^ou\b|\bou est|\bou se|\bou travail|\bou vit|\bou habite|habites.*ou|trouves.*ou|travaille.*ou|habite.*ou|elle.*ou$|il.*ou$|quel endroit|quel lieu|trouver|vit elle|vit il|habite|habites|vis tu|tu vis|tu dors|atelier.*situe/))return 'where';
 if(has(q,/travail|metier|s occupe|fait quoi|fais quoi|fait elle|fait il|rends utile|role|aide comment|comment.*aide/))return 'job';
 if(has(q,/qui est|qui es|presente|parle moi|c est qui|tu es quoi|que sais tu/))return 'who';
 return null;
}
function reply(message,history=[],catalog=[],options={}){
 const life=root.BastideMilaLife,q=norm(message),context=oldContext(history,life),mentioned=Object.entries(life.people).filter(([,p])=>p.aliases.some(a=>word(q,a))).map(([k])=>k);
 const response=(topic,text,kind='answer')=>({topic,text,kind});
 if(!q)return response('clarify','Je t’écoute. Qu’est-ce que tu voudrais me demander ?','clarification');
 if(has(q,/secret|identite cachee|vraie identite|solution du scenario|spoiler|boss final|runara.*dragon|dragon.*runara/))return response('unknown','Je peux te parler de ce que je connais dans notre vie au sanctuaire. Pour les secrets ou ce que tu supposes sur quelqu’un, il vaut mieux t’adresser à la personne concernée.');
 if(mentioned.length>1){const names=mentioned.map(k=>life.people[k].name);if(has(q,/relation entre|pense.*de|s entendent|s aiment|entre.*et/))return response('clarify:people','Tu veux savoir ce que moi je pense de '+names.join(' et ')+', ou ce qu’ils pensent l’un de l’autre ? Je peux te parler de mes propres liens ; pour leurs sentiments, il faut leur demander.','clarification');return response('people:several',mentioned.map(k=>life.people[k].who).join(' '));}
 let subject=mentioned.length?{type:'person',key:mentioned[0]}:null;
 const aboutSelf=has(q,/tes ailes|t es blessee|tu es blessee|ton histoire|te connaitre|a propos de toi|toi meme|qui es tu|tu t appelles|ton prenom|quel est ton nom|tu es quoi|ton metier|tu fais quoi|que fais tu|ton atelier|tu habites|tu vis|ta journee|ton quotidien|tes projets|ta famille|ton frere|ta soeur|tes parents|tu as peur|tu aimes|aimes tu|tes passions|tu manges|tes repas|ton passe|tu viens|t es arrive|tu es arrive|ton age|quel age as|as tu un|as tu une|tu as un|tu as une|ta vie/);
 const shopQuestion=has(q,/potion|elixir|fiole|antidote|parchemin|ration|epee|dague|armure|bouclier|prix|coute|coutent|combien|stock|vends|vendez|vendre|acheter|achat|rayon|rabais|remise|reduc|solde|gratuit|cadeau/);
 let item=itemMatch(q,catalog);
 const followSlot=context&&has(q,/^et toi$|^et |^non |je parlais|plutot/)?context.intent:null;
 const narrativeIntent=intent(q)||followSlot;
 if(!subject&&has(q,/^et toi$/))subject={type:'self',key:'mila'};
 if(!subject&&has(q,/peux.*voler|sais.*voler|t envoler|prendre.*envol/)&&!has(q,/potion|objet|argent|piece|derob/))return response('self:flight',choose(life.self.flight,history));
 if(!subject&&has(q,/qui.*t a aide|qui.*t a soigne|qui.*tes ailes/))return response('self:injury',choose(life.self.injury,history));
 if(!subject&&narrativeIntent&&has(q,/\btu\b|\btes\b|\bton\b|\bta\b|^ca va/)&&(!shopQuestion||['craft','likes','food','feel','family','romance','age','routine','feel','craft','duration'].includes(narrativeIntent)))subject={type:'self',key:'mila'};
 if(!item&&context?.type==='item'&&has(q,/combien|prix|stock|description|elle|il|en as|ca|celle|celui|effet|sert|rend|quantite|encore/)&&!subject&&!aboutSelf)item=catalog.find(x=>String(x.id||norm(x.name))===context.key);
 if(!subject&&life.self.aliases.some(a=>word(q,a))&&!item)subject={type:'self',key:'mila'};
 if(!subject&&!item&&has(q,/es tu.*kobold|tu es.*kobold|ta race|ton peuple/))subject={type:'self',key:'mila'};
 if(!subject&&item)subject={type:'item',key:String(item.id||norm(item.name))};
 if(!subject&&aboutSelf&&!shopQuestion)subject={type:'self',key:'mila'};
 if(!subject&&has(q,/repos du dragon|repu du dragon|sanctuaire|ile|temple|gite|dormir|loger|heberger|manger ici|soleil|travail.*nuit/))subject={type:'sanctuary',key:'sanctuary'};
 if(!subject&&context&&has(q,/\belle\b|\blui\b|\bil\b|et toi|pourquoi|comment|encore|continue|raconte|anecdote|une autre|son metier|son travail|son age|sa famille|son role|ca consiste|qui ca|\bou\b/))subject={type:context.type,key:context.key};
 if(!subject&&narrativeIntent&&['age','family','romance','likes','dislikes','fear','wish','food','help','origin','routine','feel','craft','duration'].includes(narrativeIntent))subject={type:'self',key:'mila'};
 if(subject?.type==='person'){
  const p=life.people[subject.key];if(!p)return response('clarify','De qui parles-tu exactement ?','clarification');
  const visible=options.visiblePeople;if((Array.isArray(visible)&&!visible.includes(p.id))||(!visible&&['tarak','varnoth'].includes(subject.key)))return response('unknown','Je ne t’ai pas encore présenté cette personne. Laissons-nous le temps de faire connaissance au sanctuaire, ou demande au MJ de nous la présenter.');
  if(has(q,/aile|strige/)&&subject.key==='runara'){if(has(q,/ses ailes|elle.*ailes|ailes.*runara/))return response('person:runara:unknown','Si tu parles de mes ailes, ce sont les striges qui les ont blessées et Runara m’a aidée. Si tu parles d’autre chose à son sujet, je préfère que tu précises.','clarification');return response('person:runara:bond',p.bond);}
  if(has(q,/pense de toi|pense de moi|pense t elle de toi|pense t il de toi/))return response('person:'+subject.key+':bond','Je ne peux pas parler à la place de '+p.name+' sur ses sentiments. De mon côté : '+p.bond);
  const kind=narrativeIntent||'who';
  if(kind==='duration')return response('person:'+subject.key+':bond','Je ne saurais pas te donner une date précise. '+p.bond);
  if(kind==='story'){return response('person:'+subject.key+':story',choose(p.story,history),'anecdote');}
  if(kind==='family'||kind==='romance'||kind==='age'||kind==='origin'||kind==='fear'||kind==='wish'||kind==='food')return response('person:'+subject.key+':private','Pour '+p.name+', je ne connais pas assez ce détail de sa vie privée pour te répondre correctement. Tu peux lui poser la question directement.');
  const slot=kind==='help'?'bond':kind==='routine'?'job':kind==='dislikes'?'opinion':kind;
  if(!p[slot])return response('person:'+subject.key+':clarify','Tu veux savoir ce que '+p.name+' fait au sanctuaire, ou comment je m’entends avec '+(subject.key==='runara'||subject.key==='laylee'||subject.key==='aga'?'elle':'ce compagnon')+' ?','clarification');
  let text=p[slot];const conversational=slot==='opinion'||slot==='bond';if(conversational&&history.length%4===3&&!has(q,/sans anecdote|pas d histoire|juste la reponse/))text+=' '+choose(p.story,history);
  return response('person:'+subject.key+':'+slot,text);
 }
 if(subject?.type==='self'){
  let kind=narrativeIntent||'who';if(has(q,/strige|bless|retabli|retablir/))kind='injury';else if(has(q,/aile/)&&kind==='why')return response('self:clarify','Tu me demandes pourquoi je suis ailée, ou ce qui est arrivé à mes ailes ?','clarification');
  if(kind==='opinion'||kind==='bond')return response('self:clarify','Tu me demandes ce que j’aime, ou ce que je pense de quelqu’un en particulier ?','clarification');
  if(kind==='story')return response('self:story',choose(life.self.story,history),'anecdote');
  if(kind==='where'&&has(q,/avant|origine/))kind='origin';
  if(kind==='duration')return response('self:origin','Je ne te donnerai pas une durée précise que je ne compte plus. Aujourd’hui, le Repos du Dragon est mon foyer.');
  const answers=life.self[kind];if(!answers)return response('self:clarify','Quelle partie de ma vie t’intéresse : mon travail, mon arrivée ici, ou mes habitudes ?','clarification');
  return response('self:'+kind,choose(answers,history));
 }
 if(subject?.type==='item'&&item){
  const prefix='item:'+subject.key+':';const price=Number(item.price_silver),stock=item.stock;
  const wantPrice=has(q,/prix|coute|coutent|combien.*cout|combien.*vends|combien pour|combien cette|combien la|combien une/),wantCount=has(q,/stock|reste|en as|tu as combien|quantite|disponible|dispo|avez vous/);
  if(has(q,/vendre|revendre|rachete|reprend|me paies|me payes|me donnerais|ma dague|mon epee/))return response(prefix+'sale','Pour reprendre '+item.name+', je me fie au prix de revente affiché dans « Vendre mes objets ». Le MJ peut avoir fixé un prix particulier : je ne vais pas le remplacer ici par le tarif d’achat.');
  if(has(q,/gratuit|offre moi|donne moi|cadeau/))return response(prefix+'gift','Pour offrir '+item.name+', il faut un cadeau ou un pack validé dans la boutique par le MJ. Je ne peux pas l’ajouter à ton inventaire simplement parce qu’on en parle.');
  if(wantPrice||wantCount){const parts=[];if(wantPrice)parts.push(Number.isFinite(price)?item.name+' est à '+price+' PA au tarif catalogue.':'Le prix exact est indiqué sur la fiche de '+item.name+'.');if(wantCount)parts.push(stock===null?'Je n’affiche pas de limite de stock pour cet article.':stock===0?'Il n’en reste plus en rayon.':Number.isFinite(Number(stock))?'Il en reste '+stock+' en stock.':'Regarde le stock affiché dans son rayon.');if(wantPrice)parts.push('Ton tarif personnel et les remises sont confirmés dans le panier.');return response(prefix+(wantPrice?'price':'stock'),parts.join(' '));}
  if(has(q,/sert|effet|rend|soigne|utilis|fonctionne|decrit|description|fait quoi/))return response(prefix+'effect',item.description?item.name+' : '+String(item.description):'Je n’ai pas de description précise affichée pour '+item.name+'. Vérifie avec le MJ avant de lui attribuer un effet.');
  return response(prefix+'stock',stock===0?item.name+' est bien au catalogue, mais il n’en reste plus en rayon.':item.name+' est dans mes rayons.'+(Number.isFinite(price)?' Son tarif catalogue est de '+price+' PA.':'')+' Tu peux ouvrir sa fiche pour les détails et l’ajouter au panier.');
 }
 if(subject?.type==='sanctuary'){
  const key=has(q,/dormir|loger|heberger|gite|repas|manger/)?'sleep':has(q,/soleil|nuit|nocturn/)?'night':narrativeIntent==='where'?'where':narrativeIntent==='job'?'job':'who';return response('sanctuary:'+key,life.sanctuary[key]);
 }
 if(has(q,/voler|derober|pickpocket|te vole|t ai vole|je vole/))return response('shop:theft','Je préfère tes mains bien en vue. Une tentative de vol doit passer par l’action prévue, avec ses conséquences et l’arbitrage éventuel du MJ ; le dialogue ne déplace aucun objet.');
 if(has(q,/rabais|remise|reduc|negoci|marchand|moins cher|prix d ami/))return response('shop:bargain','On peut discuter du prix. Ouvre « Négocier » pour une vraie tentative : le bonus de ton personnage et le résultat y sont pris en compte. Si le MJ prend la main, il peut fixer lui-même le tarif.');
 if(has(q,/vendre|revendre|rachete|reprend mes|mes objets|me paies|me payes|me donnerais pour/))return response('shop:sell','Je peux reprendre les objets vendables au prix prévu. Ouvre « Vendre mes objets » : tu y verras ce que je propose avant de confirmer. Si un objet n’a pas de prix, le MJ peut le renseigner.');
 if(has(q,/gratuit|offre moi|donne moi|un cadeau|m offrir|peux.*offrir/))return response('shop:gift','Un cadeau doit être préparé ou validé par le MJ dans la boutique. Je peux en discuter avec toi, mais cette conversation n’ajoute rien à ton inventaire.');
 if(has(q,/piece.*or|piece.*argent|conversion|combien.*pa.*po|combien.*po.*pa/))return response('shop:money','Une pièce d’or vaut dix pièces d’argent, et une pièce d’argent vaut dix pièces de cuivre. Donc 1 PO = 10 PA = 100 PC.');
 if(!subject&&has(q,/besoin.*soin|besoin.*soign|pour.*soigner|pour.*pv|recuperer.*pv|recuperer.*mana|pour.*pm/)){const heal=has(q,/mana|\bpm\b/),choices=catalog.filter(x=>x.stock!==0&&(heal?/mana/i:/soin|guerison/i).test(norm(x.name)));return response('shop:advice',choices.length?'Pour '+(heal?'la mana':'les soins')+', regarde '+choices.slice(0,3).map(x=>x.name).join(', ')+'. Les effets exacts sont dans leurs fiches ; choisis selon ce dont ton personnage a besoin.':'Je n’ai pas de préparation correspondante disponible en rayon actuellement. Je ne vais pas te promettre un flacon qui n’est pas au stock.');}
 if(shopQuestion){const category=has(q,/potion|elixir|antidote|ration|parchemin|fiole/)?'Consommable':has(q,/armure|bouclier/)?'Protection':has(q,/epee|dague/)?'Arme':null;const available=catalog.filter(x=>(!category||x.category===category)&&x.stock!==0);const specific=terms(q).filter(x=>!['faire','avoir','trouve','besoin','quoi','vend','dispo','reste'].includes(x));const related=catalog.filter(x=>terms(x.name).some(t=>specific.includes(t)));if(related.length===1)return response('item:'+String(related[0].id||norm(related[0].name))+':stock',related[0].name+' correspond à ce que tu cherches.'+(related[0].stock===0?' Il n’en reste plus en rayon.':' Regarde sa fiche pour le détail et le stock.'));if(related.length)return response('shop:choose','J’ai plusieurs articles proches : '+related.slice(0,4).map(x=>x.name).join(', ')+'. Lequel t’intéresse ?','clarification');if(specific.length)return response('shop:missing','Je ne trouve pas cet article précis dans mon catalogue actuel. Tu peux me redonner son nom, ou regarder le rayon'+(category?' « '+category+' »':'')+' ; je préfère vérifier plutôt que te promettre quelque chose que je n’ai pas.','clarification');return response('shop:catalog',available.length?'Dans ce rayon, je propose notamment '+available.slice(0,4).map(x=>x.name).join(', ')+'. Ouvre le meuble pour voir les détails et le stock exact.':'Je n’ai pas d’article disponible dans ce rayon actuellement.');}
 if(has(q,/beaux yeux|tu es belle|tu es jolie|je t aime|embrasse|charme|seduire|flirter/))return response('self:flirt',choose(['Merci, je prends le compliment. Mais on peut apprendre à se connaître sans transformer chaque jolie phrase en promesse, tu sais.','Tu sais choisir tes mots. Raconte-moi plutôt quelque chose sur toi : qu’est-ce qui te plaît dans vos voyages ?'],history));
 if(has(q,/idiote|stupide|imbecile|va te faire/))return response('self:boundary','Tu peux me parler franchement sans m’insulter. Si quelque chose te gêne dans ma boutique, explique-le et je te répondrai.');
 if(has(q,/merci|a bientot|au revoir/))return response('bye','Avec plaisir. Reviens quand tu veux discuter, et referme les tiroirs avant de partir.');
 if(has(q,/bonjour|salut|coucou|bonsoir/))return response('hello',choose(['Bonjour ! Je pose mes outils. Qu’est-ce que tu voudrais savoir ?','Entre donc. Tu cherches quelque chose, ou tu viens me tenir compagnie ?'],history));
 if(has(q,/^oui$|^non$|d accord|je vois/))return response('clarify','Je t’écoute. Qu’est-ce que tu voudrais savoir de plus ?','clarification');
 return response('clarify','Je ne suis pas sûre d’avoir compris ta question. Tu peux préciser de qui ou de quel objet tu parles, et ce que tu voudrais savoir ?','clarification');
}
root.BastideMilaDialogue={reply,normalize:norm};
})(globalThis);
