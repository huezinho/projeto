const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message)); page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const base=process.env.NUTRIVIBE_URL||'http://127.0.0.1:8080';
 const app=base+'/NutriVibe/aplicativo/html/';
 await page.goto(app+'perfil.html');
 await page.locator('#apelido').fill('   '); await page.locator('#idade').fill('8'); await page.getByRole('button',{name:'Salvar perfil'}).click();
 await page.getByText('Informe um apelido válido.').waitFor();
 await page.locator('#apelido').fill('Explorador'); await page.getByRole('button',{name:'Salvar perfil'}).click(); await page.getByText('Perfil salvo neste navegador.',{exact:false}).waitFor();
 await page.goto(app+'registro.html'); await page.getByText('Nenhum alimento registrado.',{exact:false}).waitFor();
 await page.locator('#busca').fill('xyz'); await page.getByText('Nenhum resultado.',{exact:false}).waitFor();
 await page.locator('#busca').fill('maca'); assert.equal(await page.locator('#catalogo article').count(),1);
 await page.locator('#busca').fill(''); await page.locator('#grupo').selectOption('Frutas'); assert.equal(await page.locator('#catalogo article').count(),2);
 await page.getByRole('button',{name:'Registrar Banana',exact:true}).click(); await page.reload(); assert.equal(await page.locator('#registros li').count(),1);
 await page.goto(app+'resumo.html'); assert.equal(await page.locator('.stat').first().textContent(),'1');
 await page.goto(app+'registro.html'); await page.getByRole('button',{name:/Remover Banana/}).click(); await page.getByText('Nenhum alimento registrado.',{exact:false}).waitFor();
 await page.goto(app+'resumo.html'); assert.equal(await page.locator('.stat').first().textContent(),'0');
 for(const width of [360,768,1280]) {
  await page.setViewportSize({width,height:900});
  for(const slug of ['index','perfil','registro','resumo','educacao']) {
   await page.goto(app+slug+'.html');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${slug}`);
   if(width<860){await page.locator('#menu').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');}
  }
  await page.screenshot({path:`NutriVibe/documentos/evidencias/aplicativo-${width}.png`,fullPage:true});
  await page.goto(base+'/NutriVibe/landingpage/html/index.html');
  await page.locator('#contato').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow landing ${width}`);
  await page.locator('#nome').fill('Pessoa fictícia'); await page.locator('#email').fill('pessoa@example.com'); await page.locator('input[type=checkbox]').check();
  await page.getByRole('button',{name:'Demonstrar meu interesse'}).click(); await page.getByText('Seus dados não foram enviados nem salvos.',{exact:false}).waitFor();
  await page.screenshot({path:`NutriVibe/documentos/evidencias/landingpage-${width}.png`,fullPage:true});
 }
 // Check every local HTML reference, including historical pages and fragment IDs.
 const fs=require('node:fs'),path=require('node:path');
 function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='.git'?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
 for(const file of walk('.').filter(f=>f.endsWith('.html'))){
  await page.goto(base+'/'+file);
  for(const ref of await page.locator('[href],[src]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')||n.getAttribute('src')).filter(Boolean))){
   const u=new URL(ref,page.url()); if(u.origin!==new URL(base).origin)continue;
   const response=await page.request.get(u.href); assert(response.ok(),`${file}: ${ref}`);
   if(u.hash && u.pathname===new URL(page.url()).pathname)assert(await page.locator(`[id="${decodeURIComponent(u.hash.slice(1))}"]`).count(),`${file}: missing ${u.hash}`);
  }
 }
 assert.deepEqual(errors,[]); console.log('PASS: perfil, validação, filtros, registro, remoção, persistência, resumo, contato, navegação, responsividade 360/768/1280; sem erros JS/HTTP. Chromium.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
