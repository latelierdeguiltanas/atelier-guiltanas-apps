"""Rebuild the COF2 prestige source catalogue from the user-supplied base PDF."""
import sys,re,json,unicodedata
from pathlib import Path
import fitz
pdf=fitz.open(sys.argv[1]); paths=[]; current=None; ability=None
names={'VOIE DE L’EXPERT':'expert','VOIE DU SPÉCIALISTE':'specialiste','VOIE DU LYCANTHROPE':'lycanthrope','VOIE DU SANG‑DRAGON':'sang-dragon','VOIE DU FAMILIER FANTASTIQUE':'familier-fantastique','VOIE DES ARMES À DEUX MAINS':'armes-a-deux-mains','VOIE DE L’ARME LIÉE':'arme-liee','VOIE DU CHEVALIER DRAGON':'chevalier-dragon','VOIE DU COMBATTANT DES TUNNELS':'combattant-des-tunnels','VOIE DU COMBAT DU MAL':'combat-du-mal','VOIE DU COLOSSE':'colosse','VOIE DU DANSEUR DE GUERRE':'danseur-de-guerre','VOIE DE L’ÉCORCHEUR':'ecorcheur','VOIE DU GUERRIER‑MAGE':'guerrier-mage','VOIE DE L’OURS':'ours','VOIE DU PORTEUR DE BOUCLIER':'porteur-de-bouclier','VOIE DU TUEUR DE GÉANTS':'tueur-de-geants'}
def clean(t):
 t=t.replace('‑\n','').replace('-\n','').replace('\n',' ');t=re.sub(r'[\x00-\x1f\x7f-\x9f]','',t);return re.sub(r'\s+',' ',t).strip()
for page in list(range(130,135))+list(range(147,155)):
 x=pdf[page]
 for left,right in [(25,x.rect.width/2),(x.rect.width/2,x.rect.width-25)]:
  lines=x.get_text(clip=fitz.Rect(left,35,right,x.rect.height-35)).splitlines();i=0
  while i<len(lines):
   line=lines[i].strip();i+=1
   if line.startswith('VOIE '):
    title=line
    while title not in names and i<len(lines) and i<1000:
     title+=' '+lines[i].strip();i+=1
     if len(title)>90:break
    if title not in names:continue
    key=names[title];current={'id':'prestigepath:'+key+':cof2-lb-2024','key':key,'name':title.capitalize().replace('’','’'),'kind':'prestige','family':'generic' if key in ['expert','specialiste','lycanthrope','sang-dragon','familier-fantastique'] else 'combattant','vigor':4 if key in ['familier-fantastique','guerrier-mage'] else 5,'introduction':'','ranks':[]};paths.append(current);ability=None;continue
   m=re.match(r'^([3-8])\. (.+)',line)
   if m and current:
    n=int(m[1]);label=m[2]
    while ':' not in label and '：' not in label and i<len(lines): label+=' '+lines[i].strip();i+=1
    label=clean(label).split(':')[0].strip();ability={'id':current['id']+':r'+str(n),'rank':n,'name':label,'text':'','spell':False,'source':{'bookId':'cof2-livre-base-2024','edition':'COF2','printedPage':page-1,'chapter':'Voies de prestige','section':label}};current['ranks'].append(ability);continue
   # Sidebars are editorial material, not ability text. The familiar's R7 is
   # in the right column after its exception sidebar and is outside N10.
   if line in ['GRAND MÉCHANT LOUP','ASCENDANCE DÉMONIAQUE','LES FAMILIERS F','EXCEPTION DE NIVEAU']:ability=None;continue
   if not current or not line or line in ['\\','W','FANTASTIQUES'] or re.fullmatch(r'[\W_]+',line):continue
   target=ability if ability else current;key='text' if ability else 'introduction';target[key]+=line+'\n'
for p in paths:
 p['introduction']=clean(p['introduction']);p['name']=p['name'].replace('Voie ','Voie ',1)
 for a in p['ranks']:a['text']=clean(a['text'])
assert len(paths)==17,len(paths)
assert all(len(p['ranks'])==5 for p in paths),[(p['key'],len(p['ranks'])) for p in paths]
# Keep the complete source text in data, separate from the COF1 conversion catalogue.
out=Path(__file__).resolve().parents[1]/'progression/prestige-cof2.json'
out.write_text(json.dumps({'schema':'FOH_PRESTIGE_COF2_OFFICIAL_V1','paths':paths},ensure_ascii=False,indent=2)+'\n')
print('17 voies / 85 capacités COF2 extraites')
