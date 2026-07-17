# Segurança — Destino Certo

## Firestore Security Rules

Arquivo: `firestore.rules`. Regras em produção **não foram deployadas** ainda (Firebase CLI autenticado na conta errada).

Regras implementadas (atualizadas e deployadas em 2026-07-16):
- Dono (`donoId == request.auth.uid`) lê/escreve tudo no próprio roteiro
- Colaborador: qualquer usuário autenticado cujo e-mail (`request.auth.token.email`) esteja em `roteiro.colaboradoresEmail` pode ler/escrever dias e paradas, e editar campos de conteúdo do roteiro — mas não pode mudar `donoId`, `colaboradoresEmail`, `compartilhamentoAtivo` ou `slugCompartilhamento`
- Roteiros compartilhados (`compartilhamentoAtivo == true`) são públicos para leitura (view-only)
- Dias e paradas herdam permissão do roteiro pai
- Criação de roteiro exige `donoId == request.auth.uid`

Deploy: `npx firebase deploy --only firestore:rules --project destino-certo12 --account <conta-com-acesso>` (regra do projeto: só rodar com autorização explícita do dono). CLI multi-conta: `npx firebase login:add` adiciona uma conta sem remover a atual; a flag `--account` escolhe qual usar por comando.

## Autenticação

- Firebase Auth: Google Sign-In + E-mail/senha + Anônimo
- Colaboradores são identificados pelo e-mail do provedor de login (Google ou e-mail/senha) — contas anônimas não têm e-mail e por isso não podem ser colaboradoras (só donas)
- Middleware (`src/middleware.ts`) faz verificação leve (headers de segurança)
- Auth check principal é client-side via `AuthProvider` + redirect

## API Keys

- Firebase: `NEXT_PUBLIC_` — visível no bundle (por design do Firebase)
- Google Maps: `NEXT_PUBLIC_` — **precisa ser restrita por domínio** no Google Cloud Console
- `.env.local` no `.gitignore` — nunca commitar

## Checklist de deploy

- [ ] Google Maps API key restrita por domínio (`*.vercel.app`)
- [ ] Firestore rules deployadas
- [ ] Domínios autorizados no Firebase Auth: `destino-certo-phi.vercel.app`, `localhost`
