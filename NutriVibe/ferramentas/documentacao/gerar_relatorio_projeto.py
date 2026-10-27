"""Redige o relatório do projeto a partir do modelo, sem conservar listas vazias."""
from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile
import sys
from docx import Document
from docx.shared import Pt, Inches
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
ROOT=Path(__file__).resolve().parents[2]
MODEL=Path(sys.argv[1]);OUT=ROOT/'documentacoes/relatorio-projeto';OUT.mkdir(exist_ok=True)
doc=Document(MODEL);original=list(doc.paragraphs)
headings=[deepcopy(original[i]._p)for i in [18,32,47,64,74,93,113,125,139]]
cover={0:'PROJETO: NutriVibe',4:'Turma: a confirmar',7:'Nome do Grupo: NutriVibe',8:'Paulo Capreti — RA: 26028858',9:'Davi Pioli — RA: 26005199',10:'Victor Almeida — RA: 26003836',11:'Marcelo Dalbone — RA: 25001986',12:'Akiane Merbach — RA: 26027003'}
for i,text in cover.items():
 p=original[i];r=p.runs[0]if p.runs else p.add_run();r.text=text
 for rr in p.runs[1:]:rr.text=''
# Mantém capa, estilos, cabeçalhos, rodapés e configuração de página do original.
for p in original[18:]:p._p.getparent().remove(p._p)
for p in doc.paragraphs:
 for n in p._p.xpath('./w:pPr/w:numPr'):n.getparent().remove(n)

def para(text):
 p=doc.add_paragraph(text);p.paragraph_format.space_after=Pt(8);p.paragraph_format.line_spacing=1.15
 p.paragraph_format.widow_control=True
 return p

def title(index):
 el=deepcopy(headings[index]);doc._body._body.insert(len(doc._body._body)-1,el)
 pp=el.find(qn('w:pPr'))
 if pp is None:pp=OxmlElement('w:pPr');el.insert(0,pp)
 for tag in ['numPr','pageBreakBefore','keepNext']:
  for c in pp.findall(qn('w:'+tag)):pp.remove(c)
 if index==0:pp.append(OxmlElement('w:pageBreakBefore'))
 else:
  spacing=pp.find(qn('w:spacing'))
  if spacing is None:spacing=OxmlElement('w:spacing');pp.append(spacing)
  spacing.set(qn('w:before'),'280')
 pp.append(OxmlElement('w:keepNext'))

def sub(text):
 p=doc.add_paragraph();p.paragraph_format.keep_with_next=True;p.paragraph_format.space_before=Pt(10)
 r=p.add_run(text);r.bold=True

def table(headers,rows):
 t=doc.add_table(rows=1,cols=len(headers))
 borders=OxmlElement('w:tblBorders')
 for edge in ['top','left','bottom','right','insideH','insideV']:
  border=OxmlElement('w:'+edge);border.set(qn('w:val'),'single');border.set(qn('w:sz'),'4');border.set(qn('w:color'),'A0A0A0');borders.append(border)
 t._tbl.tblPr.append(borders)
 for c,text in zip(t.rows[0].cells,headers):c.text=text
 repeat=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(repeat)
 for r in t.rows[0].cells:
  for run in r.paragraphs[0].runs:run.bold=True
 for row in rows:
  cells=t.add_row().cells
  for c,text in zip(cells,row):c.text=text
 for idx,row in enumerate(t.rows):
  no=OxmlElement('w:cantSplit');row._tr.get_or_add_trPr().append(no)
  for c in row.cells:
   for p in c.paragraphs:
    p.paragraph_format.space_after=Pt(4)
    if len(t.rows)<=7 and idx<len(t.rows)-1:p.paragraph_format.keep_with_next=True
    for r in p.runs:r.font.size=Pt(10)
 doc.add_paragraph()

def image(name,caption,width=5.7):
 p=doc.add_paragraph();p.paragraph_format.keep_with_next=True;p.add_run().add_picture(str(ROOT/'documentacoes/evidencias'/name),width=Inches(width))
 p=doc.add_paragraph(caption);p.paragraph_format.space_after=Pt(10)
 for r in p.runs:r.font.size=Pt(9);r.italic=True

def code(path,start,end):
 para(f'Trecho de {path}, linhas {start}–{end}:')
 text='\n'.join((ROOT/path).read_text().splitlines()[start-1:end]);p=doc.add_paragraph()
 for i,line in enumerate(text.splitlines()):
  r=p.add_run(('\n'if i else'')+line);r.font.name='Consolas';r.font.size=Pt(9)

title(0)
sub('Problema, público e contexto')
para('O NutriVibe foi concebido para apoiar a organização da alimentação e a exploração de variedade alimentar, respeitando restrições e seletividade. Na rotina familiar, responsáveis podem encontrar dificuldade para registrar o que foi consumido, reconhecer padrões e apresentar novas possibilidades sem desconsiderar cores, texturas ou alimentos recusados. O projeto reúne essas informações em uma interface acessível pelo navegador.')
para('O público-alvo previsto são responsáveis e crianças, especialmente famílias que enfrentam seletividade alimentar. O setor impactado é o de educação e promoção da saúde no cotidiano. A identificação desse público orienta o produto; não representa uma população já atendida ou uma pesquisa de campo concluída. O projeto não realiza diagnóstico, tratamento ou prescrição de dieta.')
sub('Solução e valor entregue')
para('A solução é composta por uma landing page e um aplicativo Web separado. A primeira apresenta a proposta e recebe contatos com consentimento. O aplicativo permite cadastrar preferências, registrar alimentos por refeição e data, consultar o resumo diário e explorar sugestões compatíveis com o perfil. A foto é uma alternativa de entrada: o usuário confirma ou corrige o alimento, escolhe a referência nutricional e informa o peso antes do cálculo.')
para('O valor entregue é reduzir a dispersão das informações e tornar o acompanhamento diário compreensível. A recomendação procura ampliar a variedade de grupos alimentares registrados, sem afirmar que a ausência de um grupo demonstra deficiência nutricional. A estimativa de nutrientes apresenta referências e limitações, em vez de deduzir ingredientes ou gramas pela aparência de uma foto.')
sub('Relação com os Objetivos de Desenvolvimento Sustentável')
para('O ODS 3 — Saúde e Bem-Estar — relaciona-se ao apoio educativo e à organização de informações alimentares. O ODS 12 — Consumo e Produção Responsáveis — aparece nos conteúdos sobre planejamento e redução de desperdício. Esses vínculos expressam a finalidade da proposta; benefícios clínicos, mudanças de hábito e redução efetiva de desperdício ainda dependem de avaliação com usuários.')
sub('Viabilidade no semestre')
para('Conforme informado pela equipe, o projeto começou em agosto de 2026, com implementação do aplicativo concentrada em outubro. A viabilidade foi favorecida pelo uso de HTML, CSS e JavaScript, catálogo delimitado, módulos reutilizáveis e entregas incrementais. O resultado atual inclui publicação na Vercel e persistência de contatos no Neon, mantendo os registros alimentares no navegador.')

title(1)
sub('Das telas iniciais à interface navegável')
para('A representação visual evoluiu para páginas implementadas. A landing page concentra apresentação do problema, solução, funcionalidades e formulário. O aplicativo adota uma organização própria de ferramenta: navegação lateral no computador, painel do dia e controles de registro. As cores verde e amarelo identificam a marca; fundos sólidos e hierarquia tipográfica mantêm legibilidade. A logo é utilizada com transparência e margens reduzidas.')
table(['Tela','Interação principal','Resultado esperado'],[
('Visão geral','Consultar indicadores e registros de hoje; abrir o diário.','Entender o estado atual sem percorrer todas as páginas.'),
('Preferências','Informar nome, restrições, cores, texturas e alimentos evitados.','Orientar filtros e sugestões de acordo com o perfil.'),
('Diário alimentar','Selecionar dia/refeição; buscar alimento ou usar foto; confirmar peso.','Registrar uma entrada coerente e editável por remoção.'),
('Meu dia','Escolher data e consultar grupos, nutrientes e sugestões.','Acompanhar apenas o dia selecionado e reconhecer dados ausentes.'),
('Aprender','Consultar conteúdos e perguntas frequentes.','Compreender cuidados e limites de uso.')])
para('Fluxo principal: Preferências → Diário alimentar → seleção ou identificação → confirmação de referência e peso → registro → Meu dia. Quando o reconhecimento não oferece resultado aceitável, o usuário informa o alimento pelo catálogo ou por nome. Um prato composto não é convertido automaticamente em ingredientes ou valores nutricionais presumidos.')
image('visao-geral-1280.png','Figura 1 — Visão geral do aplicativo em 1280 pixels. Captura do fluxo técnico de teste; os dados apresentados pertencem ao cenário de validação.')
para('As versões móveis também estão documentadas nas capturas visao-geral-360.png e recomendacoes-360.png, na pasta de evidências do projeto. As imagens completas permitem conferir a disposição vertical sem reduzir o conteúdo a uma reprodução ilegível neste relatório.')
para('A solução foi projetada para Web responsiva. No celular, o menu concentra a navegação e os cartões se reorganizam; no computador, a navegação lateral separa o espaço de trabalho da página de apresentação. As capturas são evidências da interface implementada, não substituem testes de usabilidade com público externo.')

title(2)
sub('Backlog e priorização')
para('O planejamento utiliza o backlog exportado do Jira, com tarefas TRAB-26 a TRAB-57, preservado em documentacoes/historico/backlog-jira.json. As etapas S1, S2 e S3 organizam incrementos por etiquetas; não há confirmação de sprints nativas criadas na ferramenta. A ordem de implementação considera dependências: estrutura e identidade, preferências, diário, resumo, reconhecimento, integração e validação.')
para('O escopo acadêmico inicial do backlog previa frontend em HTML, CSS e JavaScript, sem backend e banco obrigatórios. Posteriormente, a solicitação do projeto foi ampliada para publicação, contatos persistentes e análise de fotos. Assim, Node.js e Neon são ampliações da solução entregue, e não requisitos atribuídos retroativamente ao backlog original. O enquadramento dessa ampliação na entrega acadêmica deve ser alinhado com o docente.')
table(['Prioridade','Entrega','Critério de conclusão'],[
('Essencial','Perfil, restrições e persistência.','Preferências salvas e recarregadas; importação inválida rejeitada.'),
('Essencial','Registro por data/refeição e remoção.','Entrada aparece no dia correto e pode ser removida.'),
('Essencial','Resumo e recomendações.','Grupos e registros do dia corretos; conflitos excluídos.'),
('Complementar implementada','Foto e nutrição confirmada.','Recusa/correção possíveis; peso e referência validados.'),
('Complementar implementada','Landing page, contatos e publicação.','Consentimento validado e gravação persistente pelo servidor.')])
sub('Responsabilidades')
table(['Integrante','Frente de trabalho'],[('Paulo Capreti','JavaScript e interações do aplicativo.'),('Davi Pioli','HTML e acompanhamento do Kanban.'),('Victor Almeida','CSS, responsividade e identidade visual.'),('Marcelo Dalbone','Pesquisas e apoio à contextualização e aos requisitos.'),('Akiane Merbach','Pesquisas e apoio às referências alimentares e limitações técnicas.')])
sub('Scrum e Kanban')
para('O Scrum orienta a entrega em incrementos verificáveis, revisão do resultado e adaptação do próximo ciclo. O Kanban torna tarefas, responsáveis e bloqueios visíveis. O quadro abaixo sintetiza o acompanhamento proposto a partir das evidências do repositório; não é uma reprodução dos status atuais do Jira.')
table(['A Fazer','Em Andamento','Concluído tecnicamente'],[('Validação com usuários e profissionais; ampliar fotos e aparelhos de teste.','Revisão do relatório e conferência da apresentação acadêmica.','Fluxo perfil/diário/resumo, reconhecimento com confirmação, contatos e publicação.')])
para('A conclusão de uma tarefa deve exigir código funcional e evidência de verificação. Separar desenvolvimento técnico, revisão documental e avaliação externa evita atribuir a uma funcionalidade pronta um impacto social ainda não medido. As próximas etapas priorizam validação do produto e revisão das limitações antes da expansão do escopo.')

title(3)
sub('Requisitos funcionais')
table(['ID','Requisito','Condição verificável'],[
('RF01','Cadastrar perfil e preferências.','Salvar e recuperar restrições, cores, texturas e alimentos evitados.'),
('RF02','Registrar e remover alimentos.','Relacionar entrada a data/refeição e refletir a remoção no diário.'),
('RF03','Pesquisar e filtrar catálogo.','Aceitar busca sem acentos e apresentar estado vazio quando necessário.'),
('RF04','Identificar alimento por foto.','Permitir recusa, confirmação e correção manual.'),
('RF05','Calcular nutrientes.','Exigir referência compatível e peso válido.'),
('RF06','Exibir resumo e sugestões.','Usar o dia selecionado e excluir opções incompatíveis.'),
('RF07','Gerenciar backup local.','Exportar JSON, validar importação e apagar dados mediante confirmação.'),
('RF08','Apresentar conteúdo educativo.','Oferecer orientações e explicar os limites da aplicação.'),
('RF09','Receber contatos na landing page.','Validar nome, e-mail e consentimento antes da persistência.')])
sub('Requisitos não funcionais')
table(['Área','Condição adotada'],[('Usabilidade','Rótulos, foco visível, mensagens de erro e navegação responsiva.'),('Segurança','Segredos no servidor; validação de origem, corpo e entradas; SQL parametrizado.'),('Confiabilidade','Tratamento de falhas de rede/armazenamento e recusa de identificação incerta.'),('Rastreabilidade','Referências TACO, origem dos modelos e resultados de avaliação documentados.'),('Compatibilidade','Navegador com JavaScript e WebAssembly; Node.js 24 para o servidor.'),('Privacidade','Diário no navegador e separação entre dados alimentares e contatos remotos.')])
sub('Regras de negócio e restrições')
para('RN01: sugestões consideram somente a data selecionada e não relaxam restrições para completar a lista. RN02: alimentos confirmados e referências nutricionais precisam ser compatíveis. RN03: o peso deve ser numérico, positivo e não superior a 5000 g por registro calculado. RN04: nutriente ausente permanece não informado; ausência não equivale a zero. RN05: contato exige consentimento explícito.')
para('O catálogo é delimitado, a foto não confirma alergênicos ou ingredientes ocultos e a qualidade varia conforme cena e alimento. Não há autenticação ou sincronização remota do diário. O primeiro reconhecimento requer download volumoso. As recomendações apoiam variedade; não prescrevem quantidades nem diagnosticam deficiências. Esses limites integram os requisitos de transparência da solução.')

title(4)
sub('Arquitetura e organização')
para('O frontend foi desenvolvido com HTML semântico, CSS e JavaScript modular. O backend Node.js atende serviços HTTP; a Vercel hospeda os arquivos públicos e a função serverless. A análise principal de fotos ocorre no navegador com SigLIP quantizado e ONNX Runtime Web. A integração com PostgreSQL/Neon é destinada aos contatos da landing page.')
table(['Pasta/arquivo','Responsabilidade'],[('html e css','Páginas e estilos separados para landing page e aplicativo.'),('javascript/aplicativo/app.js','Eventos, renderização, estado e integração dos fluxos.'),('engine.js e store.js','Regras de recomendação; validação e persistência local.'),('nutrition.js e dados/nutricao.js','Cálculo proporcional e referências TACO.'),('vision-local-entry.js e vision-semantic-policy.js','Execução visual local, ranking, limiares e recusa.'),('servidor e api/index.mjs','Handler HTTP, contatos e adaptação serverless.'),('ferramentas, testes e documentacoes','Preparação de artefatos, verificações e evidências.')])
sub('Funcionamento do JavaScript')
code('javascript/aplicativo/engine.js',29,31)
para('O filtro isola a data solicitada antes de produzir totais e sugestões. A recomendação elimina incompatibilidades e alimentos já consumidos; prioriza grupos ausentes e considera preferências. Os módulos separam regras da tela, permitindo testes sem depender de clique manual para cada cenário.')
code('javascript/aplicativo/store.js',79,82)
para('O estado é validado, convertido em JSON e salvo na chave nutrivibe-v2 do localStorage. A importação exige estrutura válida e rejeita registros inconsistentes. A tela só sinaliza sucesso depois da persistência; em erro de leitura, o código evita sobrescrever dados que não conseguiu recuperar.')
sub('Reconhecimento e estimativa nutricional')
para('O modelo transforma a imagem em um vetor visual e compara sua similaridade com classes de alimentos, pratos e controles negativos. Limiares de score e margem podem levar à recusa e à entrada manual. O resultado é uma hipótese a confirmar, não uma probabilidade clínica. O cálculo nutricional é posterior: o usuário confirma referência TACO e gramas.')
para('A regra de cálculo é valor consumido = valor da referência × gramas informadas ÷ gramas-base. Por exemplo, 150 g representam 1,5 vez uma referência expressa por 100 g. O recorte utilizado contém 43 referências com preparo e proveniência. Dados ausentes permanecem nulos e o resumo informa cobertura parcial.')
sub('Backend, API e modelagem do banco')
para('GET /api/status informa disponibilidade dos serviços. POST /api/contacts valida e grava nome, e-mail e consentimento. POST /api/identify mantém o adaptador remoto opcional; a configuração atual browser-local executa a identificação no aparelho. OpenAI e Vercel AI Gateway são alternativas dependentes de credenciais/créditos, não o motor gratuito atual.')
table(['Campo de contacts','Tipo e regra'],[('email','TEXT, chave primária; identifica contato sem duplicar a mesma chave.'),('name','TEXT NOT NULL; nome validado pelo servidor.'),('consent_at','TEXT NOT NULL; data/hora ISO do consentimento registrada pelo servidor.')])
para('A gravação utiliza parâmetros SQL e atualiza o contato quando o e-mail já existe. Na nuvem, a conexão é obtida do ambiente e aponta para o banco separado nutrivibe-production. Sem PostgreSQL, o modo local utiliza SQLite. O diário e as preferências não são gravados nessa tabela: permanecem no navegador. Credenciais não integram arquivos públicos ou documentos de entrega.')
para('Foram concluídos os fluxos de perfil, catálogo, diário, resumo, backup, educação, contato e reconhecimento confirmado. As telas foram diferenciadas visualmente e publicadas. Contas, sincronização, gamificação completa e avaliação externa permanecem como evoluções, sem serem apresentadas como funcionalidades entregues.')

title(5)
sub('Estratégia de validação')
para('A validação combina testes automatizados das regras, integração do servidor, fluxo ponta a ponta e avaliação comparativa de reconhecimento. A finalidade é verificar comportamento esperado, identificar entradas inválidas e registrar limites. As evidências de execução pertencem às revisões técnicas já realizadas; não constituem pesquisa com usuários externos.')
table(['Tipo e caso','Finalidade','Resultado registrado'],[
('Regras: lactose, cor verde e outros filtros.','Impedir sugestões incompatíveis e não relaxar restrições.','Cenários automatizados aprovados.'),
('Nutrição: referência, peso e ausências.','Validar proporcionalidade e evitar zero para valor desconhecido.','Cálculos e rejeições previstos aprovados.'),
('Persistência e importação JSON.','Preservar estado e rejeitar estrutura/registros inválidos.','Validação e fluxos de backup aprovados.'),
('Integração: handler e banco.','Conferir roteamento, SQL parametrizado e ausência de fallback efêmero em nuvem.','Testes de integração aprovados.'),
('Chromium: registro e resumo.','Confirmar dados após recarga, remoção, foto e cálculo.','Fluxo ponta a ponta aprovado.'),
('Interface: 360, 768 e 1280 pixels.','Verificar navegação, links locais e transbordamento.','Cinco telas verificadas sem transbordamento nos cenários.'),
('Reconhecimento: fotos e controles negativos.','Medir erros, recusas e diferenças entre alternativas.','SigLIP selecionado; limitações registradas.')])
para('A suíte Node.js registrou 25 testes aprovados. O fluxo Chromium também verificou contatos, preferências, busca, importação/exportação e menu móvel. Um caso concreto registra Banana com referência TACO e 100 g, recarrega a página e confere a presença no diário e o valor de 98,2 kcal no resumo. Outro caso busca por texto sem acento, verificando a recuperação de Maçã.')
sub('Avaliação de fotos e correções')
para('Foram comparados MobileNet, CLIP e SigLIP. Para o modelo selecionado, a avaliação documentada reuniu 148 imagens: 108 fotos de alimentos/pratos e 40 controles negativos. Houve 94 acertos do alimento/prato principal entre as 108 fotos de comida, aproximadamente 87%; na coleta adicional de 50 fotos de comida, houve 40 acertos, ou 80%. São resultados de amostra, sem garantia de acerto em fotos novas.')
para('Os erros incluíram plantas e folhas confundidas com comida. As correções adotadas foram recusa por classe negativa/score/margem, confirmação obrigatória e correção manual. Pratos compostos não recebem ingredientes ou nutrientes presumidos. Valores sem referência continuam ausentes. O diário permanece utilizável pelo catálogo quando a foto falha.')
para('Os scripts estão em testes/; as capturas, em documentacoes/evidencias/; os manifestos, fontes e resultados por imagem, em documentacoes/avaliacao-imagens/. Não foi documentada uma avaliação de usabilidade com comunidade externa. A validação técnica não comprova aceitação, impacto clínico ou mudança de hábitos.')

title(6)
sub('Acesso à versão publicada')
para('Landing page: https://nutrivibe-gamma.vercel.app . Aplicativo: https://nutrivibe-gamma.vercel.app/app . A implantação foi realizada na Vercel, com serviços de contato persistidos em Neon. A disponibilidade depende da conectividade e dos serviços utilizados; não foi definido acordo de nível de serviço.')
sub('Execução local')
para('Pré-requisitos: Node.js 24, npm e navegador atualizado com JavaScript e WebAssembly. Na raiz do repositório, executar os comandos abaixo. O build prepara recursos públicos e verifica/prepara os artefatos do reconhecimento; em máquina nova, requer internet para instalação e download.')
for cmd,explanation in [('npm ci','Instala as versões fixadas no package-lock.json.'),('npm run build','Prepara public, o modelo e o bundle visual.'),('npm test','Executa a suíte automatizada Node.js.'),('npm start','Inicia o servidor local na porta padrão 8080.')]:para(cmd+' — '+explanation)
para('Abrir http://localhost:8080 para a apresentação e http://localhost:8080/html/aplicativo/index.html para o aplicativo. O uso por file:// não é adequado, pois módulos, fetch e caminhos de modelo dependem de um servidor HTTP.')
sub('Configuração e requisitos operacionais')
para('NUTRIVIBE_VISION_PROVIDER=browser-local seleciona o reconhecimento local. POSTGRES_URL ou DATABASE_URL define a conexão PostgreSQL. As variáveis são configuradas no ambiente do processo/provedor; não há carregamento automático de arquivo .env pelo código atual. Sem banco remoto, o servidor local usa SQLite; na nuvem, a ausência de persistência configurada não é substituída por arquivo temporário.')
para('Na Vercel, o build gera public e api/index.mjs exporta o handler serverless. vercel.json define redirecionamentos, rotas, cache dos modelos e cabeçalhos. O primeiro reconhecimento exige aproximadamente 112 MB; as fotos são processadas no aparelho nesse modo. O usuário deve manter backup do diário se pretende limpar o navegador ou trocar de dispositivo.')

title(7)
sub('Limitações e prioridades de evolução')
table(['Prioridade','Evolução','Motivo'],[('Alta','Avaliação com responsáveis, profissionais e docente.','Validar necessidades, linguagem, utilidade e limites do produto.'),('Alta','Fotos mais variadas e celulares reais.','Ampliar cobertura e medir falsos positivos, latência e consumo de memória.'),('Alta','Revisão de acessibilidade.','Verificar teclado, contraste e tecnologias assistivas além das checagens atuais.'),('Média','Redução do primeiro download.','Melhorar uso em conexões lentas e aparelhos com menos recursos.'),('Média','Ampliação de catálogo e preparações.','Atender situações reais sem atribuir nutrientes sem referência.'),('Planejada','Contas e sincronização.','Exigir autenticação, autorização, retenção e desenho de privacidade antes de persistir o diário remotamente.'),('Planejada','Gamificação e novos conteúdos.','Introduzir recursos educativos após validação de adequação ao público.')])
para('O reconhecimento não deve ser usado para garantir ausência de alergênicos ou identificar peso. Uma futura mudança de provedor exige comparação por qualidade, custo e privacidade. O limitador da API atual usa memória do processo: em infraestrutura serverless com múltiplas instâncias, um controle distribuído será necessário para uma política global de limitação.')
para('As evoluções devem manter correção manual, validação de entradas e rastreabilidade das fontes. A expansão do escopo não deve eliminar os cuidados que tornaram os resultados verificáveis: referência explícita, distinção entre hipótese e confirmação e comunicação de dados ausentes.')

title(8)
para('O NutriVibe evoluiu de uma proposta de educação alimentar para uma solução Web navegável, com apresentação e aplicativo separados. O produto organiza preferências, registros, resumo e sugestões em um fluxo coerente e oferece foto como apoio à entrada de dados, sem transformar reconhecimento visual em garantia de composição nutricional.')
para('Os principais resultados técnicos são o fluxo completo de perfil e diário, o cálculo proporcional com referências TACO, o backup local, o cadastro consentido de contatos no Neon, a publicação na Vercel e a seleção de um modelo após comparação documentada. Testes automatizados e no navegador forneceram evidências de funcionamento e revelaram limites incorporados ao tratamento de erros e à confirmação manual.')
para('A contribuição pretendida é facilitar a organização da rotina e o acesso a orientações de apoio, com respeito às preferências. O projeto não apresenta como concluídas melhorias clínicas, mudanças de hábitos ou impactos comunitários sem avaliação. O próximo passo é aproximar a solução dos usuários e profissionais para testar a utilidade real e orientar sua continuidade.')
para('Para o grupo, a experiência articula programação, estruturação de páginas, identidade visual, gestão de tarefas, pesquisa e análise crítica de resultados. A separação de responsabilidades favorece a colaboração, mas a qualidade depende da integração entre essas frentes. O repositório e as evidências permitem revisar decisões e distinguir o que foi implementado do que ainda precisa ser validado.')
sub('Fontes e evidências do projeto')
para('Repositório: https://github.com/huezinho/projeto . Backlog fornecido: documentacoes/historico/backlog-jira.json. Documento anterior: documentacoes/segunda-entrega/trabalho.pdf. Detalhamento técnico: documentacoes/implementacao.md e documentacoes/nutricao.md. Avaliação visual: documentacoes/avaliacao-imagens/README.md. Capturas: documentacoes/evidencias/. Os caminhos são relativos à pasta NutriVibe do repositório.')
# Não deixa orientações de preenchimento ou numeração vazia no documento final.
for p in doc.paragraphs:
 for n in p._p.xpath('./w:pPr/w:numPr'):n.getparent().remove(n)
 for r in p.runs:
  if r.font.size is None:r.font.size=Pt(11)
assert not doc._element.xpath('//w:numPr')
for h in headings:assert ''.join(h.itertext())
output=OUT/'NutriVibe_Preenchido.docx';doc.save(output)
print(output)
