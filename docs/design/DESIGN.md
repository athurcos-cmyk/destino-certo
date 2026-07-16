# Design System — Destino Certo

## Cores

| Token | CSS Variable | Hex | Uso |
|-------|-------------|-----|-----|
| Primary | `--primary` | `#0EA5E9` | App chrome, links, sidebar ativo, badges |
| CTA | `--cta` | `#F97316` | Botões de ação principal (1 por tela) |
| Background | `--background` | `#F0F9FF` | Fundo com leve tom azul |
| Text | `--foreground` | `#0C4A6E` | Texto principal |
| Muted | `--muted` | `oklch(0.965 0.02 236.6)` | Fundos secundários |
| Border | `--border` | `oklch(0.91 0.02 236.6)` | Bordas |

**Regra:** usar variáveis CSS (`bg-primary`, `text-cta`, `bg-background`). Não usar hex/rgba literal fora de `globals.css`. Exceção: landing page (`src/app/page.tsx`) e ícones.

## Tipografia

| Uso | Fonte | Peso |
|-----|-------|------|
| Headings (h1-h4) | **Outfit** | 400-800 |
| Body, UI labels | **Work Sans** | 400-600 |

Classes: `font-heading` para títulos, `font-sans` (padrão) para corpo.

## Layout

- **Mobile-first**. Breakpoints: 375px, 768px (md), 1024px (lg).
- Container: `max-w-6xl` (landing), `max-w-2xl` (editor timeline), `max-w-4xl` (dashboard).
- Sidebar desktop (md+): 256px. Bottom nav mobile com FAB central.

## Componentes-base

| Componente | Quando usar |
|---|---|
| `Button` | Ações. CTA laranja (`bg-cta`) para ação principal, outline/ghost para secundárias |
| `Card` | Agrupar conteúdo. Cards de roteiro com strip gradiente |
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
