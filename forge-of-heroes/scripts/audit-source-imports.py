"""Read-only comparison with supplied PDFs; no source file is changed."""
import json,re,unicodedata,argparse,hashlib
from pathlib import Path
import fitz
arg=argparse.ArgumentParser();arg.add_argument('sources',type=Path);arg.add_argument('--output',type=Path,default=Path('/tmp/forge-source-import-audit.json'));a=arg.parse_args();root=Path(__file__).resolve().parents[1]
def norm(s):
 s=re.sub(r'(?<=[a-zà-ÿ])[‑\-\xad]\s*\n\s*(?=[a-zà-ÿ])','',s)
 s=re.sub(r'\bW\s+W\s*','',s);s=re.sub(r'\([SVI]\)','',s)
 s=re.sub(r'[−‑–-]\s*(?=\d)','NEG',s);s=re.sub(r'\+\s*(?=\d)','POS',s)
 return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
def db(name):return json.loads(re.search(r'id="FOH_DB_JSON"[^>]*>([\s\S]*?)</script>',(root/name).read_text())[1])['tables']
t=db('index.html');other=db('FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html');tables=['paths_class','paths_people','history_paths','paths_prestige','abilities_class','abilities_people','abilities_r1_people','history_abilities','abilities_prestige'];parity={k:t[k]==other[k] for k in tables};assert all(parity.values()),parity
native=fitz.open(a.sources/'04-COF2_01_Livre_de_base_web_v1.pdf');comp=fitz.open(a.sources/'22-Chroniques-Oubli-es-Fantasy-Compagnon.pdf');out=[];page_cache={}
for row in t['abilities_class']+t['abilities_people']+t['abilities_prestige']:
 src=row.get('sourceOriginal')or{};page=src.get('printedPage');book=src.get('bookId');text=row.get('sourceTextOriginal','')
 if book not in ['cof2-livre-base-2024','cof1-compagnon-2017']or not isinstance(page,int):continue
 pdf=native if book=='cof2-livre-base-2024' else comp;first=page+1 if pdf is native else page;logical='';raw=''
 for i in range(max(0,first-1),min(len(pdf),first+4)):
  cache_key=(book,i)
  if cache_key in page_cache:
   original,column=page_cache[cache_key];raw+=original;logical+=column;continue
  p=pdf[i];w=p.rect.width;original=p.get_text();raw+=original;column=''
  ranges=[(25,w/2),(w/2,w-25)] if pdf is native else ([(140,283),(289,432)] if i%2==0 else [(43,187),(192,337)])
  if pdf is comp and i==35:ranges=[(43,174),(178,309),(313,445)]
  for lo,hi in ranges:column+=p.get_text(clip=fitz.Rect(lo,40 if pdf is native else 49,hi,p.rect.height-27 if pdf is native else 580),sort=True)
  logical+=column;page_cache[cache_key]=(original,column)
 target=norm(text);hay=[norm(logical),norm(raw)];parts=[norm(x) for x in text.split('\n\n') if norm(x)];matched=bool(target)and(any(target in h for h in hay)or len(parts)>1 and all(any(part in h for h in hay)for part in parts))
 # Creature panels carry their S/V/I icons after values in the original extraction.
 # Comparing ordered words after removal of those isolated layout symbols is intentional.
 out.append({'id':row['id'],'pathId':row['path_id'],'rank':row['rank'],'bookId':book,'printedPage':page,'status':'MATCHED_SOURCE_TEXT' if matched else 'REQUIRES_REVIEW'})
report={'schema':'FOH_SOURCE_IMPORT_AUDIT','scope':'Sources natives et Compagnon à texte extractible ; les photographies ont leur audit de transcription distinct.','normalization':'Césures, espaces, accents, ponctuation, puces et icônes S/V/I normalisés ; signes numériques + et - préservés. Encadrés rattachés aux rangs racines comparés par sections.','productTableParity':parity,'checked':len(out),'matched':sum(x['status']=='MATCHED_SOURCE_TEXT' for x in out),'requiresReview':[x for x in out if x['status']=='REQUIRES_REVIEW'],'records':out}
a.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items()if k not in ['records','normalization','scope','productTableParity']},ensure_ascii=False,indent=2))
