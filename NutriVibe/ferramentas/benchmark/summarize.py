import pathlib,json,csv,statistics,math,re
root=pathlib.Path(__file__).resolve().parents[2];report=root/'documentacoes/avaliacao-imagens';rows=json.loads((report/'siglip-browser-results.json').read_text())['rows']
def stats(data):
 accepted=[r for r in data if r['accepted']!='none'];return{'n':len(data),'top1Correct':sum(r['correct']for r in data),'suggestions':len(accepted),'suggestionsCorrect':sum(r['acceptedCorrect']for r in accepted),'manual':len(data)-len(accepted)}
summary={'implementation':'SigLIP base patch16 224, quantizado, ONNX Runtime Web CPU/WASM','policy':{'minimumMargin':.01,'minimumScore':.05},'initialFood':stats([r for r in rows if r['scope']=='food'and r['split']!='validation']),'initialDishes':stats([r for r in rows if r['scope']=='dish'and r['split']!='validation']),'validationFood':stats([r for r in rows if r['scope']=='food'and r['split']=='validation']),'validationDishes':stats([r for r in rows if r['scope']=='dish'and r['split']=='validation']),'allFood':stats([r for r in rows if r['scope']=='food']),'allDishes':stats([r for r in rows if r['scope']=='dish']),'allPositive':stats([r for r in rows if r['scope']in['food','dish']]),'allControls':stats([r for r in rows if r['scope']=='ood']),'all':stats(rows),'latencyBrowserSeconds':{'median':statistics.median(r['timeSeconds']for r in rows),'p95':sorted(r['timeSeconds']for r in rows)[int(len(rows)*.95)]}}
botanical={'16-0.jpg','16-1.jpg','17-0.jpg','01-3.jpg','02-2.jpg','02-3.jpg','15-2.jpg','16-2.jpg','19-2.jpg','19-3.jpg','23-2.jpg','23-3.jpg'}
summary['botanicalControls']=stats([r for r in rows if r['scope']=='ood'and r['photo']in botanical]);summary['ordinaryControls']=stats([r for r in rows if r['scope']=='ood'and r['photo']not in botanical]);(report/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
with (report/'results.csv').open('w')as f:
 writer=csv.DictWriter(f,fieldnames=['photo','split','scope','expected','prediction','correct','accepted','acceptedCorrect','timeSeconds'],lineterminator='\n');writer.writeheader();writer.writerows({k:r.get(k)for k in writer.fieldnames}for r in rows)
allphotos=[]
for name in ['dataset.json','validation-dataset.json']:allphotos+=json.loads((report/name).read_text())['photos']
with (report/'sources.csv').open('w')as f:
 keys=['id','title','original','url','license','licenseUrl','artist','sha256'];writer=csv.DictWriter(f,fieldnames=keys,lineterminator="\n");writer.writeheader()
 for p in allphotos:
  row={k:p.get(k,'')for k in keys};row['artist']=' '.join(re.sub('<[^>]+>','',re.sub(r'<style[^>]*>.*?</style>','',str(row['artist']),flags=re.S)).split());writer.writerow(row)
print(json.dumps(summary,ensure_ascii=False,indent=2))
