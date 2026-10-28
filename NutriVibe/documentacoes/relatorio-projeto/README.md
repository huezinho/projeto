# NutriVibe — terceira entrega

O relatório é uma versão progressiva para a **3ª de cinco entregas**. A referência acadêmica anterior é a segunda entrega, preservada em `../segunda-entrega/`. O documento apresenta o incremento técnico disponível para a terceira etapa e o planejamento das duas seguintes, sem declarar o projeto finalizado.

## Arquivos

- `NutriVibe_Preenchido.docx`: documento editável baseado no modelo fornecido.
- `NutriVibe_Preenchido.pdf`: versão de leitura e conferência.
- `NutriVibe_Documento.zip`: os dois formatos reunidos.

## Critérios desta revisão

A capa identifica a terceira entrega. Os nove títulos do modelo foram preservados. Foram eliminadas orientações de preenchimento e listas vazias. O relatório inclui comparação com a segunda entrega, rastreabilidade dos oito requisitos originais, evidências técnicas e separação entre recursos operacionais, parciais e ainda não desenvolvidos.

A quarta e quinta entregas são propostas de continuidade, sujeitas às instruções futuras do docente. Cadastro responsável/criança, conteúdo educativo e refinamento das recomendações continuam no planejamento. A gamificação permanece opcional e condicionada ao prazo, como no documento de agosto. Contas remotas e sincronização não são compromissos assumidos para o semestre. Backend e Neon são incrementos adicionais; a exigência da terceira etapa continua centrada em HTML, CSS e JavaScript.

A turma 101 foi recuperada da capa do documento anterior. Não foram inventadas avaliações com público externo, datas de entregas futuras ou novas exigências do professor.

## Reprodução

Com Python, python-docx e LibreOffice disponíveis, a partir da raiz do repositório:

```sh
python NutriVibe/ferramentas/documentacao/gerar_relatorio_projeto.py /caminho/para/modelo-original.docx
soffice --headless --convert-to pdf --outdir NutriVibe/documentacoes/relatorio-projeto NutriVibe/documentacoes/relatorio-projeto/NutriVibe_Preenchido.docx
```

O arquivo enviado com extensão `.DOC` contém internamente um pacote DOCX. O gerador aceita esse arquivo original. O ZIP deve ser atualizado após regenerar os dois formatos.

A revisão mais recente reproduz os 32 títulos reais do backlog TRAB-26 a TRAB-57 no próprio texto, agrupados em S1/S2/S3, com prioridades e critérios. Foram removidas as tabelas acrescentadas e as referências internas que exigiam abrir outros documentos. A capa e os nove títulos originais permanecem; as respostas usam parágrafos e rótulos em negrito, sem listas vazias.
