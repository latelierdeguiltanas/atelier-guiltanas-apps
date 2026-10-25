"""Check full exported source descriptions across annex page boundaries."""
import json,re,sys,unicodedata
from pathlib import Path
from pypdf import PdfReader
folder=Path(sys.argv[1]);root=Path(__file__).resolve().parents[1];db=json.loads((root/'progression/pdf-labels.json').read_text());labels={p['id']:p.get('label',p.get('name',p['id']))for key in ['paths_class','paths_people','history_paths']for p in db[key]}
def normal(s):return re.sub(r'\s+','',unicodedata.normalize('NFC',s)).replace('\xad','')
checked=0
for test in json.loads((folder/'expected.json').read_text()):
 reader=PdfReader(folder/(test['name']+'.pdf'));texts=[];bands=[]
 for path in test['paths']:bands.append('VOIE DU MAGE'if path['kind']=='Voie du mage'else path['kind'].upper()+' · '+labels[path['pathId']])
 for page in reader.pages[2:]:
  for line in page.extract_text().splitlines():
   if line.startswith(('VOIES ET CAPACITÉS','Convergence produit','[X] Acquis · [ ] Rang de référence','A : attaque','Suite :'))or line.strip()in bands:continue
   texts.append(line)
 joined=normal(' '.join(texts))
 for path in test['paths']:
  for source in path['texts']:
   assert normal(source)in joined,(test['name'],path['pathId'],source[-120:]);checked+=1
 assert len(reader.get_fields())==156
 print('PASS',test['name'],len(reader.pages),'pages; every full rank description present')
print('PASS',checked,'full descriptions, including retained people R1 and source text continuing onto another page.')
