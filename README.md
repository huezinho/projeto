# NutriVibe

Aplicativo de diário alimentar, estimativa nutricional com referência TACO e sugestões de variedade, com preferências, restrições e registro por foto. Landing page separada com formulário de interesse integrado ao Neon em produção e SQLite no desenvolvimento. HTML, CSS e JavaScript no frontend; Node.js 24 no servidor.

## Iniciar

```sh
npm ci
npm run build
npm start
```

Abra a raiz do servidor para a landing page ou `/html/aplicativo/index.html` para o aplicativo. A porta padrão é 8080; use `PORT` se necessário. O build prepara a biblioteca TensorFlow.js e o modelo local; na primeira execução precisa de acesso à origem oficial Google.

## Organização

```text
NutriVibe/
  html/{aplicativo,landingpage}/
  css/{aplicativo,landingpage}/
  javascript/{aplicativo,landingpage}/
  imagens/{aplicativo,landingpage}/
  dados/                   catálogo alimentar
  servidor/                API, arquivos públicos e SQLite
  testes/                  regras e fluxos de navegador
  documentacoes/           implementação, evidências e materiais anteriores
  .env.example             nomes de configuração, sem credenciais
  package.json
```

Perfil e registros ficam no navegador, com exportação/importação e remoção. Contatos ficam no Neon em produção e no SQLite local no desenvolvimento. Fotos são analisadas no aparelho e não são enviadas ao servidor. Recomendações consideram o dia e excluem opções incompatíveis; são sugestões de variedade, sem prescrição nutricional.

O reconhecimento gratuito usa SigLIP e ONNX Runtime Web no navegador, escolhido após 148 avaliações com fotos da internet. O primeiro rótulo acertou 94 de 108 fotos de comida/pratos (87%); em 50 fotos novas, foram 40 acertos (80%). Ele sugere o alimento ou prato principal, não todos os ingredientes. Exige confirmação e pode pedir identificação manual. O primeiro download é maior (~112 MB); não há envio de fotos nem cobrança por inferência.

- [Comparação dos modelos, resultados e fontes](NutriVibe/documentacoes/avaliacao-imagens/README.md)
- [Reconhecimento gratuito, testes e limitações](NutriVibe/documentacoes/reconhecimento-gratuito.md)
- [Cálculo nutricional, fonte e confirmação de quantidade](NutriVibe/documentacoes/nutricao.md)
- [Implementação, testes, configuração e limites](NutriVibe/documentacoes/implementacao.md)
- [Backlog fornecido](NutriVibe/documentacoes/historico/backlog-jira.json)

`cd NutriVibe && npm test` executa os testes de regras. Para testes Chromium, siga o documento de implementação. Hospedagem completa requer Node 24 e disco persistente; GitHub Pages sozinho não executa a API.

## Publicação na internet

Configuração Vercel na raiz do repositório, com API serverless e PostgreSQL Neon para contatos. Execute `npm ci && npm test && npm run build` na raiz para validar a preparação. Veja [publicação e variáveis necessárias](NutriVibe/documentacoes/vercel.md). O deploy requer conta Vercel autorizada; o Neon já está conectado. O reconhecimento local não usa credenciais de IA.

## Endereços de produção

- Landing page: https://nutrivibe-gamma.vercel.app
- Aplicativo: https://nutrivibe-gamma.vercel.app/app

Deploy de produção confirmado como READY na Vercel. O reconhecimento local substitui a integração paga. O banco Neon permanece conectado. Consulte as evidências e os limites na documentação.
