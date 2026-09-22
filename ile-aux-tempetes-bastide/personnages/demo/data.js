window.BASTIDE_CHARACTER={
schema:'bastide-character-v2',id:'wilibert',name:'Wilibert Sûreté',status:'OFFICIAL_PREGEN_REFERENCE',source:'COF2 - Prétirés iconiques BBE 2024',level:1,people:'Gnome',family:'Aventurier',profile:'Voleur',heroicIdeal:'',flaw:'',
stats:{AGI:2,CON:1,FOR:0,PER:2,CHA:2,INT:0,VOL:0},
combat:{pvMax:9,pcMax:5,pmMax:1,recoveryDie:'D8',recoveryMax:3,init:12,def:14,contact:1,distance:3,magic:1,silver:7},
attacks:[
{id:'epee-courte',name:'Épée courte',type:'Contact',attack:1,damage:'1d6',range:'Contact',special:''},
{id:'couteaux',name:'Couteaux de lancer',type:'Distance',attack:3,damage:'1d4+1',range:'10 m',special:'+1 DM grâce à Doigts agiles'}
],
equipment:['Armure de cuir','Sac à dos','Couteaux de lancer','Épée courte','Briquet à silex','Couverture','Gamelle','Outre','Torche','Bourse de 7 pa'],
paths:[
{name:'Voie du peuple - Gnome',ranks:[
{rank:1,owned:true,name:'Don étrange',text:'+3 à tous les tests en sciences, sciences occultes incluses. Le noir total est considéré comme de la pénombre jusqu’à 10 m. Donne aussi accès à Mirage.'},
{rank:2,owned:false,name:'Petit pote',text:'+3 aux tests d’interaction sociale, sauf pour intimider, et +1 PC.'},
{rank:3,owned:false,name:'Insignifiant',text:'+2 en DEF contre les créatures de taille grande ou supérieure (+3 au rang 5).'},
{rank:4,owned:false,name:'Merveille technologique',text:'Utilisation des arbalètes et armes à poudre quel que soit le profil ; ajoute l’AGI aux DM.'},
{rank:5,owned:false,name:'Bonne nature',text:'+1 en CON et +1 en CHA.'}
]},
{name:'Voie de l’assassin',ranks:[
{rank:1,owned:true,name:'Discrétion',text:'Rang +2 aux tests de discrétion ou de déguisement. Dé bonus en attaque contre un adversaire surpris et connaissance de l’argotien.'},
{rank:2,owned:false,name:'Attaque sournoise (L)',text:'Une fois par round, attaque un adversaire surpris ou de dos et inflige +2d4 DM.'},
{rank:3,owned:false,name:'Attaque par surprise',text:'Contre un adversaire surpris, attaque sournoise par une action d’attaque et +2d4 DM.'},
{rank:4,owned:false,name:'Disparition (M)',text:'Une fois par combat, disparaît puis réapparaît à 20 m maximum.'},
{rank:5,owned:false,name:'Ouverture mortelle (L)',text:'Une fois par combat, réussite critique automatique avec attaque sournoise.'}
]},
{name:'Voie de l’aventurier',ranks:[
{rank:1,owned:false,name:'Baratin',text:'Rang +2 pour baratiner, séduire, négocier ou mentir. Permet d’utiliser les parchemins magiques.'},
{rank:2,owned:false,name:'Provocation (L)',text:'Test opposé de CHA contre INT pour forcer un humanoïde à attaquer.'},
{rank:3,owned:false,name:'Souplesse du félin',text:'+2 en DEF et en Init. Se relever ne demande qu’une action de mouvement.'},
{rank:4,owned:false,name:'Charisme héroïque',text:'+1 en CHA et dé bonus aux tests de CHA.'},
{rank:5,owned:false,name:'Attaque paralysante (L)',text:'Une fois par combat, attaque pouvant immobiliser ou paralyser.'}
]},
{name:'Voie du déplacement',ranks:[
{rank:1,owned:false,name:'Agile',text:'Rang +2 aux tests liés aux déplacements, +1 en DEF et en Init.'},
{rank:2,owned:false,name:'Réflexes félins',text:'Divise par deux les DM de chute et accorde une action de mouvement supplémentaire une fois par combat.'},
{rank:3,owned:false,name:'Acrobaties (G)',text:'Test d’AGI pour franchir un obstacle ou attaquer de dos.'},
{rank:4,owned:false,name:'Agilité héroïque',text:'+1 en AGI et dé bonus aux tests d’AGI.'},
{rank:5,owned:false,name:'Esquive de la magie (G)',text:'Test d’attaque à distance opposé pour éviter les DM d’un sort.'}
]},
{name:'Voie du roublard',ranks:[
{rank:1,owned:true,name:'Doigts agiles',text:'Rang +2 pour crocheter, désamorcer, pickpocketter… +1 DM avec les armes de jet.'},
{rank:2,owned:false,name:'Aux aguets',text:'Rang +2 pour détecter pièges, passages secrets et embuscades ; divise par deux les DM des pièges.'},
{rank:3,owned:false,name:'Feindre la mort (G)',text:'Une fois par combat, feint la mort après une blessure puis peut récupérer 1d4 PV.'},
{rank:4,owned:false,name:'Expert en criminalité',text:'Dé bonus aux tests d’enquête criminelle ; peut dépenser 1 PC pour obtenir un indice.'},
{rank:5,owned:false,name:'Maître du poison',text:'Prépare trois doses de poison par jour.'}
]},
{name:'Voie du spadassin',ranks:[
{rank:1,owned:false,name:'Attaque en finesse',text:'Ajoute l’AGI en Init et remplace la FOR par l’AGI en attaque au contact avec une arme légère.'},
{rank:2,owned:false,name:'Esquive fatale (G)',text:'Une fois par combat, détourne une attaque vers un autre adversaire au contact.'},
{rank:3,owned:false,name:'Frappe chirurgicale',text:'Réduit de 2 la valeur nécessaire pour obtenir un critique avec une arme légère.'},
{rank:4,owned:false,name:'Ambidextrie (G)',text:'Une attaque au contact gratuite par round avec une dague ou une épée courte.'},
{rank:5,owned:false,name:'Botte secrète',text:'Sur critique, permet d’infliger un état temporaire ou une attaque sournoise.'}
]}
]};
