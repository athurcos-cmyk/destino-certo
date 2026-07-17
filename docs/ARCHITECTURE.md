# Arquitetura — Destino Certo

## Visão Geral

PWA mobile-first para criar, organizar e compartilhar itinerários de viagem. O usuário monta roteiros dia a dia com paradas, visualiza no mapa, e compartilha via link.

## Stack

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 16 (App Router) | Vercel nativo, RSC, PWA |
| Auth | Firebase Auth | Google + E-mail/senha + Anônimo |
| Database | Firestore Web SDK | Offline persistence nativa via IndexedDB |
| Mapas | @vis.gl/react-google-maps | Wrapper oficial Google |
| UI | Tailwind v4 + shadcn/ui | Utility-first, themeável |
| DnD | @dnd-kit/core + sortable | Leve, touch-friendly |
| Toasts | Sonner | Toast notifications |
| Ícones | Lucide React | Tree-shakeable |
| Offline | enableIndexedDbPersistence + sync queue | Fire-and-forget writes |

## Arquitetura

```
Browser/PWA
    |
    v
Next.js App Router (Vercel)
    |
    ├── Server Components (RSC)
    │   ├── Landing page (estática)
    │   ├── Shared itinerary page (dinâmica por slug)
    │   └── Metadata/SEO
    |
    ├── Client Components
    │   ├── Auth (Firebase Auth SDK)
    │   ├── Dashboard (Firestore + React Query)
    │   ├── Itinerary Editor (timeline + mapa + drag-and-drop)
    │   └── UI Components (shadcn/ui + Tailwind)
    |
    └── External Services
        ├── Firebase Auth (client-side)
        ├── Firestore (client-side, IndexedDB offline persistence)
        └── Google Maps API (client-side, Places library)
```

## Offline-First

### Fire-and-forget nas escritas

```ts
// ✅ Correto: dispara e trata erro depois
addDocument("paradas", dados).catch((err) => console.error(err));
setOpen(false); // fecha dialog imediatamente

// ❌ Errado: bloqueia a UI esperando a rede
await addDocument("paradas", dados);
setOpen(false);
```

Toda escrita no Firestore usa `.catch()` em vez de `await`. A UI responde imediatamente. O Firestore faz sync em background via `enableIndexedDbPersistence`.

### Fila de sync

Quando offline, as operações vão para `localStorage` (`src/lib/offline/sync-queue.ts`). Ao reconectar (`window.addEventListener("online")`), `processQueue()` no `sync-handler.ts` processa a fila em ordem.

### SW auto-refresh

O service worker (`public/sw.js`) usa `skipWaiting()` + `clients.claim()`. Ao detectar nova versão (`updatefound`), ativa imediatamente e força `window.location.reload()`. Sem botão, sem prompt.

## Rotas

```
/                                     Landing page
├── /login                            Login (Google + Anônimo)
├── /compartilhar/[slug]             Roteiro público (somente leitura)
├── /app                              Dashboard (auth required)
│   ├── /app/roteiro/novo            Criar roteiro
│   ├── /app/roteiro/[id]            Editor (timeline + mapa + drag-and-drop)
│   └── /app/configuracoes           Perfil
```

## Schema Firestore

```
/usuarios/{uid}
  nome, email, fotoURL, criadoEm

/roteiros/{roteiroId}
  titulo, descricao, destino, imagemCapa
  dataInicio, dataFim
  donoId
  colaboradoresEmail: string[]  // e-mails com permissão de edição
  slugCompartilhamento, compartilhamentoAtivo  // link público view-only
  criadoEm, atualizadoEm

/roteiros/{roteiroId}/dias/{diaId}
  data, numeroDia, notas, ordem

/roteiros/{roteiroId}/dias/{diaId}/paradas/{paradaId}
  placeId, nome, endereco
  localizacao: { lat, lng }
  tipo: 'atracao'|'restaurante'|'hospedagem'|'transporte'|'outro'
  horarioInicio, horarioFim, notas, ordem
```

## Estrutura de Arquivos

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fontes, providers, metadata)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Design tokens, keyframes
│   ├── manifest.ts             # PWA manifest
│   ├── (public)/login/         # Login page
│   ├── (public)/compartilhar/  # Shared itinerary (server component)
│   └── app/                    # Authenticated routes
│       ├── layout.tsx          # App shell (sidebar + nav + sync/offline providers)
│       ├── page.tsx            # Dashboard
│       ├── roteiro/novo/       # Create itinerary
│       ├── roteiro/[id]/       # Editor (timeline + map + dnd)
│       └── configuracoes/      # User settings
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── auth/                   # AuthProvider
│   ├── roteiro/                # ParadaSortavel
│   ├── mapa/                   # MapaRoteiro, BuscaLugares
│   └── shared/                 # LoadingScreen, EmptyState, OnlineStatus, SyncProvider, PwaRegister
└── lib/
    ├── firebase/                # config (offline persistence), auth, firestore (fire-and-forget)
    ├── google-maps/             # APIProvider wrapper
    ├── offline/                 # sync-queue.ts, sync-handler.ts
    ├── hooks/                   # use-online-status, etc.
    ├── types/                   # roteiro.ts, usuario.ts
    ├── utils/                   # formatar-data.ts, gerar-slug.ts
    └── constants/               # TIPO_PARADA_LABELS, CORES_TIPO_PARADA
```

## Decisões de Arquitetura

### 1. Firestore client-side (não API Routes)

**Por que**: Offline persistence nativa via IndexedDB. Se usássemos API Routes como proxy, perderíamos cache offline.

### 2. Fire-and-forget (não await)

**Por que**: Escritas não bloqueiam a UI. Firestore faz sync em background. Padrão do Zerou, adaptado para este app.

### 3. Subcoleções aninhadas

`roteiros/{id}/dias/{id}/paradas/{id}`. Isolamento natural, regras de segurança simples.

### 4. SW auto-refresh

Detecta nova versão → `skipWaiting()` → `controllerchange` → `window.location.reload()`. Sem prompt de usuário.

### 5. Lazy initialization do Firebase

Firebase app inicializado na primeira chamada, não no import. Evita erro de build sem API key.

## Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Hobby | $0 |
| Firebase Auth | Spark | $0 |
| Firestore | Spark (1GB, 50K leituras/dia) | $0 |
| Google Maps | $200 crédito mensal | $0 |
| **Total** | | **$0/mês** |
