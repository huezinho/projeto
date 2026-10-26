# Comparação de reconhecedores com fotos da internet

## Decisão

Substituir o MobileNet genérico por **SigLIP base patch16 224 quantizado**, com ONNX Runtime Web, vetores fixos para os nomes do catálogo e classes de controle. A escolha continua gratuita, sem API de inferência paga, sem chave e sem enviar a foto a terceiros. Não é um modelo generativo nem detector de todos os ingredientes: ele compara a imagem com um conjunto de 35 rótulos de alimentos/pratos e 11 contextos negativos.

A referência inicial foi buscar pelo menos 80% de acerto do alimento/prato principal, com recusa em casos ambíguos. O modelo selecionado atingiu esse patamar no conjunto de fotos de comida, incluindo a segunda coleta. **Não atingiu baixa taxa de falso positivo em todos os controles botânicos**: essa limitação permanece exposta abaixo, sem retirar esses erros do relatório.

## Fotos e revisão

Foram obtidas 76 imagens do Wikimedia Commons na primeira rodada e outras 72 na segunda. A segunda coleta foi congelada antes da inferência de validação, sem duplicações por SHA-256 ou URL original em relação à primeira. Os termos de busca não foram usados cegamente como verdade: título e imagem foram inspecionados antes de medir. Exemplos corrigidos: ervilha retornada por busca de grão-de-bico, captura de tela retornada por busca de queijo, pessoa chamada “Banana” e torre de água na cidade de Sandwich.

Os arquivos `dataset.json` e `validation-dataset.json` registram IDs, origens, rótulos, notas, licenças, atribuições e SHA-256. `sources.csv` facilita a consulta às fontes. Os binários das fotos não são incorporados ao Git ou ao aplicativo final. A coleta temporária de pesquisa foi removida do build normal.

São 148 imagens no total:

- 81 fotos cujo alvo é um alimento do catálogo, frequentemente com acompanhamentos.
- 27 fotos de pratos/massas/sanduíches, cujo alvo é o nome do prato principal.
- 37 controles: objetos, animais, capturas, embalagens e casos botânicos sem refeição preparada.
- 2 alimentos adicionais e 1 escultura decorativa de cenoura, reportados como desafios separados.

Isso é uma amostra pequena e de conveniência, não uma estimativa universal de precisão. A distribuição não é balanceada, nem todas as classes têm fotos consumíveis suficientes, e a participação das imagens nos dados históricos de pré-treino não pode ser descartada. Os rótulos botânicos distinguem “refeição/alimento destacado” de “espécie de planta”; acertar a espécie de uma planta não significa que ela foi consumida.

## Primeira comparação

| Modelo | Alimentos do catálogo, primeira rodada | Observação |
|---|---:|---|
| MobileNet anterior, implementação real no navegador | 7/45 (15,6%) | Muitas recusas porque a aplicação só mapeava cinco categorias. Não é a acurácia do MobileNet em todas as suas classes ImageNet. |
| CLIP ViT-B/32 quantizado, CPU/ONNX | 33/45 (73,3%) | Mesmo conjunto, prompts fixos e pré-processamento de referência do modelo. |
| SigLIP base patch16 quantizado, CPU/ONNX | 40/45 (88,9%) | Melhor candidato; pesos públicos, sem treinamento com as fotos do teste. |

Nas cinco classes comuns ao aplicativo antigo, foram 7/10 para MobileNet, 9/10 para CLIP e 8/10 para SigLIP no processamento Python de referência. Portanto, a vantagem na tabela ampla vem tanto de qualidade quanto de cobertura maior. O código de produção foi validado separadamente no navegador, com o redimensionamento e a recodificação JPEG efetivamente usados pela câmera.

Também foi tentado o identificador `Xenova/vit-base-patch16-224-in21k-finetuned-food101`; a consulta retornou HTTP 401, sem artefato disponível. **Esse modelo não foi executado nem contado como teste de inferência.** A comparação efetiva contém três reconhecedores.

## Resultados da implementação de produção no navegador

`siglip-browser-results.json`, `results.csv` e `summary.json` contêm cada avaliação, não apenas os casos favoráveis. “Primeira escolha” mede o primeiro rótulo do ranking mesmo quando o filtro decide não mostrá-lo. “Sugestão” considera o filtro de escore/margem; todos os resultados exigem confirmação humana antes de registro.

| Grupo | Primeiro rótulo correto | Sugestões exibidas | Sugestões corretas | Sem sugestão, pede identificação manual |
|---|---:|---:|---:|---:|
| Alimentos, primeira rodada | 42/45 | 39 | 38 | 6 |
| Pratos, primeira rodada | 12/13 | 12 | 12 | 1 |
| Alimentos, 36 fotos novas | 29/36 | 25 | 24 | 11 |
| Pratos, 14 fotos novas | 11/14 | 12 | 10 | 2 |
| **Total das fotos de comida/pratos** | **94/108 (87,0%)** | **88** | **84/88 (95,5%)** | **20** |

Nas 50 fotos novas de comida/pratos, a primeira escolha acertou **40/50 (80%)**. Houve 37 sugestões, com 34 corretas (91,9%). As diferenças entre CPU/ONNX Python e navegador não foram escondidas: navegador usa Canvas com interpolação de alta qualidade e JPEG 0,82; a referência Python usa Pillow e o processador original. Ambas as execuções são guardadas.

Incluindo **todos os 148 casos**, não apenas fotos positivas, o programa exibiu 98 sugestões: **87 corretas e 11 incorretas (88,8% de acerto entre sugestões)**. Em 50 casos não ofereceu sugestão. Não confundir os 95,5% medidos nas fotos de comida com a precisão global das sugestões.

## Falsos positivos e limites

Nos 37 controles, o filtro exibiu 7 sugestões inadequadas e recusou 30. Todas as 7 ocorreram em plantas/folhas; os 25 controles comuns de objetos, animais, capturas e embalagens foram recusados. Entre os 12 controles botânicos, houve 7 sugestões de alimento e 5 recusas. Isso não foi “corrigido” trocando os rótulos após o resultado.

O reconhecedor não comprova que algo é comestível, seguro, fresco ou realmente consumido. Também não identifica ingredientes ocultos nem alergênicos. Há erros entre preparações visualmente parecidas: salada pode parecer tofu, iogurte pode parecer leite coagulado, e um prato com arroz e feijão pode ser confundido com outro preparo. O caso deve continuar corrigível; não há registro automático nem geração de nutrientes sem referência e peso confirmados.

O acerto de “pizza” ou “sushi” não é contabilizado como acerto de cada ingrediente. Pratos fora do catálogo são registrados como nome informado, sem composição presumida. Para calcular seus nutrientes, o usuário registra componentes conhecidos e respectivos pesos, ou usa um preparo de referência compatível quando disponível.

## Implementação e desempenho

O encoder textual foi executado apenas na preparação. Seus vetores normalizados, prompts e revisão estão versionados. O aparelho baixa somente o encoder visual quantizado (~100 MB), ONNX Runtime WASM (~12 MB) e o pequeno bundle/vetores. O manifesto fixa revisão do Hugging Face e SHA-256; tanto build quanto download recebido pelo navegador são verificados. Os arquivos de pesos têm nome por hash; o runtime tem caminho por versão e cache prolongado.

A API usada é ONNX Runtime Web 1.24.3, com um thread WASM e sem GPU obrigatória. O CSP permite `wasm-unsafe-eval` apenas para compilação WebAssembly, sem permitir `unsafe-eval` JavaScript ou código externo. Os arquivos são servidos pelo próprio NutriVibe. O modelo SigLIP é da Google; a conversão ONNX pública é de Xenova, sob a licença declarada Apache-2.0; ONNX Runtime tem licença MIT. Revisão e hashes completos estão em `vision-semantic.json` e nos manifestos de pesquisa.

A mediana observada nas 148 análises no Chromium foi **0,671 s**, P95 **0,731 s**, nesta máquina de teste com CPU, sem GPU. Esses tempos não são promessa para celulares e não representam o download inicial em uma conexão de internet real. O primeiro acesso é mais pesado que o MobileNet anterior; em aparelhos com pouca memória ou internet lenta, a alternativa manual continua disponível. Foram testados Chromium e larguras 360/768/1280, não aparelhos físicos ou todos os navegadores.

## Reproduzir

Na raiz do repositório, com acesso às origens públicas e Chromium/Playwright disponíveis:

```sh
python3 -m pip install -r NutriVibe/ferramentas/benchmark/requirements.txt
python3 NutriVibe/ferramentas/benchmark/download.py
python3 NutriVibe/ferramentas/benchmark/download.py --validation
python3 NutriVibe/ferramentas/benchmark/compare.py
npm ci
npm run build
```

O script de comparação usa `/tmp/nutrivibe-benchmark`, CPU e revisões fixadas. Não requer Torch ou treino de pesos. Os scripts de navegador são executados na raiz com servidor local ativo; `browser-semantic.cjs` usa porta 8097. O baseline usa 8096, bundle de pesquisa específico e os pesos MobileNet de referência, preparados pelo helper antigo antes de preparar novamente o modelo atual. Não execute os helpers do baseline sobre o ambiente publicado.

Os resultados incluem fontes e hashes para detectar alteração da imagem remota; divergências devem ser investigadas, não aceitas trocando o checksum. Nas condições desta sessão, o build de pesquisa baixou fontes/modelos pela Vercel e os arquivos foram obtidos com HTTPS verificado para testes locais. O teste de navegador público continua limitado pela cadeia de certificados do proxy desta máquina; nenhuma verificação TLS foi desabilitada.
