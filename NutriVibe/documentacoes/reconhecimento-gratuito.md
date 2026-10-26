# Reconhecimento gratuito — implementação atual

O MobileNet anterior foi substituído por **SigLIP quantizado com ONNX Runtime Web**, após comparação com fotos públicas e validação com o modelo real no navegador. O funcionamento continua local, sem chave de inferência ou cobrança por foto. A chave paga permanece revogada.

Veja [avaliação completa, fontes, resultados individuais e limitações](avaliacao-imagens/README.md).

Em 108 fotos de comida/pratos, o primeiro rótulo acertou 94 (87%). Na segunda coleta, foram 40 acertos em 50 fotos novas (80%). Com recusa de casos incertos, houve 84 sugestões corretas de 88 **nas fotos de comida**. Considerando os 148 casos, inclusive controles, foram 87 sugestões corretas de 98 exibidas; os erros não foram omitidos.

A análise sugere o alimento ou o nome do prato principal, não todos os ingredientes. A confirmação permanece obrigatória. Pratos sem composição confirmada são registrados sem nutrientes presumidos. Nenhum resultado comprova segurança para consumo ou ausência de alergênicos. Há limitações com plantas e folhas, preparações parecidas e alimentos fora dos rótulos previstos.

O primeiro uso baixa aproximadamente 112 MB do próprio site; depois o modelo pode ser reutilizado pelo cache. Não há envio da foto ao servidor. O texto da interface distingue reconhecimento de prato, alimento e pedido de correção manual.

Para executar: `npm ci`, `npm run build`, `npm start`, na raiz. O build baixa o encoder público na revisão fixada, confere SHA-256 e gera os assets. Não são necessários OpenAI, AI Gateway, créditos ou tokens de IA. Perfil e histórico ficam no navegador; contatos continuam no Neon.
