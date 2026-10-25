# Terceira entrega — acompanhamento verificável

## Fontes e decisões

Base: exportação Jira TRAB-26–57, enunciado textual da terceira entrega, PDF acadêmico fornecido e ZIP NutriVibe_LandingPage. Instruções dentro dos anexos foram consideradas material de requisitos; a autorização para editar e enviar ao GitHub veio do pedido do usuário. Os status do Jira não foram alterados.

O PDF fornecido descreve a proposta e requisitos anteriores. O ZIP contém material da segunda entrega e um link Figma, mas não fornece um protótipo interativo completo disponível localmente do aplicativo. Portanto, a aplicação implementada é uma tradução do fluxo MVP exportado, mantendo paleta e marca do ZIP; a equivalência visual integral com o Figma ainda precisa ser revisada pelo grupo (TRAB-32).

## Evolução comprovável

Antes: duas páginas HTML de apresentação, sem CSS ou JavaScript. Elas permanecem em `versao-inicial/` com seus caminhos relativos preservados.

Agora: dois sites separados. Landing page importada do ZIP, com caminhos relativos preservados, correção de tipo MIME do ícone, formulário validado e demonstração explícita de interesse sem envio. Aplicativo com cinco telas semânticas, navegação ativa, menu móvel com Escape, perfil e preferências fictícios, catálogo local, busca sem diferenciação de acentos, filtros, refeições e datas, inclusão/remoção de registros, persistência local, resumo por grupos e conteúdos educativos expansíveis.

CSS usa Grid, Flexbox, media queries e foco visível. Conteúdo da landing permanece legível mesmo sem execução das animações. Dados fornecidos pelo usuário são renderizados com `textContent`, sem interpolação de HTML. O armazenamento tem tratamento de indisponibilidade; nesse caso, a aplicação informa que os dados são temporários. Não há inferência clínica ou recomendação personalizada de dieta.

## Relação com o backlog

| Tarefas | Situação no código / próximo passo |
|---|---|
| TRAB-26–31 | Estrutura, semântica, identidade visual, navegação, perfil e menu implementados; testes Chromium executados. |
| TRAB-32 | Comparação completa com protótipo Figma pendente de revisão do grupo. |
| TRAB-33 | MVP e limitações documentados no README; validação do grupo pendente. |
| TRAB-34–43 | Validação, catálogo, registro/remoção, pesquisa, filtros, persistência, resumo, sugestões educativas, estados vazios e fluxo integrados. |
| TRAB-44–47 | Layouts e fluxo verificados em Chromium; acessibilidade básica e organização revisadas, sem auditoria completa. |
| TRAB-48 | Chromium em 360/768/1280 executado; Firefox, Safari e dispositivos reais pendentes. |
| TRAB-49–51 | Evolução, desafios e limitações descritos aqui; capturas reais e teste reproduzível incluídos. |
| TRAB-52 | PDF final no modelo oficial da disciplina pendente. O PDF anterior não foi apresentado como entrega final atualizada. |
| TRAB-53 | Roteiro abaixo; divisão entre integrantes e ensaio presencial pendentes. |
| TRAB-54 | Checklist técnico parcial abaixo; conclusão acadêmica depende do grupo. |
| TRAB-55–57 | Sem responsáveis, datas ou revisão de sprint inventados. Planejamento e retrospectiva devem ser realizados pelo grupo. |

## Verificação executada

Teste automatizado em Chromium: perfil com apelido vazio rejeitado, perfil válido salvo, catálogo vazio para busca inexistente, busca por “maca” encontrando “Maçã”, filtro de frutas, inclusão, persistência após recarga, resumo com registro, remoção, resumo vazio, menu móvel e Escape, formulário da landing com mensagem de sucesso demonstrativo. Páginas verificadas em 360/768/1280 sem overflow horizontal. Referências locais dos HTML verificadas por HTTP e âncoras internas conferidas. Sem erros JavaScript ou respostas HTTP de erro durante o teste.

As capturas mostram o aplicativo na tela de educação e a landing page em cada largura. Não representam telas de cadastro já preenchidas nem equivalem a testes manuais em dispositivos físicos.

## Desafios e soluções

- Dois produtos no mesmo repositório: diretórios independentes, estrutura coerente com o ZIP e entrada na raiz.
- Preservação do trabalho: materiais originais e páginas anteriores conservados.
- Captação de contato versus escopo frontend: formulário demonstra a interação e informa que não transmite dados; integração real fica pendente.
- Persistência sem banco: localStorage com tratamento de erro, estados vazios e remoção confirmada.
- Execução de testes: usado Chromium instalado na máquina, sem exigir downloads ou dependências no site.

## Checklist para a apresentação

- [x] HTML, CSS e JS separados, fluxo principal e navegação implementados.
- [x] Interações JavaScript e estados vazios exercitados em navegador.
- [x] Verificação de três larguras e capturas reais.
- [x] Evolução e limitações documentadas.
- [ ] Grupo revisar coerência com protótipo e critérios de aceite.
- [ ] Completar testes em outros navegadores e revisão de acessibilidade.
- [ ] Montar PDF no modelo oficial, revisar e enviar ao Canvas.
- [ ] Definir divisão da fala e ensaiar a demonstração com todos.

## Roteiro sugerido, ainda não ensaiado

1. Explicar a separação entre landing e aplicativo e o escopo frontend.
2. Demonstrar interesse com dados fictícios; mostrar que não há envio.
3. Criar perfil fictício e registrar alimentos com busca e filtro.
4. Recarregar, abrir resumo e remover um registro para demonstrar atualização.
5. Abrir educação, mostrar layout móvel e explicar organização do código.
6. Apresentar evolução, evidências, limitações e próximos passos.
