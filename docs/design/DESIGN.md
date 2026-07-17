# Design System — Destino Certo

## Direção: "Boarding Pass / Diário de Viagem"

Desde 2026-07-17 o app segue uma direção visual intencional (via skill `/frontend-design`, não é mais o UI genérico de SaaS de antes): o app parece um artefato de viagem de verdade — cartão de embarque, carimbo de passaporte, rota tracejada — em vez de cards de vidro fosco e blobs de gradiente.

## Cores

| Token | CSS Variable | Hex | Uso |
|-------|-------------|-----|-----|
| Primary | `--primary` | `#0EA5E9` | App chrome, links, sidebar ativo, badges, header de "bilhete" |
| CTA | `--cta` | `#F97316` | Botões de ação principal (1 por tela) |
| Background | `--background` | `#F0F9FF` | Fundo com leve tom azul |
| Paper | `--paper` / `--paper-foreground` | `oklch(0.965 0.02 75)` | Superfície "papel" quente — hero, login, CTA (com `.bg-grain`) |
| Text | `--foreground` | `#0C4A6E` | Texto principal |
| Muted | `--muted` | `oklch(0.965 0.02 236.6)` | Fundos secundários |
| Border | `--border` | `oklch(0.91 0.02 236.6)` | Bordas |

**Regra:** usar variáveis CSS (`bg-primary`, `text-cta`, `bg-background`, `bg-paper`). Não usar hex/rgba literal fora de `globals.css`. Exceção: ícones de terceiros (ex: logo do Google).

## Motivos recorrentes

| Classe utilitária | Efeito | Onde usar |
|---|---|---|
| `.bg-grain` | Textura de grão sutil (SVG, sem imagem) | Superfícies `bg-paper`, banners grandes |
| `.route-dashed` | Linha tracejada vertical estilo "rota de voo" | Conector da timeline (editor + página pública) |
| `.ticket-notch` | Recorte semicircular nas laterais (meio da altura) | Cards/painéis autônomos estilo bilhete inteiro |
| `.ticket-notch-bottom` | Recorte semicircular na base | Headers de card/página que têm conteúdo abaixo (dashboard, login, compartilhar) — sempre seguido de `border-t-2 border-dashed` |

## Tipografia

| Uso | Fonte | Peso |
|-----|-------|------|
| Headings (h1-h4, `font-heading`) | **Fraunces** (serifada, variável) | 400-900, usar `italic` pra destaque editorial |
| Body, UI labels | **Work Sans** | 400-600 |

Classes: `font-heading` para títulos, `font-sans` (padrão) para corpo. Marca ("Destino Certo") sempre em `font-heading italic`.

## Layout

- **Mobile-first**. Breakpoints: 375px, 768px (md), 1024px (lg).
- Container: `max-w-6xl` (landing), `max-w-2xl` (editor timeline), `max-w-4xl` (dashboard).
- Sidebar desktop (md+): 256px. Bottom nav mobile com FAB central.

## Componentes-base

| Componente | Quando usar |
|---|---|
| `Button` | Ações. CTA laranja (`bg-cta`) para ação principal, outline/ghost para secundárias |
| `Card` | Agrupar conteúdo. Cards de roteiro em formato "canhoto de bilhete" (header colorido + `.ticket-notch-bottom` + divisor tracejado) |
| `Dialog` | Modais de formulário (adicionar/editar parada) |
| `Badge` | Tags de tipo de parada e status |
| `Skeleton` | Loading states com shimmer |
| `EmptyState` | Telas vazias com ícone + mensagem + CTA |

## Touch & Acessibilidade

- Touch targets: mínimo 44x44px (`min-w-[44px] min-h-[44px]`)
- Gap entre alvos: mínimo 8px (`gap-2`)
- `touch-action: manipulation` no body
- Focus rings visíveis via `outline-ring/50`

## Animações

- Duração: 150-300ms micro-interações, 300-500ms page-level
- Apenas `transform` e `opacity` (GPU-composited)
- `prefers-reduced-motion` respeitado via `motion-reduce:animate-none`
