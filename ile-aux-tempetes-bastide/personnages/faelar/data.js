window.BASTIDE_CHARACTER={
schema:'bastide-character-v2',id:'faelar',name:'Faëlar',status:'BASTIDE_PLAYER_CHARACTER',source:'Rapport Forge of Heroes FIX135 - 3 octobre 2026',level:1,people:'Elfe sylvain',family:'Aventurier',profile:'Rôdeur',age:'Jeune',heroicIdeal:'',flaw:'',
stats:{FOR:1,AGI:1,CON:2,PER:3,INT:1,VOL:0,CHA:-1},
combat:{speedMeters:10,pvMax:10,pcMax:2,pmMax:0,recoveryDie:'D8',recoveryMax:4,init:14,def:14,contact:2,distance:2,magic:1,silver:0},
traits:['Lumière des étoiles — capacité de peuple acquise au rang 1','Instinct de chasse — Zombies : après le combat de la plage, Faëlar a compris que les armes tranchantes percent leur résistance ; les autres dégâts physiques ont été réduits de moitié.'],
attacks:[],
equipment:[
{id:'epee-longue',name:'Épée longue',base:'Épée longue',category:'Arme',quantity:1,equipped:false,notes:'Attaque au contact : +2 · 1d8+1 DM.',equipment:{slot:'main_hand',effect:'Arme de contact.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d8',damageStat:'FOR',damageType:'tranchant',range:'Contact',attackBonus:0,damageBonus:0}]}}},
{id:'arc-court',name:'Arc court',base:'Arc court',category:'Arme',quantity:1,equipped:true,notes:'Attaque à distance : +2 · 1d6+3 DM · portée 30 m.',equipment:{slot:'main_hand',effect:'Arme à distance à deux mains.',weapon:{modes:[{label:'Distance',attackType:'distance',damage:'1d6',damageStat:'PER',damageType:'perforant',range:'30 m',attackBonus:0,damageBonus:0}]}}},
{id:'dague',name:'Dague',base:'Dague',category:'Arme',quantity:1,equipped:false,notes:'Contact : +2 · 1d4+1 DM. Lancer : +2 · 1d4 DM · portée 5 m.',equipment:{slot:'main_hand',effect:'Arme légère utilisable au contact ou au lancer.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d4',damageStat:'FOR',damageType:'perforant',range:'Contact',attackBonus:0,damageBonus:0},{label:'Distance',attackType:'distance',damage:'1d4',damageType:'perforant',range:'5 m',attackBonus:0,damageBonus:0}]}}},
{id:'cuir-renforce',name:'Cuir renforcé / broigne',base:'Cuir renforcé, broigne',category:'Protection',quantity:1,equipped:true,notes:'Armure portée à la création.',equipment:{slot:'armor',effect:'Armure équipée : valeur d’armure 3.',bonuses:{armorDef:3}}}
],
paths:[
{name:'Voie de l’elfe sylvain',ranks:[
{rank:1,owned:true,name:'Lumière des étoiles',text:'Capacité de peuple acquise au rang 1. Le rapport Forge fourni ne détaille pas son effet.'}
]},
{name:'Voie de l’archer',ranks:[
{rank:1,owned:true,name:'Archer émérite',text:'Capacité de rôdeur acquise au rang 1. Ses effets sont déjà intégrés aux valeurs finales de la fiche et de l’arc court.'}
]},
{name:'Voie du compagnon animal',ranks:[
{rank:1,owned:true,name:'Le loup',text:'Faëlar dispose d’un loup comme compagnon animal. Le rapport Forge fourni ne contient pas sa fiche technique détaillée.'}
]}
]};
