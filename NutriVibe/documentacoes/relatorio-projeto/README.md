# Relatório do projeto NutriVibe

## Arquivos

- `NutriVibe_Preenchido.docx`: documento editável.
- `NutriVibe_Preenchido.pdf`: versão de leitura.
- `NutriVibe_Documento.zip`: os dois formatos reunidos.
- `capturas/`: dez capturas da aplicação em execução, utilizadas nas figuras.

A redação descreve o problema, a solução e as funcionalidades disponíveis, sem enquadramento em número de entrega e sem comentários sobre o processo de preenchimento. A seção de manutenção apresenta evoluções previstas do sistema. Os nove títulos e as imagens institucionais do modelo são preservados, incluindo a imagem da PUC no parágrafo da capa e a marca do cabeçalho.

O planejamento inclui as 32 tarefas do backlog, com códigos e títulos reais. As telas e os testes são apresentados com imagens e explicações no próprio texto. O cenário de interface utiliza dados de teste, identificados como tal, sem apresentar acompanhamento real de uma criança.

## Roteiro da demonstração do MVP

1. Abra a landing page e selecione **Experimentar aplicativo**. Mostre o painel e os atalhos para as telas principais. [Abrir NutriVibe](https://nutrivibe-gamma.vercel.app/)
2. Em **Preferências**, use um perfil fictício. Marque lactose e salve. Abra o diário e mostre que o filtro de compatibilidade esconde leite.
3. Selecione o almoço e pesquise banana no diário. Registre **Banana, prata, crua**, com 100 g. A referência TACO resulta em uma estimativa de 98,2 kcal para esse item.
4. Em **Refeições registradas**, abra **Ver sugestões para o dia**. Confira o dia selecionado, os totais e as sugestões compatíveis. Abra **Adicionar ao diário** em uma sugestão para mostrar que o catálogo abre com o alimento e a data selecionados.
5. Abra **Aprender** pela navegação e mostre o conteúdo educativo. Em um celular, demonstre o menu e a adaptação das telas.

A entrada por foto é opcional na apresentação. O modelo roda no navegador e o primeiro download tem cerca de 112 MB. Use uma foto clara de banana e confirme o alimento, o preparo e o peso antes de salvar. O catálogo permite completar o fluxo manualmente.

## Verificação de 23/11/2026

- `npm test` executou seis arquivos de testes com sucesso. `npm run build` verificou a integridade do modelo SigLIP e preparou os arquivos de publicação.
- O Chromium validou as cinco telas em 360, 768 e 1280 px, o menu por teclado, a persistência após recarregar e o percurso diário → resumo → sugestão com a mesma data. Também foram exercitados o reconhecimento de uma foto de banana, a resposta a uma imagem inconclusiva, a importação de backup e a exclusão de registros.
- O percurso principal passou com os arquivos de `public/` servidos estaticamente. Em produção, o formulário complementar gravou um contato técnico com resposta HTTP 201. As capturas abaixo foram obtidas no endereço público com dados fictícios.
- Testes de navegador em Firefox e Safari seguem pendentes.

| Largura | Visão geral | Resumo e sugestões |
|---|---|---|
| 360 px | [Painel](../evidencias/visao-geral-360.png) | [Resumo](../evidencias/recomendacoes-360.png) |
| 768 px | [Painel](../evidencias/visao-geral-768.png) | [Resumo](../evidencias/recomendacoes-768.png) |
| 1280 px | [Painel](../evidencias/visao-geral-1280.png) | [Resumo](../evidencias/recomendacoes-1280.png) |

## Reprodução

Na raiz do repositório, com Python, python-docx e LibreOffice:

```sh
python NutriVibe/ferramentas/documentacao/gerar_relatorio_projeto.py /caminho/para/modelo-original.docx
soffice --headless --convert-to pdf --outdir NutriVibe/documentacoes/relatorio-projeto NutriVibe/documentacoes/relatorio-projeto/NutriVibe_Preenchido.docx
```

O arquivo original enviado com extensão `.DOC` é internamente um pacote DOCX e pode ser passado diretamente ao gerador. As capturas são lidas da pasta `capturas/`. Para atualizá-las, iniciar o servidor local na porta 8099 e executar `node NutriVibe/ferramentas/documentacao/capturar_relatorio.cjs`, com Playwright e Chromium instalados. O script também aceita `NUTRIVIBE_URL` e `CHROMIUM_PATH`.

Após exportar o PDF, atualizar o ZIP com os dois arquivos. A geração verifica que os arquivos de mídia institucionais do original foram preservados byte a byte.
