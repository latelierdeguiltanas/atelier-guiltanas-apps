'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm'),root=path.resolve(__dirname,'..'),write=process.argv.includes('--write');
const bonuses={
 'ability:history:courtier:r2':['informations secrètes ou sensibles','perception auditive'],
 'ability:history:courtier:r3':['perception visuelle','percer un mensonge','décoder le langage corporel'],
 'ability:history:scholar:r2':['CHA pour convaincre']
};
const moduleText=fs.readFileSync(root+'/ENGINE/history_context_n1.js','utf8'),uiText=fs.readFileSync(root+'/ENGINE/history_context_ui_n1.js','utf8');
for(const file of ['index.html','progression/pdf-labels.json']){
 const fp=path.join(root,file),before=fs.readFileSync(fp,'utf8'),embedded=file.endsWith('.html'),m=embedded?before.match(/(<script[^>]*id="FOH_DB_JSON"[^>]*>)([\s\S]*?)(<\/script>)/):null,db=JSON.parse(embedded?m[2]:before),T=db.tables||db;
 for(const[id,tests]of Object.entries(bonuses)){const a=T.history_abilities.find(a=>a.id===id);assert(a);a.mechanics={...a.mechanics,effects:[{type:'rank_bonus',valueFormula:'rank+2',tests,domains:tests}]};}
 let after=embedded?before.replace(m[0],()=>m[1]+JSON.stringify(db)+m[3]):JSON.stringify(db,null,2)+'\n';
 if(embedded){const scripts='<script id="FOH_HISTORY_CONTEXT_N1">\n'+moduleText+'\n</script>\n<script id="FOH_HISTORY_CONTEXT_UI_N1">\n'+uiText+'\n</script>\n';const existing=/<script id="FOH_HISTORY_CONTEXT_N1">[\s\S]*?<script id="FOH_HISTORY_CONTEXT_UI_N1">[\s\S]*?<\/script>\n/;after=after.replace(existing,'');const end=after.lastIndexOf('</body>');assert(end>=0);after=after.slice(0,end)+scripts+after.slice(end);for(const match of after.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(/application\/(?:ld\+)?json|src=/.test(match[1]))continue;new vm.Script(match[2],{filename:file+':'+match[1]});}}
 if(write)fs.writeFileSync(fp,after);else assert.equal(crypto.createHash('sha256').update(after).digest('hex'),crypto.createHash('sha256').update(before).digest('hex'),'Apply --write first');
 console.log(file+' '+crypto.createHash('sha256').update(after).digest('hex'));
}
