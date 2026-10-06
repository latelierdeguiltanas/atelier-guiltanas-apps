window.BASTIDE_CHARACTER={
schema:'bastide-character-v2',id:'prepotante',name:'Prépôtante',status:'BASTIDE_PLAYER_CHARACTER',source:'Export Forge of Heroes - 29 septembre 2026',level:1,people:'Gobelin',family:'Aventurier',profile:'Voleur',heroicIdeal:'',flaw:'',
stats:{AGI:3,CON:1,FOR:1,PER:2,CHA:-2,INT:0,VOL:2},
combat:{speedMeters:10,pvMax:9,pcMax:1,pmMax:0,recoveryDie:'D8',recoveryMax:3,init:15,def:16,contact:2,distance:4,magic:3,silver:0},
attacks:[
{id:'rapiere',name:'Rapière',type:'Contact',attack:2,damage:'1d6+1',range:'Contact',special:''},
{id:'dague-contact',name:'Dague',type:'Contact',attack:2,damage:'1d4+1',range:'Contact',special:''},
{id:'dague-distance',name:'Dague',type:'Distance',attack:4,damage:'1d4',range:'5 m',special:''}
],
equipment:['Rapière','5 dagues','Armure de cuir simple'],
paths:[
{name:'Voie du peuple - Gobelin',ranks:[
{rank:1,owned:true,name:'Rapide comme son ombre',text:'+3 aux tests de discrétion et +3 en Initiative.'},
{rank:2,owned:false,name:'Jeune worg',text:'Permet de dresser et chevaucher un jeune worg, de le déplacer ou de lui ordonner d’attaquer.'},
{rank:3,owned:false,name:'Miam',text:'+5 pour résister aux poisons et toxines ingérés ; morsure à 1d4 + FOR DM.'},
{rank:4,owned:false,name:'Grand worg',text:'Le worg devient plus puissant et peut attaquer gratuitement une fois par tour.'},
{rank:5,owned:false,name:'Vif et alerte',text:'+2 en AGI et +2 en CON.'}
]},
{name:'Voie de l’assassin',ranks:[
{rank:1,owned:true,name:'Discrétion',text:'+3 aux tests de discrétion, déguisement ou dissimulation d’arme ; argotien et dé bonus contre un adversaire surpris.'},
{rank:2,owned:false,name:'Attaque sournoise (L)',text:'Une fois par round, +2d4° DM contre un adversaire surpris ou de dos avec une arme légère.'},
{rank:3,owned:false,name:'Attaque par surprise (A)',text:'Contre un adversaire surpris, attaque sournoise en action d’attaque et +2d4° DM.'},
{rank:4,owned:false,name:'Disparition (M)',text:'Une fois par combat, disparaît jusqu’au prochain tour puis réapparaît à 20 m maximum.'},
{rank:5,owned:false,name:'Ouverture mortelle (L)',text:'Une fois par combat, réussite critique automatique avec attaque sournoise.'}
]},
{name:'Voie de l’aventurier',ranks:[
{rank:1,owned:true,name:'Baratin',text:'+3 pour baratiner, séduire, négocier, mentir ou trouver au marché noir ; permet d’utiliser parchemins et baguettes sur test d’attaque magique.'},
{rank:2,owned:false,name:'Provocation (L)',text:'Test opposé de CHA contre INT pour forcer un humanoïde à attaquer.'},
{rank:3,owned:false,name:'Souplesse du félin',text:'+2 en DEF et Initiative ; se relever ne demande qu’une action de mouvement.'},
{rank:4,owned:false,name:'Charisme héroïque',text:'+1 en CHA et dé bonus aux tests de CHA.'},
{rank:5,owned:false,name:'Attaque paralysante (L)',text:'Une fois par combat, peut immobiliser ou paralyser un humanoïde au contact.'}
]},
{name:'Voie du déplacement',ranks:[
{rank:1,owned:false,name:'Agile',text:'+3 aux tests liés au déplacement ; +1 en DEF et Initiative.'},
{rank:2,owned:false,name:'Réflexes félins',text:'Divise les DM de chute par deux et accorde une action de mouvement supplémentaire une fois par combat.'},
{rank:3,owned:false,name:'Acrobaties (G)',text:'Test d’AGI difficulté 15 pour franchir un obstacle ou attaquer de dos.'},
{rank:4,owned:false,name:'Agilité héroïque',text:'+1 en AGI et dé bonus aux tests d’AGI.'},
{rank:5,owned:false,name:'Esquive de la magie (G)',text:'Test d’attaque à distance opposé pour échapper à un sort infligeant des DM physiques.'}
]},
{name:'Voie du roublard',ranks:[
{rank:1,owned:false,name:'Doigts agiles',text:'+3 aux tests de précision manuelle et d’estimation ; +1 DM avec dagues et couteaux lancés.'},
{rank:2,owned:false,name:'Aux aguets',text:'+4 pour fouiller, détecter pièges, passages secrets ou embuscades ; DM des pièges divisés par deux.'},
{rank:3,owned:false,name:'Feindre la mort (G)',text:'Une fois par combat, feint la mort puis récupère 1d4° PV en se relevant.'},
{rank:4,owned:false,name:'Expert en criminalité',text:'Dé bonus aux recherches d’indices et possibilité de dépenser 1 PC pour obtenir un indice manqué.'},
{rank:5,owned:false,name:'Maître du poison',text:'Prépare trois doses de poison par jour.'}
]},
{name:'Voie du spadassin',ranks:[
{rank:1,owned:false,name:'Attaque en finesse',text:'Ajoute l’AGI à l’Initiative et remplace la FOR par l’AGI pour attaquer avec une arme légère.'},
{rank:2,owned:false,name:'Esquive fatale (G)',text:'Une fois par combat, détourne une attaque vers un autre adversaire au contact.'},
{rank:3,owned:false,name:'Frappe chirurgicale',text:'Améliore de 2 la plage de critique avec une arme légère.'},
{rank:4,owned:false,name:'Ambidextrie (G)',text:'Une attaque gratuite par round avec une dague ou une épée courte.'},
{rank:5,owned:false,name:'Botte secrète',text:'Sur critique, inflige un état préjudiciable ou transforme l’attaque en attaque sournoise.'}
]}
]};
