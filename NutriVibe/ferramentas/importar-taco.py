# Ferramenta de manutenção; requer xlrd, sem dependência no runtime do site.
import xlrd,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1];p=root/'documentacoes/fontes/TACO-original-2011.xls'
s=xlrd.open_workbook(str(p)).sheet_by_index(0)
mapping={'0':[179,182],'1':[221,222],'2':[100,101],'3':[109,110],'4':[1,3],'5':[7],'6':[561,567],'7':[577],'8':[458,457],'9':[448,449],'10':[488],'11':[410],'12':[301,318],'13':[575],'14':[64,68],'15':[157],'16':[119,120],'17':[91],'18':[52],'19':[225,226],'20':[239],'21':[584],'22':[461,463,469],'23':[142],'24':[228,229,231],'25':[44,45]}
cols={'energyKcal':3,'proteinG':5,'fatG':6,'carbohydrateG':8,'fiberG':9,'calciumMg':11,'ironMg':16,'sodiumMg':17}
refs=[]
for i in range(s.nrows):
 row=s.row_values(i)
 if not isinstance(row[0],float):continue
 taco=int(row[0]);food=next((f for f,ids in mapping.items() if taco in ids),None)
 if food is None:continue
 nutrients={};qualifiers={}
 for k,c in cols.items():
  v=row[c]
  nutrients[k]=round(v,6) if isinstance(v,(float,int)) else None
  if not isinstance(v,(float,int)):qualifiers[k]=str(v).strip() or 'não informado'
 refs.append({'id':f'taco2011-{taco}','foodId':food,'tacoId':taco,'description':row[1].strip(),'basisGrams':100,'nutrients':nutrients,'qualifiers':qualifiers})
source={'id':'taco2011-original-v1','title':'TACO — 4ª edição revisada e ampliada, NEPA/UNICAMP, 2011','url':'https://www.nepa.unicamp.br/taco/','mirror':'https://github.com/raulfdm/taco-api','mirrorCommit':'06e466ad2f3d76064b587808b1804564b2c40f67','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sheet':s.name,'basis':'100 g de parte comestível','note':'Recorte extraído da planilha original arquivada. Traços e NA não são convertidos em zero.'}
(root/'dados/nutricao.js').write_text('export const nutritionSource = '+json.dumps(source,ensure_ascii=False,indent=2)+';\nexport const nutritionReferences = '+json.dumps(refs,ensure_ascii=False,indent=2)+';\n')
(root/'documentacoes/fontes/proveniencia.json').write_text(json.dumps(source,ensure_ascii=False,indent=2))
print(len(refs),'referências geradas')
