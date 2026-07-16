# Segurança — Destino Certo

## Firestore Security Rules

Arquivo: `firestore.rules`. Regras em produção **não foram deployadas** ainda (Firebase CLI autenticado na conta errada).

Regras implementadas:
- Usuário autenticado só lê/escreve os próprios roteiros (`donoId == request.auth.uid`)
- Roteiros compartilhados (`compartilhamentoAtivo == true`) são públicos para leitura
- Dias e paradas herdam permissão do roteiro pai
- Criação de roteiro exige `donoId == request.auth.uid`

Deploy pendente: `npx firebase deploy --only firestore:rules --project destino-certo12`

## Autenticação

- Firebase Auth: Google Sign-In + Anônimo
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
