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

A equipe informou início em **agosto de 2026** e implementação do aplicativo em **outubro de 2026**. A pedido da equipe, as fichas agora contêm **dias específicos e horas estimados**, sem asteriscos nos lançamentos, com identificação de cronograma proposto para conferência dentro de cada relatório. Os valores não são apresentados como apontamentos comprovados.

| Integrante | Atividades | Total individual estimado |
| --- | --- | --- |
| Paulo | 12 | 60 h |
| Davi | 12 | 54 h |
| Victor | 12 | 57 h |
| Marcelo | 12 | 53 h |
| Akiane | 12 | 56 h |

Os quatro integrantes além de Paulo têm média proposta de **55 h**, com totais diferentes entre si. A soma das estimativas individuais é **280 h**. Cada total é calculado pelas linhas da própria ficha; não representa duração cronológica do projeto nem carga curricular oficial. Cada pasta também contém `atividades-estimadas.csv`, com datas, descrições, horas e indicação de que são estimativas. O planejamento cobre pesquisa e definição inicial em agosto, organização em setembro e implementação/revisão do aplicativo em outubro, até 26/10/2026.

Nos campos iniciais de CH, o total do trabalho individual estimado foi distribuído como autônomo. Teoria, prática supervisionada e extensão comunitária aparecem com zero por não haver registros dessas horas nesta estimativa. **Esses números não substituem a carga oficial do componente e não comprovam horas de extensão.** A identificação de versão para conferência acompanha esses campos no documento.

## Questões de assinalar

As marcações são feitas com **X nas caixas originais**, sem recriar as tabelas. “Outra” já consta no original nas seções 2.2, 4.1 e 5; nenhuma alternativa foi criada. Na seção de PIE e na de apoio institucional foram usadas suas opções originais correspondentes:

- **PIE III — Saúde e Meio Ambiente:** enquadramento adotado pelo tema de educação alimentar, sujeito à validação do docente.
- **Forma de desenvolvimento — Nenhuma das opções anteriores:** não foram informados os apoios institucionais listados.
- **Tipo de parceiro — Outra:** não se aplica à fase interna documentada; não há parceiro externo formalizado nos registros.
- **Interlocução — Outra:** não se aplica nesta etapa; há pesquisa documental e organização interna, sem interlocução externa documentada.
- **Atividade com comunidade — Outra:** desenvolvimento interno preparatório de recurso digital; não foi presumida ação comunitária nem resposta a demandas externas comprovadas.

As explicações constam junto às opções em cada relatório. “Outra” não indica que houve uma ação externa: identifica explicitamente a ausência de ação ou parceiro documentado. Não foram marcadas entrevistas, oficinas ou validações sem evidência.

Os participantes foram preenchidos como **1 docente responsável identificado, 5 estudantes e 0 técnicos informados**, totalizando 6 vínculos identificados; os participantes externos documentados são 0. A contagem identifica a equipe e o docente, sem afirmar presença em evento ou atendimento comunitário.

Antes da entrega, cada estudante deve validar datas, horas, autoria das atividades, reflexão individual e enquadramento com o docente, substituindo as estimativas pelos registros disponíveis. Comunidade, interlocução e impactos devem ser atualizados se houver evidências adicionais. O professor solicita registros individuais de **data, atividade e carga horária**; a comunicação fornecida informa entrega até **27/11 às 23h59**.

## Preservação do modelo

O arquivo em [modelo-original](modelo-original/) é uma cópia integral do upload. O preenchimento altera apenas o conteúdo de `word/document.xml`: todas as outras partes do DOCX, incluindo estilos, cabeçalhos, rodapés, imagens e propriedades, são preservadas byte a byte. Os rótulos originais, 47 tabelas, 97 linhas e configuração de página permanecem. A inclusão de respostas pode aumentar o número de páginas.

O modelo original apresenta uma divergência de período: há referência a **1º semestre/2027 no rodapé**, embora o documento seja identificado como segundo semestre de 2026. Essa informação foi mantida, conforme a solicitação de não alterar o modelo. Confirmar a versão adequada com o docente.

[verificacao-modelo.json](verificacao-modelo.json) registra o SHA-256 do original e as verificações estruturais. O PDF é uma exportação para leitura; o DOCX mantém o modelo para revisão das estimativas e informações individuais.

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
