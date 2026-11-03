const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const bridge=fs.readFileSync(__dirname+'/../bridge.js','utf8');const ctx={};vm.createContext(ctx);vm.runInContext(bridge.slice(bridge.indexOf('function startingProtection('),bridge.indexOf('function attackValues(')),ctx);
const hero={stats:{CHA:3},equipment:['Chemise de mailles','Petit bouclier'],combat:{def:17,init:10,contact:3,distance:5,magic:4},paths:[]};
assert.equal(ctx.combatNow(hero,[]).def,17);
const inv=[{quantity:1,equipped:false,equipment:{slot:'armor',bonuses:{armorDef:4}}},{quantity:1,equipped:true,equipment:{slot:'shield',bonuses:{shieldDef:2,initiative:2,magic:1}}}];
const c=ctx.combatNow(hero,inv);assert.equal(c.def,14);assert.equal(c.init,12);assert.equal(c.magic,5);assert.equal(hero.combat.def,17);
inv[0].equipped=true;assert.equal(ctx.combatNow(hero,inv).def,18);
console.log('PASS mêmes calculs hub : armure remplacée/retirée, bouclier, attaque magique, initiative, aucune mutation fiche source.');
