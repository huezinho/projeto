"""Redige o relatório do projeto a partir do modelo, sem conservar listas vazias."""
from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile
import sys,json
from docx import Document
from docx.shared import Pt, Inches
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
ROOT=Path(__file__).resolve().parents[2]
MODEL=Path(sys.argv[1]);OUT=ROOT/'documentacoes/relatorio-projeto';OUT.mkdir(exist_ok=True)
doc=Document(MODEL);original=list(doc.paragraphs)
headings=[deepcopy(original[i]._p)for i in [18,32,47,64,74,93,113,125,139]]
cover={0:'PROJETO: NutriVibe',1:'3ª entrega — consolidação do front-end',4:'Turma: 101',7:'Nome do Grupo: NutriVibe',8:'Paulo Capreti — RA: 26028858',9:'Davi Pioli — RA: 26005199',10:'Victor Almeida — RA: 26003836',11:'Marcelo Dalbone — RA: 25001986',12:'Akiane Merbach — RA: 26027003'}
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
 if index in (0,8):pp.append(OxmlElement('w:pageBreakBefore'))
 else:
  spacing=pp.find(qn('w:spacing'))
  if spacing is None:spacing=OxmlElement('w:spacing');pp.append(spacing)
  spacing.set(qn('w:before'),'280')
 pp.append(OxmlElement('w:keepNext'))

def sub(text):
 p=doc.add_paragraph();p.paragraph_format.keep_with_next=True;p.paragraph_format.space_before=Pt(6)
 r=p.add_run(text);r.bold=True

def table(headers,rows):
 for row in rows:
  p=doc.add_paragraph();p.paragraph_format.space_after=Pt(6)
  r=p.add_run(str(row[0])+'. ');r.bold=True
  for index,value in enumerate(row[1:],1):
   p.add_run(headers[index]+': '+str(value)+(' 'if index<len(row)-1 else''))


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
sub('Recorte desta entrega')
para('Este relatório corresponde à terceira de cinco entregas do NutriVibe. A segunda entrega é a referência acadêmica anterior, com ideação, requisitos e representação inicial da solução. Nesta terceira etapa, o objetivo é comprovar evolução para um front-end navegável e interativo. A existência de funcionalidades em execução não encerra o projeto: ainda estão previstos dois ciclos de desenvolvimento, revisão e documentação, correspondentes à quarta e à quinta entregas.')
para('A proposta de agosto define cadastro do usuário e da criança, preferências e recusas alimentares, registro dos alimentos, informações nutricionais, análise dos registros, recomendações, conteúdos educativos e gamificação condicionada ao prazo. A terceira entrega exige telas funcionais, navegação, responsividade, interações JavaScript e evidências de execução. O código atual é a evidência técnica do incremento apresentado nesta etapa, e não uma declaração de que todas as funcionalidades da proposta inicial estão concluídas. As seções de testes, implantação e considerações finais descrevem o estágio parcial do trabalho.')
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
sub('Das telas da segunda entrega ao incremento da terceira')
para('Na segunda entrega, o protótipo permitia apresentar a organização e a identidade pretendidas. Na terceira, as principais telas estão representadas em HTML e CSS com navegação e interações JavaScript. As imagens desta seção mostram o incremento funcional atual. O protótipo continuará sendo atualizado nas próximas entregas para refletir o cadastro de responsável/criança e os refinamentos que forem implementados.')
para('A representação visual evoluiu para páginas implementadas. A landing page concentra apresentação do problema, solução, funcionalidades e formulário. O aplicativo adota uma organização própria de ferramenta: navegação lateral no computador, painel do dia e controles de registro. As cores verde e amarelo identificam a marca; fundos sólidos e hierarquia tipográfica mantêm legibilidade. A logo é utilizada com transparência e margens reduzidas.')
table(['Tela','Interação principal','Resultado esperado'],[
('Visão geral','Consultar indicadores e registros de hoje; abrir o diário.','Entender o estado atual sem percorrer todas as páginas.'),
('Preferências','Informar nome, restrições, cores, texturas e alimentos evitados.','Orientar filtros e sugestões de acordo com o perfil.'),
('Diário alimentar','Selecionar dia/refeição; buscar alimento ou usar foto; confirmar peso.','Registrar uma entrada coerente e editável por remoção.'),
('Meu dia','Escolher data e consultar grupos, nutrientes e sugestões.','Acompanhar apenas o dia selecionado e reconhecer dados ausentes.'),
('Aprender','Consultar conteúdos e perguntas frequentes.','Compreender cuidados e limites de uso.')])
para('Fluxo principal: Preferências → Diário alimentar → seleção ou identificação → confirmação de referência e peso → registro → Meu dia. Quando o reconhecimento não oferece resultado aceitável, o usuário informa o alimento pelo catálogo ou por nome. Um prato composto não é convertido automaticamente em ingredientes ou valores nutricionais presumidos.')
image('visao-geral-1280.png','Figura 1 — Visão geral do aplicativo em 1280 pixels. Captura do fluxo técnico de teste; os dados apresentados pertencem ao cenário de validação.')
para('Na versão móvel, o menu é acionado por botão; ao abrir, apresenta as páginas principais e pode ser fechado pela tecla Escape. Os indicadores são reorganizados em cartões e os controles continuam disponíveis na largura de 360 pixels.')
para('A solução foi projetada para Web responsiva. No celular, o menu concentra a navegação e os cartões se reorganizam; no computador, a navegação lateral separa o espaço de trabalho da página de apresentação. As capturas são evidências da interface implementada, não substituem testes de usabilidade com público externo.')

title(2)
sub('Backlog e priorização')
para('O backlog da terceira entrega contém 32 tarefas, de TRAB-26 a TRAB-57, organizadas em três etapas: S1 — Estrutura e navegação; S2 — JavaScript e fluxo funcional; S3 — Consolidação e apresentação. A relação a seguir reproduz os títulos das tarefas e suas prioridades no material fornecido, permitindo compreender o planejamento sem consultar o Jira.')
backlog=json.loads((ROOT/'documentacoes/historico/backlog-jira.json').read_text())
for stage in backlog['sprints']:
 sub(stage['id']+' — '+stage['name'])
 para('Meta: '+stage['goal'])
 for task in backlog['tasks']:
  if task['planned_sprint']==stage['id']:
   para(task['jira_key']+' — '+task['title']+'. Prioridade: '+({'Highest':'máxima','High':'alta','Medium':'média','Low':'baixa'}.get(task['priority'],task['priority']))+'.')
para('Os critérios comuns registrados para as funcionalidades são: comportamento demonstrável na aplicação em execução; interação funcional quando aplicável; navegação e estados de erro validados; layout legível em celular e desktop; evidência anexada ou vinculada. A definição de pronto é código integrado, sem erros bloqueantes no console, revisado, testado e com evidência real.')
para('As tarefas de documentação exigem material completo, revisado, consistente com a aplicação real, identificado e pronto para demonstração. Pendências e dificuldades devem ser relatadas sem inventar funcionalidades realizadas. As tarefas de planejamento preveem revisão das etiquetas, responsáveis, capacidade e impedimentos, demonstração do incremento e registro de melhorias. O fechamento exige revisão e evidências.')
para('No registro fornecido, as tarefas aparecem como A fazer; responsáveis e datas não foram definidos e as etapas são planejamento por etiquetas, sem sprints nativas confirmadas. Esses dados descrevem aquele registro e não afirmam que o código atual esteja sem implementação. A organização recomendada do quadro é A fazer, Em andamento, Revisão/Testes e Feito; o mínimo acadêmico pode ser representado por A Fazer, Em Andamento e Concluído.')
para('O escopo acadêmico inicial do backlog previa frontend em HTML, CSS e JavaScript, sem backend e banco obrigatórios. Posteriormente, a solicitação do projeto foi ampliada para publicação, contatos persistentes e análise de fotos. Assim, Node.js e Neon são ampliações da solução entregue, e não requisitos atribuídos retroativamente ao backlog original. O enquadramento dessa ampliação na entrega acadêmica deve ser alinhado com o docente.')
table(['Prioridade','Entrega','Critério de conclusão'],[
('Essencial','Perfil, restrições e persistência.','Preferências salvas e recarregadas; importação inválida rejeitada.'),
('Essencial','Registro por data/refeição e remoção.','Entrada aparece no dia correto e pode ser removida.'),
('Essencial','Resumo e recomendações.','Grupos e registros do dia corretos; conflitos excluídos.'),
('Complementar implementada','Foto e nutrição confirmada.','Recusa/correção possíveis; peso e referência validados.'),
('Complementar implementada','Landing page, contatos e publicação.','Consentimento validado e gravação persistente pelo servidor.')])
sub('Responsabilidades')
table(['Integrante','Frente de trabalho'],[('Paulo Capreti','JavaScript e interações do aplicativo.'),('Davi Pioli','HTML e acompanhamento do Kanban.'),('Victor Almeida','CSS, responsividade e identidade visual.'),('Marcelo Dalbone','Pesquisas e apoio à contextualização e aos requisitos.'),('Akiane Merbach','Pesquisas e apoio às referências alimentares e limitações técnicas.')])
sub('Planejamento das três etapas restantes a partir da segunda entrega')
table(['Etapa','Objetivo','Evidência de encerramento do ciclo'],[
('3ª entrega — incremento deste relatório','Consolidar o fluxo de preferências, diário e resumo, navegação, responsividade e JavaScript.','Demonstração do percurso principal, código organizado, testes e registro explícito de pendências.'),
('4ª entrega — próximo incremento proposto','Aproximar o cadastro da estrutura responsável/criança, refinar regras e conteúdo educativo e avaliar cenários de uso.','Telas e estado local revisados, migração de dados testada, casos de restrição e resumo documentados e feedback registrado quando obtido.'),
('5ª entrega — consolidação proposta','Corrigir problemas do ciclo anterior, executar regressão, concluir documentação e preparar demonstração final.','Versão estável do escopo acordado, matriz de requisitos revisada, evidências finais e orientações de uso; gamificação apenas se couber no prazo.')])
para('A distribuição da quarta e quinta entregas é uma proposta de execução, sujeita às orientações futuras do professor. Não são atribuídas datas ou exigências ainda não informadas. O front-end da terceira entrega precisa demonstrar o MVP funcionando; as próximas etapas aprofundam os requisitos e a qualidade, sem adiar o fluxo principal já exigido.')
sub('Scrum e Kanban')
para('O Scrum orienta a entrega em incrementos verificáveis, revisão do resultado e adaptação do próximo ciclo. O Kanban torna tarefas, responsáveis e bloqueios visíveis. O quadro abaixo sintetiza o acompanhamento proposto a partir das evidências do repositório; não é uma reprodução dos status atuais do Jira.')
table(['A Fazer','Em Andamento','Concluído tecnicamente'],[('4ª: cadastro responsável/criança, refinamento de conteúdo e regras; 5ª: regressão e documentação final.','Preparação e revisão da terceira entrega; planejamento dos próximos incrementos.','Incremento técnico da 3ª: fluxo local perfil/diário/resumo, interações e verificações registradas. Não significa projeto finalizado.')])
para('A conclusão de uma tarefa deve exigir código funcional e evidência de verificação. Separar desenvolvimento técnico, revisão documental e avaliação externa evita atribuir a uma funcionalidade pronta um impacto social ainda não medido. A quarta entrega prioriza as lacunas da proposta inicial e a avaliação dos fluxos; a quinta consolida as correções e a apresentação final. Melhorias que não couberem nesses ciclos serão registradas como evolução posterior, sem comprometer o MVP.')

title(3)
sub('Rastreabilidade com os requisitos da proposta inicial')
para('A proposta anterior define oito requisitos funcionais. A matriz abaixo preserva esses compromissos e diferencia implementação parcial de conclusão. Recursos adicionais, como foto, backup e contatos, não substituem as pendências dos requisitos originais.')
table(['Requisito da proposta inicial','Situação nesta 3ª entrega','Continuidade prevista'],[
('Cadastro do usuário e da criança','Parcial: perfil local simplificado, sem cadastro separado dos dois papéis.','4ª: representar responsável e criança no estado local e revisar validações; 5ª: regressão do fluxo.'),
('Preferências e recusas alimentares','Operacional no perfil atual: restrições, cores, texturas e alimentos evitados.','4ª: associar à criança e refinar mensagens; 5ª: testar cenários e persistência.'),
('Registro dos alimentos consumidos','Fluxo básico operacional por data e refeição.','4ª: revisar a experiência para o perfil infantil; 5ª: verificar integridade e consistência.'),
('Informações de alimentos e nutrientes','Recorte operacional de catálogo e 43 referências TACO.','4ª: revisar cobertura e apresentação; 5ª: conferir fontes e limitações do escopo entregue.'),
('Análise dos alimentos registrados','Parcial: resumo por grupos, nutrientes disponíveis e cobertura diária.','4ª: aprimorar interpretação e estados parciais; 5ª: validar cálculos e clareza.'),
('Recomendações de complementação','Parcial: regras de variedade por grupos e compatibilidade; sem prescrição personalizada.','4ª: refinar regras e justificativas; 5ª: verificar casos-limite e limites educativos.'),
('Conteúdos de educação alimentar','Parcial: conteúdo introdutório e perguntas frequentes.','4ª: ampliar e organizar conteúdos adequados ao público; 5ª: revisão de fontes e navegação.'),
('Pontos, recompensas, avatar e desafios','Não implementado; a proposta inicial condiciona esse recurso ao prazo.','4ª: avaliar viabilidade; 5ª: entregar um recorte simples somente se o núcleo estiver estável.')])
sub('Requisitos operacionais detalhados para o MVP')
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
sub('Evolução objetiva em relação à segunda entrega')
table(['Na segunda entrega','Incremento apresentado na terceira','Pendência para os próximos ciclos'],[
('Ideação e requisitos do aplicativo.','Regras executáveis de perfil, filtros, diário e recomendações no navegador.','Aproximar o cadastro dos papéis de responsável/criança e refinar critérios.'),
('Protótipo e referências de identidade.','Cinco telas navegáveis, layout responsivo e painel separado da landing page.','Aprimorar fluxos, acessibilidade e experiência com base em avaliação.'),
('Previsão de registro e análise alimentar.','Registro persistido localmente, resumo por data, TACO e peso confirmado.','Revisar cobertura, apresentação e casos-limite da análise.'),
('Previsão de construção gradual e testes.','25 testes automatizados e percurso Chromium documentados.','Ampliar cenários, registrar feedback e repetir regressão nas entregas 4 e 5.'),
('Gamificação prevista se houver prazo.','Recurso ainda não desenvolvido no aplicativo.','Avaliar um recorte simples após consolidar os requisitos centrais.')])
para('A foto, o backup e a publicação foram incrementos técnicos adicionais. Sua presença nesta versão não significa que o cadastro infantil completo, o refinamento das recomendações e os recursos educativos já atingiram a abrangência da proposta original. A continuidade será medida por requisitos e evidências, não apenas pelo número de telas.')
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
para('O incremento da terceira entrega dispõe de fluxos básicos executáveis de perfil, catálogo, diário, resumo, backup, conteúdo introdutório, contato e reconhecimento confirmado. Isso caracteriza uma versão de desenvolvimento do MVP, não o encerramento desses módulos. Cadastro de responsável/criança, aprofundamento educativo e refinamento das recomendações permanecem no planejamento das próximas duas entregas. Contas remotas e sincronização são possibilidades posteriores, não exigências assumidas para o semestre.')

title(5)
sub('Validação do incremento da terceira entrega')
para('Os resultados abaixo representam verificações do código disponível nesta etapa. Eles comprovam cenários específicos de funcionamento e não equivalem à homologação final do aplicativo. Alterações das entregas seguintes exigirão novas execuções e atualização das evidências; um teste aprovado hoje não garante o comportamento de funcionalidades ainda não implementadas.')
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
para('As verificações utilizaram cenários de cadastro, filtro por lactose e cor verde, busca sem acentos, registro por dia, peso confirmado, remoção e importação de backup. As capturas mostram a execução nesses cenários. Não foi documentada uma avaliação de usabilidade com comunidade externa. A validação técnica não comprova aceitação, impacto clínico ou mudança de hábitos.')

title(6)
sub('Ambiente de demonstração da terceira entrega')
para('A publicação atual serve para demonstrar o incremento em desenvolvimento e permitir testes ao longo do semestre. Não caracteriza aceite final, conclusão das cinco entregas ou implantação definitiva. Nas entregas quarta e quinta, a mesma estrutura poderá receber novas versões, acompanhadas da atualização de evidências e instruções.')
para('Landing page: https://nutrivibe-gamma.vercel.app . Aplicativo: https://nutrivibe-gamma.vercel.app/app . A implantação foi realizada na Vercel, com serviços de contato persistidos em Neon. A disponibilidade depende da conectividade e dos serviços utilizados; não foi definido acordo de nível de serviço.')
sub('Execução local')
para('Pré-requisitos: Node.js 24, npm e navegador atualizado com JavaScript e WebAssembly. Na raiz do repositório, executar os comandos abaixo. O build prepara recursos públicos e verifica/prepara os artefatos do reconhecimento; em máquina nova, requer internet para instalação e download.')
for cmd,explanation in [('npm ci','Instala as versões fixadas no package-lock.json.'),('npm run build','Prepara public, o modelo e o bundle visual.'),('npm test','Executa a suíte automatizada Node.js.'),('npm start','Inicia o servidor local na porta padrão 8080.')]:para(cmd+' — '+explanation)
para('Abrir http://localhost:8080 para a apresentação e http://localhost:8080/html/aplicativo/index.html para o aplicativo. O uso por file:// não é adequado, pois módulos, fetch e caminhos de modelo dependem de um servidor HTTP.')
sub('Configuração e requisitos operacionais')
para('NUTRIVIBE_VISION_PROVIDER=browser-local seleciona o reconhecimento local. POSTGRES_URL ou DATABASE_URL define a conexão PostgreSQL. As variáveis são configuradas no ambiente do processo/provedor; não há carregamento automático de arquivo .env pelo código atual. Sem banco remoto, o servidor local usa SQLite; na nuvem, a ausência de persistência configurada não é substituída por arquivo temporário.')
para('Na Vercel, o build gera public e api/index.mjs exporta o handler serverless. vercel.json define redirecionamentos, rotas, cache dos modelos e cabeçalhos. O primeiro reconhecimento exige aproximadamente 112 MB; as fotos são processadas no aparelho nesse modo. O usuário deve manter backup do diário se pretende limpar o navegador ou trocar de dispositivo.')

title(7)
sub('Quarta entrega: aprofundamento dos requisitos originais')
para('O próximo incremento proposto concentra-se em três frentes. A primeira é estruturar o cadastro local de responsável e criança, com validações e adaptação das preferências já existentes, preservando ou migrando registros anteriores. A segunda é refinar a apresentação da análise e das recomendações, explicando cobertura nutricional parcial, grupos registrados e razões de exclusão. A terceira é ampliar conteúdos educativos com linguagem adequada e fontes identificadas.')
para('Os critérios de verificação são: o cadastro dos dois papéis é compreensível; preferências e diário referem-se à criança correta; dados antigos não são perdidos; sugestões respeitam restrições; resultados sem cobertura não aparecem como totais completos; conteúdo e navegação funcionam em telas pequenas. A avaliação com usuários/profissionais será buscada e documentada se realizada, sem antecipar seus resultados.')
sub('Quinta entrega: consolidação do produto acadêmico')
para('O último ciclo proposto é destinado a corrigir problemas observados na quarta entrega, repetir testes de regras e de navegação, revisar responsividade e acessibilidade e atualizar o relatório com a situação final de cada requisito. A demonstração deverá percorrer o fluxo completo de cadastro, preferências, registro e análise, incluindo erros e correção manual. A documentação final deve identificar funcionalidades entregues e pendências remanescentes, sem ocultar limitações.')
para('A gamificação continua opcional, conforme a proposta inicial. Se houver prazo após estabilizar o núcleo, será avaliado um recorte simples de avatar, desafios e pontuação local, com regras claras e caráter educativo. Não se assume a entrega integral de todos esses recursos. Eles não devem incentivar consumo forçado ou prometer melhora clínica; se não forem viáveis, essa decisão será registrada.')
table(['Horizonte','Escopo proposto','Evidência esperada'],[
('4ª entrega','Cadastro responsável/criança; revisão de recomendações e conteúdo; avaliação dos fluxos.','Incremento executável, casos de teste, compatibilidade dos dados e registro de problemas/feedback.'),
('5ª entrega','Correções, regressão, documentação e demonstração; gamificação somente se viável.','Matriz final de requisitos, capturas atualizadas, testes e instruções reproduzíveis.'),
('Após o semestre, se houver continuidade','Contas remotas, sincronização, maior catálogo e otimização profunda do reconhecimento.','Novo escopo e avaliação de privacidade, custo e manutenção; sem compromisso de entrega nesta etapa.')])
sub('Manutenção ao longo dos próximos ciclos')
para('O reconhecimento continuará sujeito a erros; a identificação manual deverá permanecer disponível. Mudanças de catálogo, modelo ou limiares precisam de avaliação com controles negativos e fotos variadas. O esquema de armazenamento deve ser versionado se o cadastro for ampliado, com testes de migração e backup. No servidor, a evolução de tráfego exigirá avaliar um limitador distribuído, pois o mecanismo atual opera em memória por instância.')
para('As orientações futuras do professor podem alterar prioridades. Este planejamento mantém o foco acadêmico em HTML, CSS e JavaScript; as integrações adicionais não deverão impedir a demonstração e a avaliação do front-end. A referência de progresso continuará sendo a proposta inicial, confrontada com evidências a cada entrega.')

title(8)
para('Nesta terceira entrega, o NutriVibe avança da proposta e organização apresentadas na segunda etapa para um incremento navegável e interativo. O front-end dispõe de fluxo de preferências, diário e resumo, com recursos de busca, filtros, persistência local e tratamento de entradas. A publicação e as integrações existentes são apoios técnicos à demonstração, sem configurar conclusão do projeto.')
para('As evidências atuais incluem telas responsivas, testes de regras, percurso no navegador e avaliação documentada do reconhecimento visual. Esses resultados demonstram evolução técnica em cenários delimitados. O cadastro completo de responsável/criança, o aprofundamento dos conteúdos e o refinamento das recomendações ainda devem ser trabalhados, testados e documentados nas duas entregas restantes.')
para('A quarta entrega será orientada ao aprofundamento dos requisitos originais e à revisão dos fluxos; a quinta, à correção dos problemas, regressão e consolidação da documentação e demonstração. A gamificação permanece condicionada à viabilidade, como previsto na proposta inicial. O planejamento será ajustado às orientações docentes, sem apresentar como realizadas tarefas ou avaliações ainda futuras.')
para('O resultado desta etapa é, portanto, um MVP em consolidação. A contribuição pretendida segue sendo apoiar responsáveis na organização da alimentação e na exploração de variedade com respeito às preferências. O projeto não declara impacto clínico ou comunitário comprovado. A formação do grupo se fortalece pela integração entre programação, interface, pesquisa e gestão, e pela comparação entre o que foi proposto, o que funciona e o que ainda precisa evoluir.')

# Não deixa orientações de preenchimento ou numeração vazia no documento final.
for p in doc.paragraphs:
 for n in p._p.xpath('./w:pPr/w:numPr'):n.getparent().remove(n)
 for r in p.runs:
  if r.font.size is None:r.font.size=Pt(11)
assert not doc._element.xpath('//w:numPr')
for h in headings:assert ''.join(h.itertext())
output=OUT/'NutriVibe_Preenchido.docx';doc.save(output)
print(output)
