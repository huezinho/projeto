# NutriVibe

## Ideia do projeto

O NutriVibe é um aplicativo web de educação alimentar voltado a crianças com seletividade alimentar e seus responsáveis. A proposta é ajudar as famílias a organizar a rotina de refeições, acompanhar o que foi consumido e explorar alimentos variados de acordo com as preferências e restrições cadastradas.

O diário permite escolher alimentos pelo catálogo ou começar o registro por uma foto. Após confirmar o alimento e a quantidade, o usuário pode consultar estimativas nutricionais com base na Tabela Brasileira de Composição de Alimentos (TACO) e ver o resumo do dia. O aplicativo também oferece conteúdo educativo e sugestões para variar as refeições. A landing page apresenta o projeto e dá acesso ao aplicativo.

## Mudanças futuras

- Separar os perfis de responsáveis e crianças, associar preferências a cada perfil e preservar os registros atuais durante a migração.
- Ampliar os conteúdos educativos e o catálogo de alimentos, com linguagem acessível e referências identificadas.
- Aprimorar as justificativas das sugestões e testar o reconhecimento com pratos compostos, fotos variadas e celulares reais.
- Reduzir o tamanho do download do modelo de reconhecimento e avaliar o uso de memória e o tempo de resposta em celulares.
- Avaliar a navegação por teclado, o contraste e o uso com tecnologias assistivas.
- Planejar a sincronização do diário entre dispositivos, com controles de acesso e privacidade.

Veja o [relatório do projeto](NutriVibe/documentacoes/relatorio-projeto/README.md) para mais detalhes.

## Integrantes do grupo

| Integrante | Área de atuação |
| --- | --- |
| Paulo Capreti | JavaScript e integração dos fluxos do aplicativo |
| Davi Pioli | HTML e acompanhamento do Kanban |
| Victor Almeida | CSS, responsividade e identidade visual |
| Marcelo Dalbone | Pesquisa |
| Akiane Merbach | Pesquisa |

## Tecnologias utilizadas

- **HTML, CSS e JavaScript** para a interface da landing page e do aplicativo.
- **Node.js 24** para a API.
- **Vercel** para hospedar o site e executar a API.
- **Neon (PostgreSQL)** para armazenar contas e preferências em produção. No desenvolvimento local, o projeto usa **SQLite**.
- **Better Auth** para cadastro e login com e-mail e senha.
- **SigLIP e ONNX Runtime Web** para sugerir o alimento principal de uma foto. O modelo roda no navegador e a foto permanece no dispositivo. O usuário confirma ou corrige a sugestão antes de salvar.

## Documentação

- [Comparação dos modelos, resultados e fontes](NutriVibe/documentacoes/avaliacao-imagens/README.md)
- [Reconhecimento gratuito, testes e limitações](NutriVibe/documentacoes/reconhecimento-gratuito.md)
- [Cálculo nutricional, fonte e confirmação de quantidade](NutriVibe/documentacoes/nutricao.md)
- [Implementação, testes, configuração e limites](NutriVibe/documentacoes/implementacao.md)
- [Backlog fornecido](NutriVibe/documentacoes/historico/backlog-jira.json)
- [Publicação e configuração da Vercel](NutriVibe/documentacoes/vercel.md)

## Acesse o NutriVibe

[Landing page do NutriVibe](https://nutrivibe-gamma.vercel.app)
