# NutriVibe

Projeto acadêmico da PUC-Campinas, implementado com **HTML, CSS e JavaScript puro**, sem backend, banco de dados ou APIs obrigatórias.

## Dois sites separados

- **Landing page:** `NutriVibe/landingpage/html/index.html` — apresentação baseada no ZIP fornecido e formulário de interesse.
- **Aplicativo:** `NutriVibe/aplicativo/html/index.html` — início → perfil → registro → resumo → educação.
- `index.html` na raiz oferece acesso aos dois sites, inclusive em hospedagem estática sob um subdiretório do GitHub Pages.

O formulário da landing page é uma **demonstração**: valida nome, e-mail e ciência do usuário, mas não transmite nem persiste os contatos. Para captar leads reais será necessário decidir e integrar um serviço de formulários, fora do escopo acadêmico atual. Não existe autenticação ou envio de e-mail.

## Organização

```text
index.html                         acesso aos dois sites
NutriVibe/
  landingpage/                     estrutura e materiais do ZIP
    html/                          página de apresentação
    css/                           estilos responsivos
    javascript/                    menu e formulário de interesse
    imagens/                       logo e prévia originais
    audios/                        reservado pelo ZIP; sem arquivos atuais
    documentos/                    material original da segunda entrega
  aplicativo/
    html/                          início, perfil, registro, resumo, educação
    css/                           identidade visual e responsividade
    javascript/                    interações, validações e persistência
    dados/                         catálogo fictício de alimentos
    imagens/                       identidade do aplicativo
  documentos/
    backlog-jira.json              exportação fornecida, sem modificar Jira
    enunciado-entrega-3.txt         requisitos acadêmicos fornecidos
    acompanhamento.md             escopo, evolução e pendências
    evidencias/                    capturas reais em Chromium
    versao-inicial/                 páginas e imagem anteriores preservadas
 tests/browser.cjs                 teste de fluxo e navegação
```

## Executar

Na raiz do checkout:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Acesse a raiz no navegador local. Não há instalação de dependências para executar os sites; CSS, scripts, imagens e catálogo são locais. As pastas dos dois sites podem ser hospedadas separadamente; o link cruzado pressupõe a estrutura conjunta e deve ser ajustado se forem usados domínios distintos.

## Dados e funcionalidades

Use **dados fictícios**, inclusive no perfil. Perfil e registros alimentares ficam no `localStorage` da origem do navegador; não são compartilhados com outras pessoas. O botão “Apagar dados locais” remove perfil e registros após confirmação. A landing page não salva contatos. O aplicativo avisa quando o armazenamento está indisponível. Sugestões são educativas e demonstrativas; não há IA, avaliação clínica, dieta, cálculo nutricional ou gamificação funcional. O painel da landing page é ilustrativo.

## Validação

`tests/browser.cjs` usa Playwright como ferramenta de desenvolvimento, sem dependência no produto. Instale Playwright e um Chromium compatível no ambiente de testes, mantenha o servidor na porta 8080 e execute:

```sh
node tests/browser.cjs
```

O teste usa `/usr/bin/chromium` por padrão; `CHROMIUM_PATH` permite indicar outro executável e `NUTRIVIBE_URL` permite outra origem. Testa perfil, entrada inválida, busca, filtros, persistência após recarga, registro, remoção, resumo, formulário de interesse, menu móvel, referências locais e largura sem overflow em 360, 768 e 1280 px. Atualiza capturas em `NutriVibe/documentos/evidencias/`. Não equivale a revisão de acessibilidade completa ou testes em Safari/Firefox.
