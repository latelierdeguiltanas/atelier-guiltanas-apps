window.BASTIDE_CHARACTER={
schema:'bastide-character-v2',id:'zepheline',name:'Zepheline',status:'BASTIDE_PLAYER_CHARACTER',source:'Export Forge of Heroes - 30 septembre 2026',level:1,people:'Fée',family:'',profile:'Ensorceleur',age:'Vénérable',heroicIdeal:'',flaw:'',
stats:{AGI:1,CON:-2,FOR:-2,PER:0,CHA:2,INT:2,VOL:3},
combat:{pvMax:4,pcMax:4,pmMax:8,recoveryDie:'D6',recoveryMax:0,init:12,def:14,contact:-1,distance:2,magic:4,silver:0},
traits:['Vision dans le noir à 30 m','Vol : 10 m par action ; doit rester en mouvement et chute si elle est immobilisée ou incapable d’agir','+3 aux tests de discrétion','+1 en DEF','FOR maximale : -1','Armes limitées au d4','Armure légère ajustée uniquement','Aucun bouclier en vol'],
attacks:[
{id:'sous-tension',name:'Sous tension (M)*',type:'Magique',attack:4,damage:'1d4+CHA',range:'10 m',special:'Pendant CHA minutes : 1d4° DM à qui la blesse ou la touche au contact'}
],
equipment:[{id:'arc-feerique',name:'Arc féerique',base:'Arc adapté à une Fée',category:'Arme',quantity:1,equipped:true,equipment:{slot:'main_hand',effect:'Arc adapté à sa taille.',weapon:{modes:[{label:'Distance',attackType:'distance',damage:'1d4',damageType:'perforant',range:'30 m',attackBonus:0,damageBonus:0}]}}}],
paths:[
{name:'Voie du peuple - Être féerique',ranks:[
{rank:1,owned:true,name:'Langage des animaux',text:'Comprend et parle aux animaux ; +3 pour les comprendre, les calmer ou communiquer avec eux.'},
{rank:2,owned:true,name:'Invisibilité (L)',text:'Se rend invisible une fois par jour par rang atteint dans la voie.'},
{rank:3,owned:false,name:'Monture féerique',text:'Apprivoise une monture féerique terrestre ou volante.'},
{rank:4,owned:false,name:'Grande taille (L)',text:'Prend une taille humaine trois fois par jour et gagne +2 en FOR sous cette forme.'},
{rank:5,owned:false,name:'Seigneur féerique',text:'+2 en PER et +2 en CHA.'}
]},
{name:'Voie de l’air',ranks:[
{rank:1,owned:true,name:'Murmures dans le vent (G)*',text:'Envoie dix mots à CHA × 100 m et reçoit une réponse immédiate ; +1 permanent en Initiative et DEF.'},
{rank:2,owned:true,name:'Sous tension (M)*',text:'Pendant CHA minutes, inflige 1d4° DM à qui la touche au contact ; décharge à 10 m pour 1d4° + CHA DM.'},
{rank:3,owned:true,name:'Télékinésie (A)*',text:'Pendant CHA minutes, déplace à 20 m jusqu’à 150 kg à raison de 5 m par action de mouvement.'}
]},
{name:'Voie de la divination',ranks:[
{rank:1,owned:true,name:'Divination (L)*',text:'Obtient des informations publiques sur une créature ; +1 permanent en Initiative et DEF.'},
{rank:2,owned:true,name:'Détection de l’invisible (L)*',text:'Pendant CHA minutes, détecte les créatures invisibles ou cachées à moins de 20 m et la clairvoyance.'}
]},
{name:'Voie de l’envoûteur',ranks:[
{rank:1,owned:false,name:'Injonction (A)*',text:'Donne un ordre simple pour le prochain tour sur un test opposé d’attaque magique ; +3 en persuasion et séduction.'},
{rank:2,owned:false,name:'Sommeil (L)*',text:'Une fois par combat, endort les créatures admissibles dans une zone de 10 m à 20 m.'}
]},
{name:'Voie des illusions',ranks:[
{rank:1,owned:false,name:'Mirage (L)*',text:'Crée une illusion visuelle et sonore immobile ; +3 aux tests de supercherie et de mensonge.'},
{rank:2,owned:false,name:'Image décalée (M)*',text:'Pendant 1d4 + CHA rounds, une attaque réussie n’inflige aucun DM sur 5-6 au d6.'}
]},
{name:'Voie de l’invocation',ranks:[
{rank:1,owned:false,name:'Choc (A)*',text:'Attaque magique à 20 m infligeant 1d4° + CHA DM et pouvant renverser une cible faible.'},
{rank:2,owned:false,name:'Serviteur invisible (L)*',text:'Pendant CHA minutes, une force invisible accomplit des tâches simples à 20 m.'}
]}
]};
