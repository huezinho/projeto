# Relatórios individuais de curricularização da extensão

As pastas contêm cópias preenchidas do modelo PROGRAD em DOCX e versões em PDF para conferência:

| Integrante | Responsabilidade | Arquivos |
| --- | --- | --- |
| Paulo Capreti | JavaScript | [Paulo](paulo/) |
| Davi Pioli | HTML e acompanhamento do Kanban | [Davi](davi/) |
| Victor Almeida | CSS e identidade visual | [Victor](victor/) |
| Marcelo Dalbone | Pesquisas: contexto, público e requisitos | [Marcelo](marcelo/) |
| Akiane Merbach | Pesquisas: referências nutricionais, reconhecimento e limites | [Akiane](akiane/) |

## Conferência antes da entrega

Os textos descrevem a implementação e as evidências técnicas disponíveis. A distribuição de responsabilidades segue a informação da equipe; o detalhamento entre as duas frentes de pesquisa é uma proposta de redação que Marcelo e Akiane devem validar. As reflexões em primeira pessoa também precisam de leitura e concordância de cada estudante.

A equipe informou início do projeto em **agosto de 2026** e implementação do aplicativo em **outubro de 2026**. Esses meses aparecem como referências, assinaladas com asterisco. Dias específicos, horas individuais e total cumprido não foram fornecidos: ficaram pendentes, sem converter estimativas em comprovação. Cada integrante deve preencher seus registros reais e conferir a coerência com as atividades efetivamente realizadas.

Também devem ser confirmados com o docente: carga horária institucional e sua distribuição; enquadramento PIE e forma de desenvolvimento; entidade/comunidade externa, interlocução, participantes e evidências; impactos mensurados. Não foram presumidas entrevistas, oficinas, atendimentos ou melhorias clínicas. O total de cinco estudantes identifica a equipe e não substitui o total institucional de participantes.

O professor solicita registros individuais de **data, atividade e carga horária**. Os arquivos permanecem em revisão até esses campos serem validados. A comunicação fornecida informa entrega até **27/11 às 23h59**.

## Preservação do modelo

O arquivo em [modelo-original](modelo-original/) é uma cópia integral do upload. O preenchimento altera apenas o conteúdo de `word/document.xml`: todas as outras partes do DOCX, incluindo estilos, cabeçalhos, rodapés, imagens e propriedades, são preservadas byte a byte. Os rótulos originais, 47 tabelas, 97 linhas e configuração de página permanecem. A inclusão de respostas pode aumentar o número de páginas.

O modelo original apresenta uma divergência de período: há referência a **1º semestre/2027 no rodapé**, embora o documento seja identificado como segundo semestre de 2026. Essa informação foi mantida, conforme a solicitação de não alterar o modelo. Confirmar a versão adequada com o docente.

[verificacao-modelo.json](verificacao-modelo.json) registra o SHA-256 do original e as verificações estruturais. O PDF é uma exportação para leitura; o DOCX mantém o modelo para edição dos campos pendentes.

## Reprodução

Na raiz do repositório, com Python, `lxml` e LibreOffice disponíveis:

```sh
python NutriVibe/ferramentas/relatorios/gerar_relatorios.py
```

O gerador recria os DOCX a partir do original. Para exportar um relatório:

```sh
soffice --headless --convert-to pdf --outdir NutriVibe/documentacoes/relatorios-individuais/paulo NutriVibe/documentacoes/relatorios-individuais/paulo/relatorio-paulo-nutrivibe.docx
```

Alterações manuais devem ser salvas em cópia ou incorporadas ao gerador antes de executá-lo novamente.
