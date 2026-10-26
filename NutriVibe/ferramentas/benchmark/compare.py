"""Benchmark CPU, sem treinamento. Rótulos revisados antes das inferências."""
import os,json,pathlib,time,math
os.environ['HF_HUB_OFFLINE']='1'
import numpy as np,onnxruntime as ort
from PIL import Image
from transformers import AutoTokenizer,AutoImageProcessor,PreTrainedTokenizerFast
ROOT=pathlib.Path('/tmp/nutrivibe-benchmark');REPORT=pathlib.Path(__file__).resolve().parents[2]/'documentacoes/avaliacao-imagens';REPORT.mkdir(parents=True,exist_ok=True)
classes=[('0','banana'),('1','apple fruit'),('2','broccoli'),('3','carrots'),('4','rice'),('5','oatmeal or oat flakes'),('6','beans'),('7','lentils'),('8','a glass of milk'),('9','yogurt'),('10','boiled eggs'),('11','chicken meat'),('12','fish as food'),('13','chickpeas'),('14','pumpkin'),('15','tomatoes'),('16','spinach leaves'),('17','potatoes'),('18','bread'),('19','papaya'),('20','strawberries'),('21','tofu'),('22','cheese'),('23','cucumbers'),('24','mango fruit'),('25','sweet corn'),('pizza','pizza'),('salad','vegetable salad'),('rice_beans','rice and beans on a plate'),('pasta','pasta or spaghetti'),('sandwich','sandwich'),('sushi','sushi'),('fries','french fries'),('green_peas','green peas'),('casein','curdled milk'),('negative_dog','a dog or fox'),('negative_cat','a cat'),('negative_phone','a cell phone'),('negative_chair','a chair'),('negative_sunset','a sunset'),('negative_plant','a flowering plant'),('negative_document','a computer screenshot, printed text or a document'),('negative_packaging','packaged food boxes'),('negative_person','a person'),('negative_empty','an empty plate'),('negative_object','an inedible object')]
manifest=json.loads((ROOT/'manifest.json').read_text())
corrections={'08-1.jpg':('casein','other_food','Precipitação de caseína, não leite líquido.'),'13-1.jpg':('green_peas','other_food','Ervilhas verdes; busca por grão-de-bico retornou classe errada.'),'16-0.jpg':('negative','ood','Planta em floração, não refeição.'),'16-1.jpg':('negative','ood','Detalhe fitopatológico de folha, não refeição.'),'17-0.jpg':('negative','ood','Flores da batateira, não batata consumida.'),'22-0.jpg':('negative','ood','Captura de tela de aplicativo, não queijo.'),'28-1.jpg':('negative','ood','Embalagens de produtos, não prato preparado.'),'03-1.jpg':('3','challenge','Escultura decorativa de cenoura em formato de peixe.')}
for p in manifest['photos']:
 p['reviewed']=True;p['review_method']='Inspeção visual do mosaico e descrição de origem, antes da inferência.'
 p['scope']='food' if p['expected'].isdigit() else 'ood' if p['expected']=='negative' else 'dish'
 if p['id']in corrections:p['expected'],p['scope'],p['review_note']=corrections[p['id']]
manifest['classes']=[{'id':i,'description':d}for i,d in classes];manifest['reviewed_before_inference']=True
(REPORT/'dataset.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
# Os mesmos dois textos são usados em ambos os modelos, sem ajuste por resultado.
texts=[f'a photo of {d}.'for _,d in classes]+[f'a close-up photo of {d}.'for _,d in classes]
opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
for name in ['clip','siglip']:
 folder=ROOT/'models'/name
 tokenizer=AutoTokenizer.from_pretrained(folder,local_files_only=True)if name=='clip'else PreTrainedTokenizerFast(tokenizer_file=str(folder/'tokenizer.json'),eos_token='</s>',pad_token='</s>',unk_token='<unk>',model_max_length=64)
 tokens=tokenizer(texts,padding='max_length',max_length=77 if name=='clip'else 64,truncation=True,return_tensors='np')
 # SigLIP usa textos minúsculos; os prompts fixos já estão em minúsculas.
 text_session=ort.InferenceSession(str(folder/'onnx/text_model_quantized.onnx'),opts,providers=['CPUExecutionProvider'])
 outputs=text_session.run(None,{i.name:tokens[i.name]for i in text_session.get_inputs()});text=outputs[0 if name=='clip'else 1]
 text/=np.linalg.norm(text,axis=-1,keepdims=True);n=len(classes);embeddings=(text[:n]+text[n:])/2;embeddings/=np.linalg.norm(embeddings,axis=-1,keepdims=True)
 (REPORT/f'{name}-text-vectors.json').write_text(json.dumps({'classes':[{'id':i,'description':d}for i,d in classes],'vectors':embeddings.tolist(),'prompts':texts,'model':next(m for m in manifest['models']if m['name']==name)},ensure_ascii=False))
 del text_session
 session=ort.InferenceSession(str(folder/'onnx/vision_model_quantized.onnx'),opts,providers=['CPUExecutionProvider']);processor=AutoImageProcessor.from_pretrained(folder,local_files_only=True,use_fast=False)
 rows=[]
 for index,p in enumerate(manifest['photos']):
  im=Image.open(ROOT/'photos'/p['id']).convert('RGB');inputs=processor(images=im,return_tensors='np');start=time.perf_counter();out=session.run(None,{i.name:inputs[i.name]for i in session.get_inputs()});image=out[0 if name=='clip'else 1];image/=np.linalg.norm(image,axis=-1,keepdims=True);scores=(image@embeddings.T)[0];ranking=np.argsort(-scores)[:5];top=str(classes[ranking[0]][0]);correct=(top==p['expected']or(p['expected']=='negative'and top.startswith('negative')))
  rows.append({'photo':p['id'],'expected':p['expected'],'scope':p['scope'],'split':p['split'],'prediction':top,'correct':correct,'margin':float(scores[ranking[0]]-scores[ranking[1]]),'timeSeconds':time.perf_counter()-start,'top5':[{'id':classes[k][0],'score':float(scores[k])}for k in ranking]})
  if index%15==0:print(name,index+1,'/',len(manifest['photos']),flush=True)
 report={'model':name,'rows':rows,'summary':{}}
 for scope in ['food','dish','ood','other_food','challenge']:
  for split in ['all','development','holdout']:
   data=[r for r in rows if r['scope']==scope and(split=='all'or r['split']==split)]
   report['summary'][scope+'_'+split]={'total':len(data),'correct':sum(r['correct']for r in data),'accuracy':sum(r['correct']for r in data)/len(data)if data else None}
 (REPORT/f'{name}-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(name,json.dumps(report['summary']),flush=True)
