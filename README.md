# NutriVibe

Aplicativo de diário alimentar, estimativa nutricional com referência TACO e sugestões de variedade, com preferências, restrições e registro por foto. Landing page separada com formulário de interesse integrado a SQLite. HTML, CSS e JavaScript no frontend; Node.js 24 no servidor.

## Iniciar

```sh
cd NutriVibe
npm start
```

Abra a raiz do servidor para a landing page ou `/html/aplicativo/index.html` para o aplicativo. A porta padrão é 8080; use `PORT` se necessário. Não há dependências adicionais para executar.

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

Perfil e registros ficam no navegador, com exportação/importação e remoção. Contatos ficam no banco local do servidor; fotos não são salvas. Recomendações consideram o dia e excluem opções incompatíveis; são sugestões de variedade, sem prescrição nutricional.

A câmera/envio de foto e confirmação manual funcionam sem chave. **Identificação automática exige `NUTRIVIBE_VISION_KEY` no servidor**, com acesso à API OpenAI. Nunca coloque a chave no frontend. A integração está implementada, mas a inferência real permanece pendente de credencial e teste com o provedor. Consulte a configuração e as limitações no documento abaixo.

- [Cálculo nutricional, fonte e confirmação de quantidade](NutriVibe/documentacoes/nutricao.md)
- [Implementação, testes, configuração e limites](NutriVibe/documentacoes/implementacao.md)
- [Backlog fornecido](NutriVibe/documentacoes/historico/backlog-jira.json)

`cd NutriVibe && npm test` executa os testes de regras. Para testes Chromium, siga o documento de implementação. Hospedagem completa requer Node 24 e disco persistente; GitHub Pages sozinho não executa a API.
