# Busca rápida — Destino Certo

## Por assunto

| Tema | Onde procurar | Comando rápido |
|---|---|---|
| Estado atual | `SESSAO.md` | — |
| Mudanças recentes | `CHANGELOG.md` | — |
| Histórico detalhado | `docs/history/2026-07.md` | — |
| Arquitetura | `docs/ARCHITECTURE.md` | `rg "pattern" docs/ARCHITECTURE.md` |
| Design system | `docs/design/DESIGN.md` | — |
| Pendências | `docs/planning/TODOS.md` | — |
| Segurança | `docs/SECURITY.md`, `firestore.rules` | — |

## Por arquivo/componente

| Componente | Arquivo |
|---|---|
| Landing page | `src/app/page.tsx` |
| Login | `src/app/(public)/login/page.tsx` |
| Dashboard | `src/app/app/page.tsx` |
| Editor de roteiro | `src/app/app/roteiro/[id]/page.tsx` |
| App shell | `src/app/app/layout.tsx` |
| Root layout | `src/app/layout.tsx` |
| CSS/Design tokens | `src/app/globals.css` |
| Firebase config | `src/lib/firebase/config.ts` |
| Firestore helpers | `src/lib/firebase/firestore.ts` |
| Auth provider | `src/components/auth/auth-provider.tsx` |
| Map component | `src/components/mapa/mapa-roteiro.tsx` |
| Places search | `src/components/mapa/busca-lugares.tsx` |
| Parada card | `src/components/roteiro/parada-sortavel.tsx` |
| Service Worker | `public/sw.js` |
| PWA register | `src/components/shared/pwa-register.tsx` |
| Offline sync | `src/lib/offline/sync-handler.ts` |
| Tipos | `src/lib/types/roteiro.ts` |

## Por rota

| Rota | Arquivo |
|---|---|
| `/` | `src/app/page.tsx` |
| `/login` | `src/app/(public)/login/page.tsx` |
| `/app` | `src/app/app/page.tsx` |
| `/app/roteiro/novo` | `src/app/app/roteiro/novo/page.tsx` |
| `/app/roteiro/[id]` | `src/app/app/roteiro/[id]/page.tsx` |
| `/app/configuracoes` | `src/app/app/configuracoes/page.tsx` |
| `/compartilhar/[slug]` | `src/app/(public)/compartilhar/[slug]/page.tsx` |
