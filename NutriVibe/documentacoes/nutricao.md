# Composição nutricional e análise de imagem

## Arquitetura implementada

O reconhecimento visual continua separado do cálculo nutricional. A integração de imagem sugere IDs do catálogo, mas não determina peso, preparo ou nutrientes. Após escolher um alimento, pelo catálogo ou pela foto, o usuário confirma a descrição específica na TACO e o peso comestível em gramas. Só então uma estimativa é registrada. Há opção explícita de registrar sem estimativa se o peso ou o preparo não forem conhecidos.

Uma foto com vários alimentos abre uma etapa de confirmação para cada item selecionado. Os registros são salvos juntos após a última etapa; cancelar abandona a fila sem salvar parcialmente. A imagem não é retida e a confirmação nunca habilita automaticamente alimentos incompatíveis nas recomendações.

## Fonte e rastreabilidade

- Fonte primária identificada: **Tabela Brasileira de Composição de Alimentos — TACO, 4ª edição revisada e ampliada, NEPA/UNICAMP, 2011**.
- Acesso utilizado: cópia da planilha original de 2011 no repositório `raulfdm/taco-api`. O acesso direto ao domínio NEPA não estava disponível na rede desta sessão; a procedência é registrada como cópia de terceiros, não como download direto verificado da universidade.
- Foram consultados a planilha original e o PDF de referência disponibilizados nesse repositório. O programa não usa os CSV normalizados do projeto, que convertem traços em zero.
- A planilha arquivada está em `fontes/TACO-original-2011.xls`. Seu SHA-256, commit do espelho e nome da aba estão em `fontes/proveniencia.json` e no módulo `dados/nutricao.js`.
- Licença e crédito do projeto de organização dos dados: `fontes/taco-api-LICENSE.md`. Crédito científico dos dados: NEPA/UNICAMP. Não há alegação de atualização para uma edição posterior ou de validação clínica independente.
- O recorte tem **43 referências**, vinculadas aos 26 itens do catálogo. Cada referência mantém número TACO, descrição original, valores por 100 g e qualificadores de dados não numéricos.

## Preparos e quantidades

Não há aproximação silenciosa de um alimento genérico para qualquer preparo. A descrição é apresentada antes da confirmação, sem seleção automática: banana-prata e nanica são referências distintas; arroz integral e tipo 1 cozidos também. Para peixe assado, somente as espécies listadas estão disponíveis. O recorte de grão-de-bico tem apenas a referência crua; se o usuário comeu grão-de-bico cozido, deve registrar sem estimativa até ampliar a base com fonte compatível. O mesmo vale para receitas, molhos e produtos sem correspondência.

O peso deve ser informado em **gramas da parte comestível**, sem casca não consumida, ossos ou embalagem. O programa aceita valores positivos até 5000 g por item como limite técnico, não como indicação de porção. Não converte automaticamente colher, concha, mililitros ou aparência em peso: ainda não há uma base rastreável de medidas caseiras. Para líquidos, informe a massa conhecida/pesada, não presuma equivalência entre mL e g.

## Cálculo e cobertura

O módulo `javascript/aplicativo/nutrition.js` calcula:

`valor estimado = valor por 100 g × massa consumida em g ÷ 100`

Energia é expressa em kcal; proteínas, carboidratos, gorduras e fibras em g; cálcio, ferro e sódio em mg. Os cálculos mantêm a precisão do recorte e arredondam apenas a apresentação. O importador conserva até seis casas decimais da planilha.

Campos `NA`, traços e valores não informados são mantidos como `null` com o qualificador original, nunca transformados em zero. Um nutriente com traço não tem quantidade numérica suficiente para a soma. Por isso, o resumo mostra **subtotal dos valores numéricos disponíveis**, com a quantidade de registros cobertos por cada nutriente. Se nenhum registro tem valor informado, o campo mostra “Não informado”.

O resumo é restrito ao dia escolhido e informa quantos registros têm peso/referência e quantos não têm estimativa. Um registro manual fora do catálogo ou anterior à atualização permanece no diário, sem receber nutrientes inventados. A exclusão de um registro altera o próximo resumo. Perfil, referências escolhidas e massas são preservados na exportação/importação; referências de outro alimento, fonte desconhecida ou massa inválida são rejeitadas.

Não se calculam metas, déficit, adequação dietética ou doses de suplementação. As sugestões continuam priorizando diversidade de grupos e respeitando restrições, sem interpretar ingestão parcial como deficiência. Validação por nutricionista permanece necessária para uso clínico e personalização de metas, especialmente infantil.

## API e banco

A base de composição é um recorte local versionado e funciona sem API, cobrança ou internet. SQLite continua armazenando contatos; não é necessário centralizar histórico alimentar ou duplicar a base nutricional em banco para este fluxo. O catálogo e o cálculo são módulos JavaScript locais, e o perfil/diário permanecem no navegador.

A **identificação automática da foto** continua dependendo de `NUTRIVIBE_VISION_KEY`, com acesso e crédito na API OpenAI. A chave deve ser configurada no servidor conforme `implementacao.md`, nunca no navegador. Não havia credencial disponível nesta sessão; portanto, não se afirma reconhecimento real homologado. Sem chave, indisponibilidade ou dúvida, o usuário seleciona o alimento manualmente e tem o mesmo cálculo nutricional disponível.

## Reproduzir e atualizar a base

O site não exige novas dependências de runtime. O importador de manutenção usa Python e `xlrd`:

```sh
python3 -m pip install xlrd
python3 NutriVibe/ferramentas/importar-taco.py
```

O script lê a planilha arquivada, extrai os IDs selecionados e gera `dados/nutricao.js` e a proveniência. Ao ampliar o mapeamento, revisar a compatibilidade do preparo, origem e restrições; atualizar testes e criar uma nova versão da fonte se valores existentes mudarem. O identificador atual `taco2011-original-v1` não deve ser reaproveitado para dados alterados sem migração dos registros.

## Verificação

- **12 testes automatizados**: regras de restrição e dia, identificação com provedor controlado, proporcionalidade dos nutrientes, distinção entre preparos, pesos inválidos, referência incompatível e cobertura parcial.
- Caso verificável: 150 g de arroz tipo 1 cozido, TACO nº 3, resulta em 192,387729 kcal a partir do recorte da planilha, apresentado com uma casa decimal.
- Testes Chromium: confirmação de banana-prata com 100 g, estimativa persistida após recarga, fluxo de foto com resposta controlada e confirmação de cenoura com 50 g; resumo, backup/restauração e telas em 360/768/1280 px.
- As capturas atuais em `evidencias` são produzidas pelo teste de navegador. Não equivalem a ensaio de câmera física ou validação real do serviço de IA.

Execute `cd NutriVibe && npm test`; para o navegador, siga o servidor de testes e o comando descritos em `implementacao.md`. Firefox, Safari, dispositivos físicos e conferência clínica completa continuam fora da validação executada.
