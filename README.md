# NutriVibe

Aplicativo de diário alimentar, estimativa nutricional com referência TACO e sugestões de variedade, com preferências, restrições e registro por foto. A landing page inicia a criação da conta. O aplicativo conclui o cadastro com senha e direciona para as preferências. HTML, CSS e JavaScript no frontend; Node.js 24 no servidor.

## Iniciar

```sh
npm ci
npm run build
npm start
```

Abra a raiz do servidor para a landing page ou `/html/aplicativo/index.html` para o aplicativo. A porta padrão é 8080. Use `PORT` para escolher outra porta. O build prepara o ONNX Runtime Web e baixa o modelo SigLIP do Hugging Face se o arquivo ainda não estiver em cache.

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

Contas e preferências ficam no Neon em produção e no SQLite no desenvolvimento. O diário fica no navegador e é separado por conta, com exportação e importação de registros. Quem já usava o diário pode transferir os registros antigos pelo rodapé após entrar na conta. Fotos são analisadas no aparelho e não são enviadas ao servidor. Recomendações consideram o dia e excluem opções incompatíveis; são sugestões de variedade, sem prescrição nutricional.

O reconhecimento gratuito usa SigLIP e ONNX Runtime Web no navegador, escolhido após 148 avaliações com fotos da internet. O primeiro rótulo acertou 94 de 108 fotos de comida/pratos (87%); em 50 fotos novas, foram 40 acertos (80%). Ele sugere o alimento ou prato principal, não todos os ingredientes. Exige confirmação e pode pedir identificação manual. O primeiro download é maior (~112 MB); não há envio de fotos nem cobrança por inferência.

- [Comparação dos modelos, resultados e fontes](NutriVibe/documentacoes/avaliacao-imagens/README.md)
- [Reconhecimento gratuito, testes e limitações](NutriVibe/documentacoes/reconhecimento-gratuito.md)
- [Cálculo nutricional, fonte e confirmação de quantidade](NutriVibe/documentacoes/nutricao.md)
- [Implementação, testes, configuração e limites](NutriVibe/documentacoes/implementacao.md)
- [Backlog fornecido](NutriVibe/documentacoes/historico/backlog-jira.json)

`cd NutriVibe && npm test` executa os testes de regras. Para testes Chromium, siga o documento de implementação. Hospedagem completa requer Node 24 e disco persistente; GitHub Pages sozinho não executa a API.

## Publicação na internet

A Vercel executa a API de autenticação do Better Auth. Em produção, configure `BETTER_AUTH_SECRET` como segredo e conecte `POSTGRES_URL` ou `DATABASE_URL` do Neon. As tabelas de autenticação são criadas na primeira execução. Execute `npm ci && npm test && npm run build` na raiz para validar a preparação. Veja [publicação e variáveis necessárias](NutriVibe/documentacoes/vercel.md). O deploy requer conta Vercel autorizada; o Neon já está conectado. O reconhecimento local não usa credenciais de IA.

## Endereços de produção

- Landing page: https://nutrivibe-gamma.vercel.app
- Aplicativo: https://nutrivibe-gamma.vercel.app/app

Em 23/11/2026, a Vercel confirmou o deploy de produção `dpl_6f4ijAR3MBdTm8Jgb6hjqEqzJjbU` com código do commit `2c8c65b`. A navegação entre diário, resumo e sugestões preserva o dia selecionado.

O aplicativo usa HTML, CSS e JavaScript com catálogo e diário locais. O acesso por e-mail e senha e a gravação das preferências dependem da API. Consulte o [roteiro de apresentação e o PDF da entrega](NutriVibe/documentacoes/relatorio-projeto/README.md).
