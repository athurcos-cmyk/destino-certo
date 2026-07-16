# System Design - Destino Certo

## Visão Geral

**Destino Certo** é um PWA (Progressive Web App) para criar, organizar e compartilhar itinerários de viagem. O usuário monta roteiros dia a dia com paradas (lugares), visualiza no mapa, e compartilha via link com família e amigos.

## Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| Framework | Next.js (App Router) | 16.2 | Melhor integração Vercel, API Routes, RSC, PWA nativo |
| Linguagem | TypeScript | 5.x | Tipagem ponta a ponta |
| UI | Tailwind CSS | 4.x | Utility-first, tree-shaking nativo |
| Componentes | shadcn/ui | latest | Acessível, themeável, copia o código (não é pacote) |
| Hosting | Vercel | - | Deploy zero-config, preview por branch, edge network |
| Autenticação | Firebase Auth | Web SDK | Login Google + Anônimo |
| Banco de Dados | Firestore | Web SDK | NoSQL, tempo real, persistência offline nativa |
| Mapas | Google Maps JavaScript API | v3 | @vis.gl/react-google-maps (wrapper oficial) |
| IA | Gemini Flash 2.0 | v1 | Pesquisa de lugares + sugestão de roteiros |
| Cache/Query | TanStack Query | v5 | Cache, loading states, refetch |
| Drag & Drop | @dnd-kit/core | latest | Leve, acessível, touch-friendly |
| Toasts | Sonner | latest | Toast notifications |
| Ícones | Lucide React | latest | Tree-shakeable, consistente |

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
    │   ├── Dashboard (React Query + Firestore)
    │   ├── Itinerary Editor (timeline + mapa + IA)
    │   └── UI Components (shadcn/ui + Tailwind)
    |
    ├── API Routes (server-side)
    │   ├── POST /api/ai/pesquisar (Gemini Flash)
    │   └── POST /api/ai/sugerir-roteiro (Gemini Flash)
    |
    └── External Services
        ├── Firebase Auth (client-side)
        ├── Firestore (client-side, offline persistence)
        ├── Google Maps API (client-side, Places library)
        └── Gemini API (server-side, via API route)
```

### Por que Firestore no client-side?

Firestore Web SDK tem **persistência offline nativa** via IndexedDB. Roteiros ficam disponíveis mesmo sem internet. React Query gerencia o cache e os loading states. As regras de segurança do Firestore garantem que cada usuário só acessa seus próprios dados.

### Por que Gemini via API Route?

A chave da API do Gemini **nunca é exposta ao cliente**. O browser chama `/api/ai/pesquisar`, o servidor faz a requisição ao Gemini com a chave secreta, e retorna o resultado. Isso evita vazamento da API key e permite rate limiting.

## Estrutura de Rotas

```
/                                     Landing page (estática)
├── /login                            Login (Google + Anônimo)
├── /compartilhar/[slug]             Roteiro público (dinâmica, somente leitura)
├── /app                              Dashboard (auth required)
│   ├── /app/roteiro/novo            Criar novo roteiro
│   ├── /app/roteiro/[id]            Editor principal (timeline + mapa + IA)
│   ├── /app/roteiro/[id]/editar     Editar metadados
│   └── /app/configuracoes           Perfil do usuário
├── /api/ai/pesquisar                POST - Pesquisa IA de lugares
├── /api/ai/sugerir-roteiro          POST - Sugestão IA de roteiro completo
└── /manifest.webmanifest             PWA manifest
```

## Schema Firestore

```
/usuarios/{uid}
  nome: string | null
  email: string | null
  fotoURL: string | null
  criadoEm: Timestamp

/roteiros/{roteiroId}
  titulo: string
  descricao: string
  destino: string
  imagemCapa: string | null
  dataInicio: Timestamp
  dataFim: Timestamp
  donoId: string
  colaboradores: string[]
  slugCompartilhamento: string | null
  compartilhamentoAtivo: boolean
  criadoEm: Timestamp
  atualizadoEm: Timestamp

/roteiros/{roteiroId}/dias/{diaId}
  data: Timestamp
  numeroDia: number
  notas: string
  ordem: number

/roteiros/{roteiroId}/dias/{diaId}/paradas/{paradaId}
  placeId: string
  nome: string
  endereco: string
  localizacao: GeoPoint {lat, lng}
  tipo: 'atracao' | 'restaurante' | 'hospedagem' | 'transporte' | 'outro'
  horarioInicio: string | null
  horarioFim: string | null
  notas: string
  ordem: number
```

### Regras de Segurança

- Usuário autenticado: CRUD nos próprios roteiros/dias/paradas
- Usuário anônimo: CRUD nos próprios roteiros (vinculados ao UID anônimo)
- Público: Leitura de roteiros com `compartilhamentoAtivo: true` via `slugCompartilhamento`

## Design System

### Cores

| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#0EA5E9` | App chrome, links, sidebar ativo, badges, ícones |
| CTA | `#F97316` | Botões de ação principal (1 por tela) |
| Background | `#F0F9FF` | Fundo com leve tom azul |
| Text | `#0C4A6E` | Texto principal (azul escuro) |
| Muted | `oklch(0.965 0.02 236.6)` | Fundos secundários |
| Border | `oklch(0.91 0.02 236.6)` | Bordas com tom azul |

### Tipografia

| Uso | Fonte | Peso |
|-----|-------|------|
| Headings (h1-h4) | Outfit | 400-800 |
| Body, UI labels | Work Sans | 400-600 |
| Logo | Outfit | 700 |

### Touch & Acessibilidade

- Touch targets: mínimo 44x44px
- Gap entre alvos: mínimo 8px (gap-2)
- `touch-action: manipulation` no body
- Focus rings visíveis
- `prefers-reduced-motion` respeitado via Tailwind

### Efeitos

- Aurora gradients animados na landing page (3 blobs com blur-3xl)
- Glassmorphism nos cards de feature
- Timeline com linha contínua + dots coloridos
- Time pills com `rounded-full` para horários
- Card entry animation no dashboard (staggered fade-in)

## Estrutura de Arquivos

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fontes, providers, metadata)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Design system CSS (cores, tipografia, keyframes)
│   ├── manifest.ts             # PWA manifest
│   ├── (public)/               # Rotas públicas (sem auth)
│   │   ├── login/page.tsx
│   │   └── compartilhar/[slug]/page.tsx
│   ├── app/                    # Rotas autenticadas
│   │   ├── layout.tsx          # App shell (sidebar, nav, header)
│   │   ├── page.tsx            # Dashboard
│   │   ├── roteiro/
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/page.tsx   # Editor principal
│   │   └── configuracoes/page.tsx
│   └── api/ai/                 # API routes (server-side)
│       ├── pesquisar/route.ts
│       └── sugerir-roteiro/route.ts
├── components/
│   ├── ui/                     # shadcn/ui (button, card, dialog, etc.)
│   ├── auth/                   # AuthProvider
│   ├── layout/                 # AppShell, BottomNav, SideNav
│   ├── landing/                # Hero, Features, HowItWorks
│   ├── roteiro/                # RoteiroCard, RoteiroForm, DiaTimeline
│   ├── mapa/                   # MapaRoteiro, BuscaLugares
│   ├── ai/                     # AssistentePainel, SugestaoCard
│   └── shared/                 # LoadingScreen, EmptyState, QueryProvider
└── lib/
    ├── firebase/                # config.ts, auth.ts, firestore.ts
    ├── google-maps/             # config.tsx (APIProvider wrapper)
    ├── ai/                      # gemini.ts, prompts.ts
    ├── hooks/                   # use-auth, use-roteiros, use-dias, use-paradas
    ├── types/                   # roteiro.ts, dia.ts, parada.ts, usuario.ts, ai.ts
    ├── utils/                   # formatar-data.ts, gerar-slug.ts, cn.ts
    └── constants/               # TIPO_PARADA_LABELS, CORES_TIPO_PARADA
```

## Decisões de Arquitetura

### 1. Firestore no client-side em vez de API Routes

**Decisão**: Firestore Web SDK direto no browser com React Query.

**Por que**: O Firestore tem offline persistence nativo. Se usássemos API Routes como proxy, perderíamos esse benefício. As regras de segurança do Firestore garantem isolamento por usuário.

### 2. Gemini via API Route (não no client)

**Decisão**: Chamadas ao Gemini passam por `/api/ai/*` no servidor.

**Por que**: A chave da API nunca deve ser exposta ao browser. O servidor faz o request e retorna só o resultado limpo.

### 3. Subcoleções aninhadas (não top-level)

**Decisão**: `roteiros/{id}/dias/{id}/paradas/{id}` em vez de coleções separadas.

**Por que**: Isolamento natural dos dados, regras de segurança mais simples, e nunca precisamos de queries cross-roteiro (ex: "todas as paradas de todos os roteiros").

### 4. Tailwind v4 + shadcn/ui

**Decisão**: Tailwind v4 com CSS-based config (sem tailwind.config.ts) + shadcn/ui.

**Por que**: Tailwind v4 é o padrão do Next.js 16. shadcn/ui copia o código fonte (não é dependência), permitindo customização total. Menos breaking changes em atualizações.

### 5. Lazy initialization do Firebase

**Decisão**: Firebase app só é inicializado na primeira chamada, não no import.

**Por que**: Evita erro de "invalid API key" durante o build do Next.js, quando as variáveis de ambiente não estão disponíveis no server-side rendering.

## Estimativa de Custos

| Serviço | Plano | Custo mensal estimado |
|---------|-------|----------------------|
| Vercel | Hobby | $0 (gratuito) |
| Firebase Auth | Spark (free) | $0 (ilimitado anônimo, Google) |
| Firestore | Spark (free) | $0 (1GB armazenamento, 50K leituras/dia) |
| Google Maps | $200 crédito mensal | $0 (uso pessoal) |
| Gemini Flash | Free tier | $0 (1.500 req/dia) |
| **Total** | | **$0/mês** |
