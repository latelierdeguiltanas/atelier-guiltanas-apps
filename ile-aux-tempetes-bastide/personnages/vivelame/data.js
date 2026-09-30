window.BASTIDE_CHARACTER={
schema:'bastide-character-v2',id:'vivelame',name:'Vivelame',status:'BASTIDE_PLAYER_CHARACTER',source:'Export Forge of Heroes - 30 septembre 2026',level:1,people:'Âme-forgée',family:'Aventurier',profile:'Arquebusier',age:'Vénérable',heroicIdeal:'',flaw:'',
stats:{AGI:2,CON:1,FOR:0,PER:0,CHA:-2,INT:3,VOL:0},
combat:{pvMax:9,pcMax:1,pmMax:0,recoveryDie:'D8',recoveryMax:3,init:10,def:16,contact:1,distance:3,magic:1,silver:0},
attacks:[
{id:'petoire',name:'Pétoire',type:'Distance',attack:3,damage:'1d10',range:'20 m',special:''},
{id:'epee-longue',name:'Épée longue',type:'Contact',attack:1,damage:'1d8',range:'Contact',special:''},
{id:'dague-contact',name:'Dague',type:'Contact',attack:1,damage:'1d4',range:'Contact',special:''}
],
equipment:['Pétoire','Épée longue','Dague','Cuir renforcé / broigne'],
paths:[
{name:'Voie du peuple - Âme-forgée',ranks:[
{rank:1,owned:true,name:'Main lourde',text:'À mains nues, l’âme-forgée inflige 1d6 DM létaux.'},
{rank:2,owned:true,name:'Choc électrique (L)',text:'Sur une attaque à mains nues réussie, inflige 1d6 DM d’électricité par rang, dégâts de l’attaque inclus.'},
{rank:3,owned:false,name:'Camouflage',text:'Une fois par jour, prend l’apparence générique d’un humain pendant une heure.'},
{rank:4,owned:false,name:'Forgé dans la bataille',text:'Une fois par combat, ignore totalement les dégâts d’une attaque.'},
{rank:5,owned:false,name:'Machine de guerre',text:'+2 en CON et +2 en FOR.'}
]},
{name:'Voie du pistolero',ranks:[
{rank:1,owned:true,name:'Plus vite que son ombre',text:'Avec une arme à poudre chargée en main, peut tirer avec +5 en Initiative et sans dé malus au contact.'},
{rank:2,owned:true,name:'Ajuster le tir',text:'Après une attaque à distance ratée, +5 au prochain tir contre la même cible avant la fin du round suivant.'},
{rank:3,owned:false,name:'Tir double (L)',text:'Tire avec une pétoire dans chaque main ; -2 par attaque, sans malus si les deux tirs visent la même cible.'},
{rank:4,owned:false,name:'Agilité héroïque',text:'+1 en AGI et dé bonus aux tests d’AGI.'},
{rank:5,owned:false,name:'As de la gâchette',text:'+2d4° DM si le résultat d’attaque dépasse la DEF adverse d’au moins 10.'}
]},
{name:'Voie des montagnes',ranks:[
{rank:1,owned:true,name:'Habitant des montagnes',text:'+3 aux tests de discrétion et de survie en montagne.'},
{rank:2,owned:true,name:'Grimpeur',text:'+3 aux tests d’escalade et dégâts de chute divisés par deux.'},
{rank:3,owned:false,name:'Résistance au froid',text:'RD 3 contre les DM de froid.'},
{rank:4,owned:false,name:'Terrain de prédilection',text:'+2 en attaque et en DEF sur une forte déclivité ou dans un escalier.'},
{rank:5,owned:false,name:'Danger des montagnes',text:'+2 en DEF contre les géants et +1d4° aux DM contre eux.'}
]},
{name:'Voie du nomade',ranks:[
{rank:1,owned:true,name:'Sens de l’orientation',text:'+3 pour s’orienter et prédire la météo des prochaines 24 heures.'},
{rank:2,owned:true,name:'Voyageur',text:'+3 aux tests de récupération à la belle étoile et aux tests de survie liés aux événements de voyage.'},
{rank:3,owned:false,name:'Chasseur-cueilleur',text:'Peut se nourrir en voyageant normalement et nourrir une personne supplémentaire sur un test de survie.'},
{rank:4,owned:false,name:'Je suis déjà venu',text:'Dépense 1 DR ou 1 PC pour connaître une localité, un contact fiable et améliorer la disponibilité commerciale.'},
{rank:5,owned:false,name:'Attentif',text:'+1 en PER.'}
]}
]};
