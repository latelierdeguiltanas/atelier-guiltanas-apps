'use strict';

const pathIds={brute:'voie-de-la-brute',pagne:'voie-du-pagne',pourfendeur:'voie-du-pourfendeur',primitif:'voie-du-primitif',rage:'voie-de-la-rage'};
const peoples=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'];
const ages=['young','very-young','mature','venerable'];
const paths=Object.keys(pathIds);
const expandedJobs=peoples.flatMap((people,peopleIndex)=>ages.map((age,ageIndex)=>({
 people,age,optionIndex:ageIndex,
 ...(age==='very-young'?{resource:peopleIndex%2?'DR':'PC'}:{}),
 primary:paths[(peopleIndex+ageIndex)%paths.length],
 secondary:paths[(peopleIndex+ageIndex+1)%paths.length],
 defense:'AGI',stats:[2,1,0,1,3,0,-1]
})));
module.exports={expandedJobs,pathIds};
