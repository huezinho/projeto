"""Download reprodutível das origens públicas fixadas; nunca troca checksums para aceitar divergência."""
import urllib.request,json,pathlib,hashlib,concurrent.futures,argparse
parser=argparse.ArgumentParser();parser.add_argument('--validation',action='store_true');args=parser.parse_args()
ROOT=pathlib.Path('/tmp/nutrivibe-benchmark');ROOT.mkdir(exist_ok=True)
REPORT=pathlib.Path(__file__).resolve().parents[2]/'documentacoes/avaliacao-imagens'
manifest=json.loads((REPORT/('validation-dataset.json'if args.validation else'dataset.json')).read_text());(ROOT/('manifest-fresh.json'if args.validation else'manifest.json')).write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
jobs=[]
if not args.validation:
 for model in manifest['models']:
  if 'error'in model:print('Não executado:',model);continue
  for f in model['files']:jobs.append((f"https://huggingface.co/{model['repo']}/resolve/{model['revision']}/{f['file']}",ROOT/'models'/model['name']/f['file'],f['sha256']))
for photo in manifest['photos']:jobs.append((photo['url'],ROOT/'photos'/photo['id'],photo['sha256']))
def fetch(job):
 url,dest,sha=job
 if dest.exists()and hashlib.sha256(dest.read_bytes()).hexdigest()==sha:return
 req=urllib.request.Request(url,headers={'User-Agent':'NutriVibeResearch/1.0 (https://github.com/huezinho/projeto)'})
 with urllib.request.urlopen(req,timeout=180)as r:data=r.read()
 if hashlib.sha256(data).hexdigest()!=sha:raise ValueError('Checksum divergente: '+url)
 dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:list(pool.map(fetch,jobs))
print('Artefatos verificados:',len(jobs))
