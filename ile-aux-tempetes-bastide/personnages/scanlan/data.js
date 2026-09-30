window.BASTIDE_CHARACTER={
schema:'bastide-character-v2',id:'scanlan',name:'Scanlan',status:'BASTIDE_PLAYER_CHARACTER',source:'Export Forge of Heroes - 29 septembre 2026',level:1,people:'Halfelin',family:'Aventurier',profile:'Barde',heroicIdeal:'',flaw:'',
stats:{AGI:1,CON:1,FOR:-2,PER:0,CHA:3,INT:0,VOL:2},
combat:{pvMax:9,pcMax:6,pmMax:4,recoveryDie:'D8',recoveryMax:3,init:10,def:14,contact:-1,distance:2,magic:3,silver:0},
attacks:[
{id:'rapiere',name:'Rapière',type:'Contact',attack:-1,damage:'1d6-2',range:'Contact',special:''},
{id:'dague-contact',name:'Dague',type:'Contact',attack:-1,damage:'1d4-2',range:'Contact',special:''},
{id:'dague-distance',name:'Dague',type:'Distance',attack:2,damage:'1d4',range:'5 m',special:''}
],
equipment:['Rapière','Dague'],
paths:[
{name:'Voie du peuple - Halfelin',ranks:[
{rank:1,owned:true,name:'Petite taille',text:'+1 en DEF et +3 aux tests de discrétion et de subtilisation. Restrictions sur les armes lourdes.'},
{rank:2,owned:false,name:'Résistance légendaire',text:'Bonus égal au rang aux tests opposés d’attaque magique pour résister à un sort.'},
{rank:3,owned:false,name:'Bon pour le moral',text:'Un bon repas permet de récupérer 1d4 PV, jusqu’à quatre fois par jour.'},
{rank:4,owned:false,name:'Petit veinard',text:'+1 PC et esquive d’une attaque choisie par combat, hors critique.'},
{rank:5,owned:false,name:'Vif et bien nourri',text:'+1 en AGI et +1 en CON.'}
]},
{name:'Voie de la séduction',ranks:[
{rank:1,owned:true,name:'Charmant',text:'+3 pour séduire, convaincre, mentir ou baratiner ; 1 PC peut améliorer l’action d’un compagnon de 1d4° + CHA.'},
{rank:2,owned:true,name:'Dentelles et rapière',text:'Sans armure, ajoute le CHA à la DEF, dans la limite du rang atteint dans la voie.'},
{rank:3,owned:false,name:'Baratineur de génie',text:'Après 10 minutes, peut dépenser 1 PC pour charmer un humanoïde de niveau 1 ou moins.'},
{rank:4,owned:false,name:'Charisme héroïque',text:'+1 en CHA, dé bonus aux tests de CHA et possibilité d’utiliser CHA pour calculer les PM.'},
{rank:5,owned:false,name:'Suggestion (A)*',text:'Test opposé d’attaque magique pour suggérer une action à une créature.'}
]},
{name:'Voie du musicien',ranks:[
{rank:1,owned:true,name:'Chant des héros (L)*',text:'Pour 1 PM, le barde et ses alliés à portée de voix gagnent +1 à tous leurs tests pendant CHA minutes ; +3 pour jouer ou chanter.'},
{rank:2,owned:true,name:'Chant de réconfort (L)*',text:'Pendant une récupération rapide, le barde et ses alliés à 10 m récupèrent 1d4° PV.'},
{rank:3,owned:false,name:'Attaque sonore (A)*',text:'Inflige 2d4° + CHA DM dans un cône de 10 m ; test de CON pour diviser les DM par deux.'},
{rank:4,owned:false,name:'Zone de silence (A)*',text:'Crée une zone de silence de 5 m de diamètre à 30 m pendant CHA minutes.'},
{rank:5,owned:false,name:'Danse irrésistible (A)*',text:'Test opposé d’attaque magique : la cible danse, subit un dé malus aux attaques et -5 en DEF.'}
]},
{name:'Voie de l’escrime',ranks:[
{rank:1,owned:false,name:'Précision',text:'Remplace la FOR par l’AGI pour les attaques au contact avec une arme légère.'},
{rank:2,owned:false,name:'Feinte (L)',text:'Test opposé de CHA contre PER donnant un bonus d’attaque et +2d4° DM au round suivant.'},
{rank:3,owned:false,name:'Intelligence du combat (M)',text:'Une fois par combat, peut désarmer, renverser ou aveugler un adversaire de NC inférieur.'},
{rank:4,owned:false,name:'Attaque flamboyante (L)',text:'Attaque avec une arme légère, avec bonus d’attaque et de DM égal au CHA.'},
{rank:5,owned:false,name:'Botte mortelle',text:'+2d4° DM si le résultat d’attaque dépasse la DEF adverse d’au moins 10.'}
]},
{name:'Voie du saltimbanque',ranks:[
{rank:1,owned:false,name:'Acrobate',text:'+3 aux tests d’acrobaties, équilibre, saut et escalade.'},
{rank:2,owned:false,name:'Grâce féline',text:'Ajoute le CHA à l’Initiative et +1 en DEF ; +4 aux tests de danse, mime ou jonglerie.'},
{rank:3,owned:false,name:'Lanceur de couteau (G)',text:'Une fois par round, lance gratuitement un couteau à 10 m pour 1d4 + AGI DM.'},
{rank:4,owned:false,name:'Liberté d’action',text:'Immunité à la peur, aux sorts d’asservissement et aux états ralenti et immobilisé.'},
{rank:5,owned:false,name:'Esquive acrobatique (G)',text:'Test d’attaque à distance opposé pour esquiver une attaque une fois par round.'}
]},
{name:'Voie du vagabond',ranks:[
{rank:1,owned:false,name:'Rumeurs et légendes',text:'+3 aux tests d’INT liés à la culture générale et à l’identification d’objets magiques.'},
{rank:2,owned:false,name:'Éclectique',text:'+1 à tous les tests de compétence, non cumulable sauf avec la voie de peuple.'},
{rank:3,owned:false,name:'Attirail',text:'Pour 1 PC, sort un objet improbable d’une valeur maximale de 10 pa.'},
{rank:4,owned:false,name:'Compréhension des langues (A)*',text:'Permet de lire, écrire et parler une langue vivante étrangère.'},
{rank:5,owned:false,name:'Déguisement (A)*',text:'Prend l’apparence d’un humanoïde de taille voisine pendant CHA heures.'}
]}
]};
