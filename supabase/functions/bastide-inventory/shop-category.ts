export function shopCategory(name:string,requested:unknown){
 const explicit=String(requested||'').trim();if(explicit&&!['auto','automatique'].includes(explicit.toLowerCase()))return explicit;
 const n=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/potion|elixir|antidote|onguent|baume|parchemin|ration|consommable|remede|fiole/.test(n))return 'Consommable';
 if(/armure|bouclier|casque|cotte|heaume|protection/.test(n))return 'Protection';
 if(/epee|rapiere|dague|arbalete|\barc\b|hache|lance|masse|marteau de guerre|petoire|mousquet/.test(n))return 'Arme';
 return 'Équipement';
}
