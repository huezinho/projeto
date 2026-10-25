// Executado apenas no build de pesquisa, nunca na carga da página do usuário.
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';import {createHash}from'node:crypto';import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
export async function prepareBenchmark(output){
 const dir=path.join(output,'imagens/benchmark');await mkdir(dir,{recursive:true});
 const models=[['clip','Xenova/clip-vit-base-patch32',['config.json','preprocessor_config.json','tokenizer.json','tokenizer_config.json','onnx/text_model_quantized.onnx','onnx/vision_model_quantized.onnx']],['siglip','Xenova/siglip-base-patch16-224',['config.json','preprocessor_config.json','tokenizer.json','tokenizer_config.json','onnx/text_model_quantized.onnx','onnx/vision_model_quantized.onnx']],['food101','Xenova/vit-base-patch16-224-in21k-finetuned-food101',['config.json','preprocessor_config.json','onnx/model_quantized.onnx']]];
 const provenance={models:[],photos:[]};
 for(const[name,repo,files]of models){
  try{
   const info=await fetch('https://huggingface.co/api/models/'+repo).then(r=>{if(!r.ok)throw Error(`metadata ${r.status}`);return r.json()});
   const modelDir=path.join(output,'modelos/benchmark',name);const record={name,repo,revision:info.sha,files:[]};
   for(const file of files){const url=`https://huggingface.co/${repo}/resolve/${info.sha}/${file}`;const res=await fetch(url,{signal:AbortSignal.timeout(180000)});if(!res.ok)throw Error(`${file} ${res.status}`);const bytes=Buffer.from(await res.arrayBuffer());const dest=path.join(modelDir,file);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes);record.files.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
   provenance.models.push(record);console.log('Benchmark modelo pronto',name);
  }catch(error){provenance.models.push({name,repo,error:error.message});console.log('Benchmark modelo indisponível',name,error.message);}
 }
 const topics=[['0','Banana'],['1','Apple'],['2','Broccoli'],['3','Carrot'],['4','Cooked rice'],['5','Oatmeal'],['6','Black turtle bean'],['7','Lentil'],['8','Milk'],['9','Yogurt'],['10','Boiled egg'],['11','Grilled chicken'],['12','Baked fish'],['13','Chickpea'],['14','Pumpkin'],['15','Tomato'],['16','Spinach'],['17','Boiled potato'],['18','Whole wheat bread'],['19','Papaya'],['20','Strawberry'],['21','Tofu'],['22','Cheese'],['23','Cucumber'],['24','Mango'],['25','Sweet corn'],['pizza','Pizza'],['salad','Salad'],['rice_beans','Rice and beans'],['pasta','Spaghetti'],['sandwich','Sandwich'],['sushi','Sushi'],['fries','French fries'],['negative','Dog'],['negative','Cat'],['negative','Mobile phone'],['negative','Chair'],['negative','Sunset']];
 for(let index=0;index<topics.length;index++){
  const[expected,topic]=topics[index];
  try{
   // Busca de acervo público. Os rótulos serão revisados visualmente antes de medir os modelos.
   const params=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:`${topic} filetype:bitmap -diagram -map -logo -icon`,gsrnamespace:'6',gsrlimit:'3',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'640'});
   const res=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{headers:{'User-Agent':'NutriVibeResearch/1.0 (https://github.com/huezinho/projeto)'},signal:AbortSignal.timeout(30000)});
   if(!res.ok)throw Error(`Commons ${res.status}`);
   const meta=await res.json();const pages=Object.values(meta.query?.pages||{}).sort((a,b)=>a.index-b.index);
   for(let j=0;j<Math.min(pages.length,2);j++){const page=pages[j];const image=page.imageinfo?.[0];if(!image)continue;const url=image.thumburl||image.url;const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)continue;const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>3_000_000)continue;const file=`${String(index).padStart(2,'0')}-${j}.jpg`;await writeFile(path.join(dir,file),bytes);provenance.photos.push({id:file,expected,topic,title:page.title,url,original:image.url,license:image.extmetadata?.LicenseShortName?.value,licenseUrl:image.extmetadata?.LicenseUrl?.value,artist:image.extmetadata?.Artist?.value,sha256:createHash('sha256').update(bytes).digest('hex'),split:j?'holdout':'development',reviewed:false});}
   console.log('Benchmark fotos',topic);
  }catch(error){console.log('Benchmark foto indisponível',topic,error.message);}
 }
 await writeFile(path.join(dir,'manifest.json'),JSON.stringify(provenance,null,2));
}
