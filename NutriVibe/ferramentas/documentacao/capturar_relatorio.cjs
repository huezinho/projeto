const { chromium } = require('playwright');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:850}});
 const base=process.env.NUTRIVIBE_URL || 'http://127.0.0.1:8099';
 const app=base+'/html/aplicativo/';
 const output=path.resolve(__dirname,'../../documentacoes/relatorio-projeto/capturas');
 const shot=async(name)=>{await page.screenshot({path:path.join(output,name+'.png')});};
 await page.goto(base+'/html/landingpage/index.html');await shot('landingpage');
 await page.goto(app+'perfil.html');await page.locator('#apelido').fill('Ana');await page.locator('#idade').fill('12');await page.locator('input[value=lactose]').check();await page.locator('input[value=verde]').check();
 await page.getByRole('button',{name:'Salvar preferências'}).click();await page.getByText('Preferências salvas.',{exact:false}).waitFor();
 await page.evaluate(()=>scrollTo(0,0));await shot('preferencias');
 await page.goto(app+'registro.html');await shot('diario');
 await page.getByRole('button',{name:'Registrar Banana',exact:true}).click();await page.locator('#nutrition-reference').selectOption('taco2011-182');await page.locator('#nutrition-grams').fill('100');await shot('confirmacao-nutricional');
 await page.getByRole('button',{name:'Confirmar peso e registrar'}).click();
 await page.goto(app+'index.html');await shot('painel');
 await page.goto(app+'resumo.html');await shot('resumo');
 await page.locator('#sugestoes').scrollIntoViewIfNeeded();await shot('sugestoes');
 await page.goto(app+'educacao.html');await shot('educacao');
 await page.setViewportSize({width:390,height:844});await page.goto(app+'index.html');await shot('painel-mobile');await page.locator('#menu').click();await shot('menu-mobile');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Transbordamento na captura móvel');
 console.log('10 capturas reais geradas; cenário local de teste: Ana, 12 anos, lactose e cor verde, Banana 100 g.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
