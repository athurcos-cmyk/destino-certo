# Changelog

## [0.1.0] - 2026-07-15

### Added
- Landing page com Aurora gradients, features, how it works, CTA
- Autenticação (Firebase Auth): login com Google e modo anônimo
- Dashboard com cards de roteiros (gradient strip + ícones circulares)
- CRUD de roteiros: título, destino, datas, descrição
- Dias automáticos entre data de início e fim
- Timeline de paradas com linha contínua + dots coloridos
- Modal de adicionar parada (nome, endereço, horário, tipo, notas)
- Tipos de parada: atração, restaurante, hospedagem, transporte, outro
- Compartilhamento via link público (slug único com nanoid)
- Página pública de roteiro compartilhado (timeline + CTA footer)
- API de IA: `/api/ai/pesquisar` (Gemini Flash para pesquisa de lugares)
- API de IA: `/api/ai/sugerir-roteiro` (sugestão automática de roteiro)
- Painel assistente IA no editor de roteiro
- PWA manifest + viewport config
- App shell: sidebar desktop + bottom nav mobile com FAB
- Bottom nav com indicador ativo e safe-area padding
- Página de configurações (perfil do usuário)
- Empty states e loading skeletons
- Design system: sky blue #0EA5E9 + adventure orange #F97316
- Tipografia: Outfit (headings) + Work Sans (body)
- Glassmorphism cards com backdrop-blur
- Touch targets 44x44px (acessibilidade mobile)
- `/compartilhar/[slug]`: CTA "Criar Meu Roteiro" para conversão
- Firestore lazy initialization (evita erro de build sem API key)
- `.env.local.example` com template de variáveis
- Deploy automático Vercel + GitHub

### Technical
- Next.js 16.2 (App Router, Turbopack)
- Tailwind CSS v4
- shadcn/ui components (button, card, dialog, sheet, etc.)
- Firebase Web SDK (Auth + Firestore)
- @vis.gl/react-google-maps (Google Maps React wrapper)
- @google/generative-ai (Gemini Flash)
- TanStack Query v5 (cache e loading states)
- @dnd-kit/core (drag and drop)
- Sonner (toast notifications)
- Lucide React (ícones)
- date-fns (formatação de datas)
- nanoid (slugs únicos)
