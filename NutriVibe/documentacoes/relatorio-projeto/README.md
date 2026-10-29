# Relatório do projeto NutriVibe

## Arquivos

- `NutriVibe_Preenchido.docx`: documento editável.
- `NutriVibe_Preenchido.pdf`: versão de leitura.
- `NutriVibe_Documento.zip`: os dois formatos reunidos.
- `capturas/`: dez capturas da aplicação em execução, utilizadas nas figuras.

A redação descreve o problema, a solução e as funcionalidades disponíveis, sem enquadramento em número de entrega e sem comentários sobre o processo de preenchimento. A seção de manutenção apresenta evoluções previstas do sistema. Os nove títulos e as imagens institucionais do modelo são preservados, incluindo a imagem da PUC no parágrafo da capa e a marca do cabeçalho.

O planejamento inclui as 32 tarefas do backlog, com códigos e títulos reais. As telas e os testes são apresentados com imagens e explicações no próprio texto. O cenário de interface utiliza dados de teste, identificados como tal, sem apresentar acompanhamento real de uma criança.

## Reprodução

Na raiz do repositório, com Python, python-docx e LibreOffice:

```sh
python NutriVibe/ferramentas/documentacao/gerar_relatorio_projeto.py /caminho/para/modelo-original.docx
soffice --headless --convert-to pdf --outdir NutriVibe/documentacoes/relatorio-projeto NutriVibe/documentacoes/relatorio-projeto/NutriVibe_Preenchido.docx
```

O arquivo original enviado com extensão `.DOC` é internamente um pacote DOCX e pode ser passado diretamente ao gerador. As capturas são lidas da pasta `capturas/`. Para atualizá-las, iniciar o servidor local na porta 8099 e executar `node NutriVibe/ferramentas/documentacao/capturar_relatorio.cjs`, com Playwright e Chromium instalados. O script também aceita `NUTRIVIBE_URL` e `CHROMIUM_PATH`.

Após exportar o PDF, atualizar o ZIP com os dois arquivos. A geração verifica que os arquivos de mídia institucionais do original foram preservados byte a byte.
