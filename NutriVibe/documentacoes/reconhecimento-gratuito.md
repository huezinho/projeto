# Reconhecimento gratuito no navegador

## Implementação ativa

O programa usa a **API JavaScript gratuita do TensorFlow.js**, com MobileNet V1 1.0 224 / ImageNet, executado no navegador pelo backend CPU. Não depende de API externa de inferência, crédito, chave OpenAI ou AI Gateway. A chave exclusiva paga foi revogada e removida da produção; as variáveis de modelo/provedor pago também foram removidas. A produção usa `NUTRIVIBE_VISION_PROVIDER=browser-local`, desabilitando a análise remota legada.

A foto permanece no aparelho. O navegador baixa os arquivos estáticos do próprio NutriVibe quando o reconhecimento é aberto pela primeira vez. Nenhuma requisição a `/api/identify` faz parte do fluxo atual. O consentimento da tela refere-se ao processamento local, não a envio de imagem.

Não há taxa por foto. Download e hospedagem continuam sujeitos aos limites do plano Vercel; não se promete tráfego ilimitado. Dispositivos lentos podem levar mais tempo para processar. O arquivo do modelo tem aproximadamente 17 MB e a biblioteca também é carregada sob demanda. A interface informa carregamento e mantém a alternativa manual em caso de erro.

## Cobertura e incerteza

MobileNet é um classificador geral ImageNet, não um detector completo de ingredientes. O mapeamento explícito atende apenas às classes: banana, Granny Smith (maçã), brócolis, pepino e morango. Não se convertem rótulos ambíguos como “sea cucumber” em pepino. Não há reconhecimento confiável de pratos misturados nem segmentação de vários alimentos. Os outros itens do catálogo permanecem disponíveis manualmente.

O resultado de maior escore precisa corresponder a uma classe suportada. Escore >= 0,55 e margem >= 0,15 sobre o segundo rótulo permite uma sugestão mais forte; esses escores **não são probabilidades clínicas nem confiança calibrada**. Se a classe suportada é a primeira mas tem escore entre 0,15 e esse limite, o aplicativo a apresenta como **possibilidade incerta**, solicitando confirmação ou correção. Não procura um alimento em classes secundárias quando o primeiro rótulo é desconhecido. Abaixo dos limites ou com classe não suportada, pede o nome do alimento.

Nenhuma opção é marcada automaticamente e nenhum registro é salvo sem confirmação. A seleção é seguida da confirmação do preparo e do peso; os nutrientes continuam sendo calculados pela base TACO, nunca pelo classificador. Identificação não certifica segurança para consumo, ausência de alergênicos, estado de conservação ou adequação da dieta.

## Arquivos e dependências

- `vision-local-entry.js`: carregamento preguiçoso do modelo, normalização RGB para [-1, 1], redimensionamento 224×224, inferência e descarte dos tensores temporários.
- `vision-labels.js`: correspondências explícitas, limites e hipóteses incertas.
- `prepare-free-vision.js`: preparação de assets e bundle com esbuild.
- `dados/modelo-local-integridade.json`: origem versionada e SHA-256 do manifesto e de cada fragmento de pesos.
- `javascript/vendor` e `modelos`: arquivos gerados, ignorados no Git, servidos como conteúdo público.

Dependências fixadas no lockfile: TensorFlow.js 4.22.0, rótulos de tensorflow-models/mobilenet 2.1.1 e esbuild 0.25.5. Código TensorFlow.js/MobileNet: projetos TensorFlow sob Apache-2.0; os comentários legais de dependências são preservados pelo bundler. Fonte dos pesos: `https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json`. O build verifica os hashes antes de publicar; não desabilita TLS ou verificação para aceitar um modelo diferente.

## Executar

Na raiz do repositório:

```sh
npm ci
npm run build
npm start
```

O primeiro build baixa a distribuição oficial. Builds seguintes podem reutilizar arquivos locais se passarem pelos hashes fixados. Para atualizar o modelo, revisar sua procedência, os limites e o desempenho e atualizar a referência de integridade deliberadamente; não substituir hashes só para contornar erro.

## Validação executada e limitações observadas

- 20 testes de regras/contratos, incluindo rejeição de classes fora da cobertura, margem insuficiente, hipótese fraca e ausência de promoção de classe secundária.
- Build da Vercel compilado com download oficial; os mesmos assets foram obtidos por HTTPS verificado e testados localmente, com hashes fixados.
- Chromium com modelo real: uma captura de tela sem alimento gerou pedido de identificação manual. A imagem `0_100.jpg` do Fruits-360 retornou banana como primeiro rótulo, com escore aproximado de **0,195**, portanto foi apresentada como **hipótese incerta**, não como reconhecimento seguro. Outras três imagens de banana não atingiram os critérios. Não se afirma alta precisão ou validação completa para as cinco classes.
- O fluxo real confirmou a hipótese, preparo e peso, persistência, exclusão e backup. Nenhuma foto foi enviada a `/api/identify`. Perfil, restrições, resumo, navegação e larguras 360/768/1280 também foram exercitados.
- Origem da imagem de teste: `https://raw.githubusercontent.com/Horea94/Fruit-Images-Dataset/master/Training/Banana/0_100.jpg`. A imagem é fornecida ao teste por caminho local, sem ser incorporada à aplicação.

Para repetir o teste, mantenha servidor separado com banco de testes, configure `NUTRIVIBE_TEST_IMAGE` com o caminho dessa imagem e execute, dentro de NutriVibe: `NUTRIVIBE_URL=http://127.0.0.1:8096 NUTRIVIBE_TEST_IMAGE=/caminho/banana.jpg node testes/browser.cjs`.

O navegador de testes não confiou no certificado de interceptação da rede para o domínio público. A validação do modelo foi feita no servidor local com os assets publicados, sem desabilitar TLS. As verificações HTTP públicas são realizadas por cliente com cadeia de confiança válida. Câmera física, Firefox, Safari, aparelhos lentos e avaliação ampla de acurácia continuam pendentes.
