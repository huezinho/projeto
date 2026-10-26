"""Preenche cópias do modelo PROGRAD sem alterar estilos, tabelas, mídias ou demais partes do pacote."""
from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile
from lxml import etree as E
import hashlib,json,csv
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'documentacoes/relatorios-individuais'
TEMPLATE=BASE/'modelo-original/2s2026_Modelo_Relatorio_Curricularizacao_Extensao_PROGRAD.docx'
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W='{'+NS['w']+'}'
people=[
 {'slug':'paulo','nome':'Paulo Capreti','ra':'26028858','frente':'JavaScript','participacao':'Na divisão de responsabilidades informada pela equipe, minha frente foi JavaScript. Essa frente reúne módulos para perfil, validação de formulários, registro e remoção de alimentos, busca e filtros, persistência local, importação e exportação. Inclui a integração entre foto, confirmação do alimento, preparo, peso e cálculo TACO, além da apresentação das sugestões. A solução atual usa SigLIP no navegador após comparação de reconhecedores; os testes e os resultados citados são evidências técnicas do projeto, não comprovação de horas individuais.','reflexao':'A frente de JavaScript relaciona programação, eventos, estruturas de dados e validação com uma necessidade de uso concreta. A principal dificuldade técnica do projeto foi integrar estados de formulário, armazenamento, identificação visual e referências nutricionais sem apresentar hipóteses como fatos. A solução separa reconhecimento, confirmação e cálculo e mantém correção manual. O trabalho reforça a necessidade de testar entradas inválidas, explicar limitações e proteger dados. Em continuidade, considero importante ampliar testes com usuários e aparelhos reais e revisar individualmente o registro de atividades.','atividades':[
 ('Ago/2026','Levantamento inicial dos fluxos e interações previstos.'),('Ago/2026','Discussão dos requisitos funcionais com a equipe.'),('A confirmar','Organização das interações e validações para implementação.'),('Out/2026','Organização dos módulos JavaScript do aplicativo.'),('Out/2026','Validação dos formulários de perfil e preferências.'),('Out/2026','Registro, remoção, pesquisa e filtros do catálogo.'),('Out/2026','Persistência, exportação, importação e exclusão de dados.'),('Out/2026','Resumo diário e regras de sugestões compatíveis com o perfil.'),('Out/2026','Confirmação de referência e peso para cálculo nutricional.'),('Out/2026','Integração do registro por foto e correção manual.'),('Out/2026','Integração do modelo selecionado e tratamento de incerteza.'),('Out/2026','Revisão das interações, mensagens e fluxo completo.')],
 'evidencias': [('Módulos JavaScript de perfil, diário, resumo e armazenamento.','javascript/aplicativo/'),('Cálculo proporcional e referências alimentares TACO.','documentacoes/nutricao.md'),('Comparação de modelos e validação com fotos públicas.','documentacoes/avaliacao-imagens/README.md')]},
 {'slug':'davi','nome':'Davi Pioli','ra':'26005199','frente':'HTML e acompanhamento do Kanban','participacao':'Na divisão informada pela equipe, minhas frentes foram HTML e acompanhamento do Kanban. A estrutura entregue separa landing page e aplicativo, com páginas semânticas, formulários rotulados e navegação entre início, perfil, registro, resumo e educação. A organização do trabalho considera o backlog exportado do Jira, TRAB-26 a TRAB-57, com planejamento por etiquetas S1, S2 e S3. Não se afirma que sprints nativas foram criadas, que status do Jira foram alterados ou que revisões formais ocorreram sem registro.','reflexao':'A organização em HTML e tarefas permite relacionar estrutura documental, acessibilidade e planejamento do desenvolvimento. A dificuldade do projeto foi transformar uma apresentação inicial em um fluxo navegável e manter coerência entre tarefas, páginas e comportamento. Rótulos, seções semânticas e estados de navegação ajudam a tornar o uso compreensível. O Kanban deve refletir critérios verificáveis, e não apenas uma lista de tarefas marcadas como concluídas. Para continuidade, considero relevante revisar pendências com o grupo, registrar responsáveis e horas reais e validar o fluxo com o público externo.','atividades':[
 ('Ago/2026','Organização da proposta e das informações iniciais do site.'),('Ago/2026','Levantamento das páginas e da sequência de navegação.'),('A confirmar','Organização inicial das tarefas e critérios de entrega.'),('Out/2026','Estruturação semântica das páginas HTML principais.'),('Out/2026','Separação da landing page e das telas do aplicativo.'),('Out/2026','Organização dos formulários, rótulos e campos obrigatórios.'),('Out/2026','Integração de caminhos relativos, links e navegação.'),('Out/2026','Estrutura das telas de foto, confirmação e resumo.'),('Out/2026','Conferência do backlog exportado e das dependências.'),('Out/2026','Acompanhamento proposto por etapas S1, S2 e S3.'),('Out/2026','Revisão do fluxo e de referências locais das páginas.'),('Out/2026','Organização das evidências e pendências de apresentação.')],
 'evidencias':[('Páginas HTML da landing page e do aplicativo.','html/'),('Backlog fornecido com tarefas e critérios de aceite.','documentacoes/historico/backlog-jira.json'),('Organização, fontes, validação e limites do projeto.','documentacoes/implementacao.md')]},
 {'slug':'victor','nome':'Victor Almeida','ra':'26003836','frente':'CSS e identidade visual','participacao':'Na divisão de responsabilidades informada, minha frente foi CSS. A identidade visual foi organizada para os dois sites com paleta, tipografia, cartões, formulários, foco visível e navegação coerentes. As folhas de estilo utilizam Grid, Flexbox e regras responsivas. A revisão atual retira emojis e setas decorativas e aplica a marca NutriVibe com fundo transparente. Há evidências de verificações em larguras de 360, 768 e 1280 pixels; isso não substitui testes em aparelhos físicos ou auditoria completa de acessibilidade.','reflexao':'A frente de CSS evidencia que apresentação visual e usabilidade precisam ser tratadas em conjunto. No projeto, a dificuldade foi manter legibilidade e organização em telas diferentes sem depender de elementos decorativos para explicar ações. O uso de regras reutilizáveis, espaçamentos coerentes e foco visível contribui para a experiência. A revisão da marca também mostrou a importância de preparar corretamente os arquivos de imagem. Para continuidade, considero necessário ampliar verificações de contraste, navegação por teclado e uso em dispositivos reais, com feedback de usuários externos.','atividades':[
 ('Ago/2026','Levantamento de referências de identidade visual.'),('Ago/2026','Discussão de cores, organização e legibilidade.'),('A confirmar','Organização das referências visuais e do protótipo.'),('Out/2026','Estruturação das folhas de estilo dos dois sites.'),('Out/2026','Padronização de tipografia, cores e espaçamentos.'),('Out/2026','Estilização de formulários, cartões e mensagens.'),('Out/2026','Aplicação de Grid e Flexbox nos layouts.'),('Out/2026','Ajustes para larguras de celular, tablet e desktop.'),('Out/2026','Revisão dos estados de foco e navegação móvel.'),('Out/2026','Revisão da composição visual e retirada de símbolos.'),('Out/2026','Aplicação da logo com transparência e margens reduzidas.'),('Out/2026','Conferência visual e organização de capturas de tela.')],
 'evidencias':[('Folhas CSS e regras responsivas das duas interfaces.','css/'),('Capturas técnicas em diferentes larguras.','documentacoes/evidencias/'),('Aplicação publicada para consulta visual.','https://nutrivibe-gamma.vercel.app/app')]},
 {'slug':'marcelo','nome':'Marcelo Dalbone','ra':'25001986','frente':'Pesquisas: problema, público-alvo e requisitos','participacao':'Na divisão informada pela equipe, minha frente foi pesquisa. Esta redação organiza essa contribuição em levantamento do problema, contexto da seletividade alimentar, público-alvo, objetivos e requisitos do produto. O material do projeto relaciona educação alimentar, apoio aos responsáveis e tecnologia e registra limitações de uso. As pesquisas subsidiam páginas informativas e definição do MVP. Não foram fornecidos registros de entrevistas, questionários ou validação comunitária; tais ações não são apresentadas como realizadas.','reflexao':'A pesquisa evidencia a relação entre um problema social e sua tradução em requisitos de software. O desafio do projeto foi evitar que a tecnologia fosse apresentada como solução clínica e distinguir necessidades do público-alvo de hipóteses ainda não validadas. A consulta a fontes e a organização dos requisitos ajudam a construir objetivos mais claros. A experiência também reforça a importância de ouvir a comunidade e registrar evidências dessa interlocução. Para continuidade, considero essencial validar o problema e a usabilidade com responsáveis e profissionais e documentar as contribuições externas de forma rastreável.','atividades':[
 ('Ago/2026','Pesquisa inicial sobre seletividade e educação alimentar.'),('Ago/2026','Levantamento do problema e do público-alvo previsto.'),('Ago/2026','Organização de objetivos e relação com ODS 3 e 12.'),('A confirmar','Sistematização de fontes e requisitos do produto.'),('A confirmar','Revisão das informações para apresentação do projeto.'),('Out/2026','Conferência do escopo e do fluxo principal do MVP.'),('Out/2026','Revisão de conteúdo informativo da landing page.'),('Out/2026','Pesquisa de recursos educativos e linguagem acessível.'),('Out/2026','Discussão dos limites entre apoio educativo e prescrição.'),('Out/2026','Conferência de requisitos e critérios de aceite.'),('Out/2026','Organização das fontes e das evidências documentais.'),('Out/2026','Levantamento de pendências de validação com o público.')],
 'evidencias':[('Documento anterior de contextualização e proposta.','documentacoes/segunda-entrega/trabalho.pdf'),('Material da segunda entrega e guia visual.','documentacoes/segunda-entrega/'),('Requisitos e backlog fornecidos para desenvolvimento.','documentacoes/historico/backlog-jira.json')]},
 {'slug':'akiane','nome':'Akiane Merbach','ra':'26027003','frente':'Pesquisas: fontes alimentares, avaliação e limitações','participacao':'Na divisão informada pela equipe, minha frente foi pesquisa. Esta redação organiza essa contribuição no apoio à seleção de fontes alimentares, comparação de soluções, limitações do reconhecimento por foto e interpretação das evidências. O produto utiliza um recorte rastreável da TACO e distingue identificação, preparo, peso e estimativa nutricional. A comparação técnica reuniu MobileNet, CLIP e SigLIP e 148 avaliações no navegador para o modelo selecionado. Esses resultados são do projeto e não comprovam, por si, a execução pessoal ou horas de pesquisa de um integrante.','reflexao':'A pesquisa técnica exige diferenciar uma solução que parece funcionar de uma solução avaliada com critérios e fontes. A principal dificuldade foi reconhecer os limites de uma imagem: ela não determina peso, ingredientes ocultos ou ausência de alergênicos. A consulta à TACO e o registro de referências permitem verificar cálculos; o benchmark registra também erros e recusas. O trabalho reforça a responsabilidade de não transformar resultados de uma amostra em garantia universal. Para continuidade, considero importantes revisão por nutricionista, ampliação de fotos representativas e validação ética com usuários externos.','atividades':[
 ('Ago/2026','Pesquisa sobre alimentação infantil e necessidades do público.'),('Ago/2026','Levantamento de fontes e limites de orientação alimentar.'),('A confirmar','Organização das referências utilizadas pelo grupo.'),('A confirmar','Revisão dos materiais de contextualização do projeto.'),('Out/2026','Pesquisa de restrições, seletividade e cuidados de uso.'),('Out/2026','Conferência de fontes de composição nutricional.'),('Out/2026','Revisão da rastreabilidade do recorte TACO.'),('Out/2026','Pesquisa de alternativas de reconhecimento por imagem.'),('Out/2026','Análise dos resultados e limites do benchmark do projeto.'),('Out/2026','Distinção entre alimento, preparo, peso e nutrientes.'),('Out/2026','Organização das limitações e cuidados com dados.'),('Out/2026','Revisão das evidências e das pendências de avaliação externa.')],
 'evidencias':[('Fonte, referências e cálculo da estimativa nutricional.','documentacoes/nutricao.md'),('Comparação de reconhecedores, fotos e resultados individuais.','documentacoes/avaliacao-imagens/README.md'),('Proveniência da planilha original TACO.','documentacoes/fontes/proveniencia.json')]},
]

# Cronograma proposto: datas e horas são estimativas solicitadas pela equipe.
# Não representam apontamento comprovado nem a carga curricular oficial.
SCHEDULES = {
 'paulo': (['07/08/2026','14/08/2026','11/09/2026','02/10/2026','05/10/2026','08/10/2026','10/10/2026','13/10/2026','16/10/2026','19/10/2026','22/10/2026','26/10/2026'], [2,3,5,5,4,6,4,5,5,7,7,7]),
 'davi': (['07/08/2026','14/08/2026','11/09/2026','02/10/2026','05/10/2026','08/10/2026','10/10/2026','13/10/2026','16/10/2026','19/10/2026','22/10/2026','26/10/2026'], [3,2,3,4,6,5,5,6,5,5,5,5]),
 'victor': (['07/08/2026','14/08/2026','11/09/2026','02/10/2026','05/10/2026','08/10/2026','10/10/2026','13/10/2026','16/10/2026','22/10/2026','25/10/2026','26/10/2026'], [3,3,4,4,4,4,6,7,5,6,5,6]),
 'marcelo': (['07/08/2026','14/08/2026','21/08/2026','04/09/2026','18/09/2026','02/10/2026','05/10/2026','08/10/2026','13/10/2026','16/10/2026','22/10/2026','26/10/2026'], [5,5,4,6,5,5,5,4,3,4,4,3]),
 'akiane': (['07/08/2026','14/08/2026','04/09/2026','18/09/2026','02/10/2026','05/10/2026','08/10/2026','13/10/2026','19/10/2026','22/10/2026','25/10/2026','26/10/2026'], [4,4,4,4,4,5,5,5,6,5,5,5]),
}

def mark(cell, index):
 choices = cell.findall('w:tbl', NS)
 fill(tc(choices[index], 0, 0), 'X')
 assert sum(''.join(tc(choice, 0, 0).xpath('.//w:t/text()', namespaces=NS)) == 'X' for choice in choices) == 1

def text(p):return ''.join(p.xpath('.//w:t/text()',namespaces=NS))
def run(p,value):
 r=E.SubElement(p,W+'r');parts=str(value).split('\n')
 for i,part in enumerate(parts):
  if i:E.SubElement(r,W+'br')
  t=E.SubElement(r,W+'t');t.set('{http://www.w3.org/XML/1998/namespace}space','preserve');t.text=part

def fill(cell,value):
 ps=cell.findall('w:p',NS);empty=[p for p in ps if not text(p).strip()]
 if not ps:raise ValueError('Modelo sem parágrafo de preenchimento')
 run((empty[-1] if cell.findall('w:tbl',NS) else empty[0]) if empty else ps[-1],value)
def inline(cell,value):
 ps=cell.findall('w:p',NS);run(ps[0],' '+value)
def tc(table,row,col=0):return table.findall('w:tr',NS)[row].findall('w:tc',NS)[col]
def field(cell,label,value):
 ps=[p for p in cell.findall('w:p',NS)if text(p).strip().startswith(label)]
 if not ps:raise ValueError('Campo ausente: '+label)
 run(ps[0],' '+value)

with ZipFile(TEMPLATE)as zin:
 original={n:zin.read(n)for n in zin.namelist()};infos=zin.infolist()
 xml=E.fromstring(original['word/document.xml']);base_tables=xml.find('w:body',NS).findall('w:tbl',NS)
 stats={'original_sha256':hashlib.sha256(TEMPLATE.read_bytes()).hexdigest(),'relatorios':[]}
 original_texts=xml.xpath('//w:t/text()',namespaces=NS)
 for person in people:
  dates,hours=SCHEDULES[person['slug']];total_hours=sum(hours)
  assert len(dates)==len(hours)==len(person['atividades'])
  x=deepcopy(xml);tables=x.find('w:body',NS).findall('w:tbl',NS);t=tables[0]
  inline(tc(t,0),': Centro de Ciências Exatas, Ambientais e de Tecnologias')
  inline(tc(t,1),'Engenharia da Computação')
  inline(tc(t,2),'PI - Desenvolvimento de Sistemas Web');inline(tc(t,2,1),'218040')
  inline(tc(t,3),f' {total_hours} h')
  for col,value in enumerate([0,0,total_hours,0],1):fill(tc(t,3,col),f'{value} h')
  inline(tc(t,4),'Fernando Luiz de Almeida Silveira');inline(tc(t,5),person['nome']);inline(tc(t,6),person['ra'])
  mark(tc(t,7),2)
  fill(tc(t,7),'PIE III selecionado pelo foco em educação alimentar e saúde; validar com o docente. Versão para conferência: cronograma e horas propostos, não comprovados. A CH indicada não substitui a carga curricular oficial.')
  mark(tc(t,8),5)
  field(tc(t,8),'Docente extensionista responsável pelo projeto:','Não se aplica: nenhuma articulação institucional informada.')
  field(tc(t,8),'Nome do projeto:','Não se aplica a projeto institucional de extensão informado.')
  fill(tc(t,8),'Nenhum dos apoios institucionais listados foi informado. A distribuição proposta de CH considera trabalho autônomo. Zero indica que não foram informadas horas supervisionadas ou comunitárias comprovadas.')
  fill(tc(tables[1],1),'NutriVibe: desenvolvimento de recurso digital de educação alimentar e organização de registros alimentares — versão para conferência com cronograma proposto')
  inline(tc(tables[2],1),'Sem parceiro externo formalizado nos registros disponíveis. Público-alvo: responsáveis e crianças com seletividade alimentar.')
  mark(tc(tables[2],2),6)
  field(tc(tables[2],2),'Especifique:','Sem parceiro externo formalizado nesta etapa.')
  fill(tc(tables[2],2),'Outra: não se aplica à fase interna documentada; não há entidade externa identificada. A escolha não indica atendimento comunitário já realizado.')
  fill(tc(tables[2],3),'Público-alvo previsto: responsáveis e crianças com seletividade alimentar. A participação externa efetiva não foi informada; o público-alvo não é apresentado como público já atendido.')
  participants=tc(tables[3],1).findall('w:tbl',NS)
  fill(tc(participants[0],0,1),'1')
  fill(tc(participants[1],0,1),'5');fill(tc(participants[1],1,1),'0')
  fill(tc(tables[3],1),'Contagem dos vínculos identificados: 1 docente responsável e 5 estudantes. Não é lista de presença; nenhum técnico foi informado.')
  inline(tc(tables[3],2),'0 participantes externos documentados.')
  inline(tc(tables[3],3),'6 pessoas identificadas: 1 docente responsável e 5 estudantes; sem presença externa documentada.')
  mark(tc(tables[4],1),7)
  field(tc(tables[4],1),'Especifique:','Não se aplica: sem interlocução externa documentada.')
  fill(tc(tables[4],1),'Outra: não se aplica nesta etapa; pesquisa documental e organização interna, sem interlocução externa documentada. Não houve indicação de reunião, entrevista ou validação externa realizada.')
  fill(tc(tables[4],2),'Não foram informadas datas, participantes ou evidências de contato com comunidade externa. A apresentação online e os testes técnicos não substituem interlocução comunitária. Este campo deve ser completado pelo estudante com ações efetivamente realizadas e seus registros.')
  mark(tc(tables[5],1),5)
  field(tc(tables[5],1),'Especifique:','Desenvolvimento interno preparatório, sem ação externa documentada.')
  fill(tc(tables[5],1),'Outra: desenvolvimento interno preparatório de recurso digital educativo. Não há ação com comunidade externa documentada. A alternativa de desenvolvimento em resposta a demandas externas não foi marcada porque essa interlocução não está comprovada.')
  fill(tc(tables[6],1),'O NutriVibe é um projeto acadêmico iniciado em agosto, com implementação do aplicativo concentrada em outubro, conforme informação da equipe. Foram organizadas uma landing page e uma aplicação em HTML, CSS e JavaScript. O fluxo inclui perfil, preferências, registro alimentar, resumo e conteúdo educativo. A solução evoluiu para estimativa nutricional com referências TACO, processamento local de fotos, regras de sugestões e publicação na Vercel com contatos no Neon. O foco é apoio educativo, sem diagnóstico ou prescrição.')
  fill(tc(tables[6],2),'1. Desenvolver uma interface de educação alimentar compreensível.\n2. Organizar registros por refeição e dia.\n3. Considerar restrições e preferências nas sugestões.\n4. Apresentar estimativas com referência e peso confirmados.\n5. Avaliar o funcionamento e documentar limites, fontes e pendências.')
  fill(tc(tables[7],1),'Não foram disponibilizados relatos ou registros de participação da comunidade externa. Não se atribuem ao público demandas ou feedbacks que não estejam documentados. A contribuição externa deverá ser descrita após confirmação pelo estudante e pelo docente.')
  fill(tc(tables[7],2),person['participacao'])
  activitycell=tc(tables[8],1);grid=activitycell.findall('w:tbl',NS)[0]
  estimated_rows=[]
  for idx,((period,activity),date,hour)in enumerate(zip(person['atividades'],dates,hours),1):
   fill(tc(grid,idx,0),date+'');fill(tc(grid,idx,1),activity);fill(tc(grid,idx,2),str(hour)+' h')
   estimated_rows.append({'data_estimada':date,'atividade':activity,'horas_estimadas':hour,'natureza':'Estimativa para revisão individual; não é apontamento comprovado'})
  for idx in range(len(estimated_rows)+1,len(grid.findall('w:tr',NS))):
   for col in range(3):fill(tc(grid,idx,col),'—')
  total=activitycell.findall('w:tbl',NS)[1];fill(tc(total,0,1),str(total_hours))
  fill(activitycell,f'CRONOGRAMA PROPOSTO PARA CONFERÊNCIA: {total_hours} h. Datas e horas não comprovadas, organizadas para revisão individual. Início em agosto e implementação do aplicativo em outubro. A proposta não comprova presença ou horas de extensão comunitária; conferir com os registros reais antes da entrega.')
  fill(tc(tables[9],1),'Produtos do grupo: landing page com cadastro consentido de contatos; aplicativo com perfil, filtros, diário, resumo, educação e backup local; recorte TACO com 43 referências e cálculo por peso; reconhecimento local SigLIP selecionado após comparação com MobileNet e CLIP; código organizado e publicado. Na amostra de 148 imagens, houve 94 acertos do alimento/prato principal entre 108 fotos de comida (87%) e 40/50 na segunda coleta (80%). Foram executados 25 testes automatizados e verificações em Chromium, inclusive em 360, 768 e 1280 pixels.')
  fill(tc(tables[9],2),'Não há dados fornecidos que comprovem impactos mensurados ou validação com comunidade externa. Como benefício potencial, o recurso pode apoiar organização de registros e acesso a conteúdo educativo. Não se afirma melhora clínica, mudança de hábitos ou satisfação dos participantes. Esses efeitos dependem de avaliação com usuários, revisão profissional e evidências de interlocução.')
  fill(tc(tables[10],1),person['reflexao'])
  for idx,(desc,url)in enumerate(person['evidencias'],1):
   cell=tc(tables[11],idx)
   full=url if url.startswith('https://')else'https://github.com/huezinho/projeto/tree/main/NutriVibe/'+url
   field(cell,'Descrição:',desc);field(cell,'Anexo ou link:',full);field(cell,'Data (se aplicável):','26/10/2026: data proposta para organização e conferência das evidências.')
  # Verificação de preservação: todas as partes originais, salvo o texto preenchido, permanecem idênticas.
  assert len(x.xpath('//w:tbl',namespaces=NS))==len(xml.xpath('//w:tbl',namespaces=NS))
  assert len(x.xpath('//w:tr',namespaces=NS))==len(xml.xpath('//w:tr',namespaces=NS))
  assert E.tostring(x.find('w:body/w:sectPr',NS))==E.tostring(xml.find('w:body/w:sectPr',NS))
  new_texts=x.xpath('//w:t/text()',namespaces=NS);iterator=iter(new_texts)
  assert all(any(item==wanted for item in iterator)for wanted in original_texts)
  outdir=BASE/person['slug'];outdir.mkdir(parents=True,exist_ok=True);out=outdir/f"relatorio-{person['slug']}-nutrivibe.docx"
  with ZipFile(out,'w')as zout:
   for info in infos:zout.writestr(info,E.tostring(x,encoding='UTF-8',xml_declaration=True,standalone=True)if info.filename=='word/document.xml'else original[info.filename])
  with ZipFile(out)as check:
   assert all(check.read(n)==data for n,data in original.items()if n!='word/document.xml')
  with (outdir/'atividades-estimadas.csv').open('w',encoding='utf-8-sig',newline='') as csvfile:
   writer=csv.DictWriter(csvfile,fieldnames=estimated_rows[0].keys(),lineterminator='\n');writer.writeheader();writer.writerows(estimated_rows)
  stats['relatorios'].append({'estudante':person['nome'],'frente':person['frente'],'arquivo':str(out.relative_to(ROOT)),'partes_alteradas':['word/document.xml'],'tabelas_preservadas':len(x.xpath('//w:tbl',namespaces=NS)),'linhas_preservadas':len(x.xpath('//w:tr',namespaces=NS)),'datas_e_horas':'estimativas para revisão individual, não apontamentos comprovados','total_horas_estimadas':total_hours,'marcacoes':{'PIE':'III - Saúde e Meio Ambiente','apoio':'Nenhuma das opções anteriores','parceiro':'Outra: sem parceiro formalizado','interlocucao':'Outra: não se aplica à fase interna documentada','acao_externa':'Outra: desenvolvimento interno preparatório, sem ação externa documentada'}})
 (BASE/'verificacao-modelo.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2))
print('Gerados cinco relatórios com estrutura e partes do modelo preservadas.')
