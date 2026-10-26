import pathlib,json
r=pathlib.Path('/tmp/nutrivibe-benchmark');old=json.loads((r/'manifest.json').read_text());data=json.loads((r/'manifest-fresh.json').read_text());seen={p['sha256']for p in old['photos']};sources={p['original']for p in old['photos']};new=[];excluded=[]
negative={'00-3.jpg':'Pessoa identificada pelo apelido Banana.','01-3.jpg':'Flor de macieira, sem maçã.','02-2.jpg':'Plantação/floração, sem brócolis comestível destacado.','02-3.jpg':'Folhagem em plantação, sem florete destacado.','15-2.jpg':'Horta, sem fruto destacado.','16-2.jpg':'Folha botânica no solo, não refeição.','16-3.jpg':'Cariótipo de espinafre: microscopia, não alimento fotografado.','19-2.jpg':'Folha jovem de mamoeiro, não mamão.','19-3.jpg':'Folha jovem de mamoeiro, não mamão.','23-2.jpg':'Folhagem de pepineiro, sem pepino destacado.','23-3.jpg':'Folha doente, não pepino.','30-2.jpg':'Torre de água na cidade de Sandwich.'}
for p in data['photos']:
 if p['sha256']in seen or p['original']in sources:p['exclude_reason']='Duplicação de imagem/origem já usada na primeira rodada';excluded.append(p);continue
 seen.add(p['sha256']);sources.add(p['original']);p['reviewed']=True;p['split']='validation';p['review_method']='Inspeção visual e título da origem, antes da inferência de validação.';p['scope']='food'if p['expected'].isdigit()else'ood'if p['expected']=='negative'else'dish'
 if p['id']in negative:p['expected']='negative';p['scope']='ood';p['review_note']=negative[p['id']]
 if p['id']=='10-3.jpg':p['expected']='pasta';p['scope']='dish';p['acceptable']=['pasta','10'];p['review_note']='Macarrão e ovo são ambos explicitamente visíveis e identificados na legenda.'
 if p['id']=='25-2.jpg':p['expected']='salad';p['scope']='dish';p['acceptable']=['salad','25'];p['review_note']='Salada de milho: prato e milho são rótulos aceitáveis.'
 new.append(p)
data['photos']=new;data['excluded']=excluded;data['frozen_policy']={'model':'siglip','minimumMargin':0.01,'minimumScore':0.05,'selection_dataset':'Primeira rodada; não ajustar com resultados desta validação.'}
pathlib.Path('NutriVibe/documentacoes/avaliacao-imagens/validation-dataset.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print('Validação congelada:',len(new),'fotos;',len(excluded),'duplicações excluídas antes da inferência')
from collections import Counter
print(Counter(p['scope']for p in new))
