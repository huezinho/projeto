# Publicação na Vercel

## Estado desta preparação

O código está adaptado para Vercel, mas adaptação, integração à main e publicação são etapas diferentes. A configuração foi validada por build local e testes; não equivale a um deploy remoto confirmado. Esta sessão não tinha VERCEL_TOKEN nem login da Vercel e o login CLI não pôde ser concluído. A chamada de leitura à API Vercel respondeu que falta token de autenticação. Não foi criado projeto, URL pública ou banco remoto.

## Configuração versionada

O **Root Directory é a raiz do repositório**, não a pasta NutriVibe. `package.json` fixa Node 24.x, dependências com lockfile e o comando de build. `vercel.json` usa framework “Other”, `npm run build` e diretório de saída `public`.

O build copia exclusivamente `html`, `css`, `javascript`, `dados` e `imagens`. Documentos, planilha original, testes, banco e segredos não são públicos. Os valores nutricionais e suas descrições são intencionalmente públicos no catálogo. `/` redireciona para a landing page e `/app` redireciona para o aplicativo, preservando os caminhos relativos dos links. A API é encaminhada para `api/index.mjs`.

O servidor foi separado de sua inicialização: importar o handler não abre porta, não cria diretórios e não inicializa SQLite. O adaptador aceita JSON já processado pelo runtime serverless. O timeout da função é 60 s; a chamada de imagem tem limite próprio de 25 s. A Vercel aplica limites de tamanho de requisição; as fotos são reduzidas no navegador antes do envio.

## Variáveis na Vercel

| Variável | Configuração |
|---|---|
| `POSTGRES_URL` ou `DATABASE_URL` | URL PostgreSQL **Neon** gerada pela integração de banco. O cliente usa HTTP próprio do Neon; não é um conector para qualquer servidor PostgreSQL. |
| `NUTRIVIBE_VISION_KEY` | Chave OpenAI, somente no servidor, para identificação real de fotos. |
| `NUTRIVIBE_VISION_MODEL` | Opcional, padrão `gpt-4o-mini`. |

As variáveis devem ser cadastradas para Production e, se desejado, Preview. Valores ficam no gerenciador de segredos, nunca no código, chat ou arquivos públicos. Adicionar uma variável exige novo deploy para ativá-la. VERCEL_TOKEN é credencial da ferramenta de publicação; não precisa ser cadastrado como variável da aplicação hospedada.

## Contatos persistentes

Na nuvem, contatos são gravados em Neon PostgreSQL através de `@neondatabase/serverless`, com transação e parâmetros SQL. A tabela é criada de forma idempotente na primeira gravação. Não há fallback para SQLite efêmero na Vercel: sem banco configurado ou em falha, o formulário informa indisponibilidade e não finge salvar.

Para configurar, conecte um banco Neon em Vercel → Marketplace/Storage e associe-o ao projeto. Verifique se foi gerada `POSTGRES_URL` ou `DATABASE_URL`. O endpoint `GET /api/status` informa apenas presença de configuração; não prova conectividade. Confirme com um cadastro real de teste e verificação no banco. Dados de contatos já existentes no SQLite local não são migrados automaticamente.

O SQLite permanece para desenvolvimento local. Perfis e históricos alimentares continuam no navegador do usuário, com backup JSON. Mudar de localhost para o domínio público não transfere o localStorage: exporte no ambiente anterior e importe no novo se quiser conservar os dados. Fotos não são persistidas.

## Publicar

É preciso autorizar uma conta Vercel. Há duas rotas:

1. Importar `huezinho/projeto` em `https://vercel.com/new`, selecionar main e manter a raiz do repositório. Conectar Neon, cadastrar a chave de visão e publicar. A integração GitHub da Vercel deve ter acesso ao repositório para que novos pushes na main produzam deploys.
2. Disponibilizar VERCEL_TOKEN nas configurações seguras deste ambiente para o agente executar a publicação CLI. Uma equipe pode exigir identificar o escopo. O agente não pode criar conta ou aceitar permissões da conta em nome do usuário sem acesso.

Com CLI autenticada, a publicação usa `vercel --prod --yes` na raiz. Só declarar sucesso após obter a URL real e conferir o estado READY. Se a Vercel pedir plano pago ou uma assinatura de banco, interromper para decisão do responsável; nenhum serviço pago foi contratado nesta preparação.

## Verificação após o deploy

- GET `/` e `/app` devem redirecionar para as páginas corretas, sem perder caminhos relativos.
- GET `/api/status` deve retornar JSON, sem revelar valores secretos.
- Enviar um contato consentido, confirmar HTTP 201 e a linha no Neon; testar repetição do e-mail sem duplicar.
- Fazer identificação real com imagem conhecida e confirmar preparo/peso, depois testar uma imagem ambígua e correção manual.
- Testar registro, resumo nutricional, restrições, backup e navegação no domínio público.
- Verificar que `/servidor/server.js`, `/.env`, `/.data/nutrivibe.sqlite` e documentos não são publicados.

## Limites operacionais

Os testes locais verificaram o contrato de transação com Neon usando cliente controlado, não um banco Neon remoto. O limite de solicitações em memória é por instância e não garante limitação global em serverless; para maior tráfego, adote proteção distribuída/WAF. Não existe login nem sincronização centralizada de perfis. Backup, retenção dos contatos, exclusão por solicitação e revisão de privacidade continuam responsabilidades operacionais antes de uso em larga escala. Não há envio automático de e-mails.

CI no GitHub valida instalação com lockfile, testes e build. Aprovação nessa CI não comprova publicação ou operação do banco/IA externos.
