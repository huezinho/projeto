# NutriVibe — implementação e operação

Atualização nutricional: consulte [nutricao.md](nutricao.md), que substitui as limitações de cálculo de porções e nutrientes descritas na versão 2 abaixo. Os registros novos podem conter peso em gramas e referência TACO confirmada; registros anteriores não são convertidos automaticamente.

## Histórico da versão 2

## O que mudou

A interface do aplicativo foi redesenhada com navegação consistente, espaçamentos, hierarquia tipográfica, estados vazios, controles com rótulos, foco visível e layouts para celular, tablet e desktop. O conteúdo do produto não apresenta mais o aplicativo como fictício. Limitações reais de identificação e recomendações continuam explícitas para que a interface não prometa funcionalidades inexistentes.

A raiz `NutriVibe` agora contém todas as subdivisões: `html`, `css`, `javascript`, `imagens`, `dados`, `servidor`, `testes` e `documentacoes`. Dentro das pastas de interface, `aplicativo` e `landingpage` separam os dois sites. Os materiais anteriores foram preservados em `documentacoes/historico` e `documentacoes/segunda-entrega`; não representam o comportamento da versão atual.

## Diário e persistência

O catálogo tem 26 alimentos simples com grupo, cor, textura, destaques e marcadores conservadores de restrição. Registro por data, refeição e porções livres, remoção individual, perfil e preferências são reais e persistem no localStorage. Porção não é convertida em gramas ou calorias. Um alimento não encontrado pode ser informado pelo nome; permanece sem classificação, sem inferência de composição.

`store.js` valida os dados importados e migrados. A chave antiga `nutrivibe-mvp-v1` é lida e convertida para o formato atual sem apagar o original. A chave atual é `nutrivibe-v2`. Exportação JSON permite backup e importação pede confirmação antes de substituir dados. Falha de escrita não gera mensagem de sucesso. Falha de leitura bloqueia novas escritas até o usuário resolver o armazenamento ou apagar os dados. A exclusão remove ambas as chaves. Não há conta ou sincronização entre aparelhos; perfil e histórico não vão para o servidor.

## Registro por foto

1. O controle `file` com `capture="environment"` oferece câmera em celulares compatíveis e seletor de arquivos nos demais dispositivos.
2. O navegador decodifica a imagem, limita o maior lado a 1280 pixels e recodifica para JPEG. Arquivos JPEG, PNG e WebP de até 12 MB são aceitos na entrada. Essa recodificação descarta metadados do arquivo original.
3. A prévia é local. Só após consentimento e clique em identificar ela é enviada a `POST /api/identify`. A imagem não é salva em disco, no banco ou nos registros do navegador.
4. O servidor valida formato, assinatura do arquivo e limite de payload. A chave `NUTRIVIBE_VISION_KEY` fica no servidor. A chamada usa OpenAI Chat Completions, modelo configurável por `NUTRIVIBE_VISION_MODEL` (padrão `gpt-4o-mini`), imagem de baixa resolução e saída JSON com schema estrito.
5. A resposta é limitada aos IDs do catálogo. Duplicatas, IDs desconhecidos e confiança declarada abaixo de 0,70 são descartados. O número de confiança é uma estimativa do modelo, não uma probabilidade calibrada ou garantia de acerto.
6. Nenhum candidato é registrado automaticamente. O usuário seleciona os alimentos que reconhece e confirma. Pode ignorar a resposta e corrigir pelo catálogo ou informar outro alimento pelo nome.
7. Sem chave, com erro, timeout ou identificação incerta, o aplicativo pergunta qual alimento aparece e mantém o registro manual disponível. Descartar ou trocar foto cancela a solicitação e invalida respostas antigas.

Uma imagem não confirma alergênicos ou ingredientes ocultos. O reconhecimento real no provedor **não foi validado nesta sessão**, pois não existe chave configurada. O teste de integração exercita o contrato com resposta controlada; o teste de navegador verifica upload, consentimento, indisponibilidade, correção e confirmação, sem afirmar reconhecimento real. Câmera física em Android/iOS ainda requer teste em dispositivo.

## Recomendações diárias e restrições

`engine.js` é uma função determinística testável, sem dependência de IA ou API:

- Considera somente os registros da data selecionada.
- Exclui alimentos já registrados naquele dia.
- Exclui marcadores de lactose, leite, glúten, ovo, peixe e soja selecionados no perfil.
- Exclui cores, texturas e termos de alimentos evitados informados pelo usuário.
- Prioriza grupos alimentares ainda não registrados (+10) e alimentos preferidos (+2).
- Desempata pelo nome, diversifica grupos antes de repetir opções do mesmo grupo e apresenta até seis alternativas com explicação. Os links abrem o diário com o alimento e a data selecionados.
- Nunca relaxa filtros silenciosamente: se não há opções, mostra estado vazio.

O catálogo adota marcações conservadoras, como excluir toda aveia no filtro de glúten e derivados de leite no filtro de lactose. Não há certificação de ausência de alergênicos nem análise de contaminação cruzada. Preparações e marcas podem ter composições diferentes; o usuário precisa conferir rótulo/receita. Registro de algo já consumido pode conflitar com o perfil, mediante confirmação; isso não habilita sua recomendação.

As sugestões complementam a **variedade registrada**, sem calcular carência, adequação da ingestão, prescrição, necessidades infantis ou dietas. Quantidades, preparações, condições clínicas e incompletude dos registros impedem afirmar o que a pessoa precisa nutricionalmente. Validação do catálogo e das regras por nutricionista é uma próxima etapa antes de uso clínico.

## Servidor e banco

Node.js 24+, sem bibliotecas de runtime adicionais. `servidor/server.js` serve apenas os diretórios públicos permitidos e a API. Código de servidor, documentos, `.env` e banco não são publicados como arquivos estáticos. Headers incluem CSP, proteção contra MIME sniffing e contra inclusão em frame. POSTs exigem JSON e origem correspondente ao host; há limitação básica por IP (20 por minuto), tamanho de requisição e timeout de IA. Nenhum segredo é enviado ao navegador ou gravado no código.

A landing page agora salva contatos de verdade em SQLite (`.data/nutrivibe.sqlite`, ignorado no Git), usando `node:sqlite` e query parametrizada. `contacts` tem e-mail único, nome e instante de consentimento. Cadastros repetidos atualizam o contato. Não há listagem pública de contatos e não há disparo automático de e-mail. Falhas mostram erro, não um sucesso falso. O perfil e diário continuam locais, pois centralizá-los exigiria autenticação e autorização que não foram solicitadas.

Em ambiente de testes use `NUTRIVIBE_DATA_DIR=/tmp/nutrivibe-test-db` para não gravar cadastros de teste no banco operacional. Proteja e faça backup do diretório de dados; para excluir contatos, o operador deve administrar o SQLite localmente, com acesso controlado. Esta versão não tem painel administrativo, fluxo de descadastro, proteção antispam robusta ou política jurídica de retenção pronta.

## Execução

```sh
cd NutriVibe
npm start
```

O servidor usa loopback e porta 8080 por padrão. Landing: `/html/landingpage/index.html`; aplicativo: `/html/aplicativo/index.html`. `PORT`, `HOST` e `NUTRIVIBE_DATA_DIR` são configuráveis. Não é necessário `npm install` para executar. O projeto não deve ser iniciado apenas com servidor estático para testar os recursos de API.

Para IA, configure `NUTRIVIBE_VISION_KEY` no gerenciador de segredos ou copie `.env.example` para `.env` local, não versionado, e execute `node --env-file=.env servidor/server.js`. Não coloque chaves no HTML/JavaScript, chat ou GitHub. Autorize HTTPS para `api.openai.com`. A conta do provedor deve ter acesso e crédito; chamadas podem gerar cobrança. Variáveis injetadas pelo proxy devem usar seu destino HTTPS autorizado. O servidor usa fetch nativo; em redes que exigem proxy HTTP explícito, use o suporte do Node 24 (`NODE_USE_ENV_PROXY=1`) e teste a chamada nesse ambiente.

`GET /api/status` informa se há uma chave presente, sem confirmar crédito, conectividade ou precisão do provedor. Depois de configurar, faça teste real com imagem conhecida, confirme o resultado, depois experimente imagem ambígua e verifique o fallback.

## Testes e evidências

```sh
npm test
NUTRIVIBE_DATA_DIR=/tmp/nutrivibe-test-db PORT=8091 npm start
# Em outro terminal, com Playwright e Chromium disponíveis:
NUTRIVIBE_URL=http://127.0.0.1:8091 node testes/browser.cjs
```

Oito testes unitários passaram: restrições, escopo diário, prioridade por grupos, filtros sem opções, validação de importação, imagem inválida, ausência de chave, tratamento de resposta do provedor e falha externa (alguns agrupados no mesmo teste). O fluxo de navegador também confirmou registro de alimento fora do catálogo, backup, rejeição de importação inválida, exclusão e restauração dos dados. Testes usam resposta externa controlada, não provedor real. O navegador Chromium exercita os principais fluxos e verifica largura sem overflow em 360, 768 e 1280 px. As novas capturas estão em `documentacoes/evidencias`; as capturas antigas ficam no histórico. Firefox, Safari, câmera física e auditoria completa de acessibilidade permanecem pendentes.

## Limites de publicação

Pronto para testes locais dos fluxos implementados. A aplicação não foi publicada em domínio público nem homologada clinicamente. GitHub Pages hospeda HTML/CSS/JS, mas **não executa Node/SQLite**; para usar IA e contatos é preciso publicar o servidor em hospedagem Node 24, com HTTPS, segredo e disco persistente. Antes de exposição pública, revisar consentimento/retenção/LGPD, política do provedor de imagens, autenticação se houver sincronização, backups e proteção antispam. O backend permanece em loopback por padrão para testes locais.

A ampliação com servidor e SQLite segue o pedido atual do usuário; ela ultrapassa o escopo exclusivamente frontend do enunciado acadêmico anterior. Confirme com o professor como apresentar essas funcionalidades adicionais. PDF no modelo oficial, submissão no Canvas e ensaio não foram executados.
