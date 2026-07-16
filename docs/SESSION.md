# Sessão de Desenvolvimento

**Data**: 2026-07-15
**Projeto**: Destino Certo (itinerário de viagens PWA)
**Stack**: Next.js 16 + Firebase + Vercel + Gemini Flash

---

## O que foi feito

### 1. Setup do Projeto
- `create-next-app` com TypeScript, Tailwind v4, App Router
- Instalação de dependências: Firebase, Google Maps, React Query, shadcn/ui, dnd-kit, Gemini
- Inicialização do shadcn/ui com 15 componentes
- Estrutura de diretórios completa

### 2. Configuração Firebase
- Projeto `destino-certo12` no Firebase Console
- Auth: Anônimo habilitado (Google pendente)
- Firestore Database criado
- Domínios autorizados: `destino-certo-phi.vercel.app` adicionado

### 3. Autenticação
- AuthProvider com Google + Anônimo
- Middleware de proteção de rotas
- Página de login com design Aurora
- Redirecionamento automático após login

### 4. App Shell
- Sidebar no desktop com navegação
- Bottom nav mobile com FAB "Novo Roteiro"
- Indicador ativo na navegação
- Touch targets 44x44px
- Safe area padding para iPhones com notch

### 5. Landing Page
- Hero section com Aurora gradients (3 blobs animados)
- Feature cards com glassmorphism
- How it works com círculos gradientes
- CTA section com gradiente sky blue
- Brand "Destino Certo"

### 6. Dashboard
- Cards de roteiro com gradient strip + ícones circulares
- Skeleton loading state
- Empty state com CTA laranja
- Staggered fade-in animation

### 7. Editor de Roteiro
- Timeline contínua com dots coloridos por tipo de parada
- Headers de dia sticky com backdrop-blur
- Cards de parada com time pills
- Modal de adicionar parada com contexto do dia
- Painel IA (Sheet lateral)
- Compartilhar/desativar link
- Delete com touch target 44x44

### 8. Compartilhamento
- Geração de slug único com nanoid
- Página pública com timeline espelhada
- Header gradiente + CTA footer de conversão

### 9. IA
- API route `/api/ai/pesquisar` com Gemini Flash
- API route `/api/ai/sugerir-roteiro` com Gemini Flash
- Prompts em português brasileiro
- JSON parsing com fallback para erros

### 10. Design System (UI/UX Pro Max)
- Paleta: sky blue #0EA5E9 + adventure orange #F97316
- Background: #F0F9FF (ice blue)
- Texto: #0C4A6E (navy)
- Fontes: Outfit (headings) + Work Sans (body)
- Aurora keyframes CSS
- Glassmorphism nos cards
- CTA laranja (1 por tela)
- Radius: 0.75rem

---

## Decisões tomadas

1. **Firestore client-side**: Melhor que API Routes por causa do offline persistence
2. **Gemini via API Route**: Chave secreta não exposta ao browser
3. **Subcoleções aninhadas**: Isolamento natural, regras de segurança mais simples
4. **Lazy Firebase init**: Evita erro no build do Next.js sem variáveis de ambiente
5. **CTA orange mapeado para `--cta`**: CSS variable separada, `--accent` continua para UI chrome
6. **Tailwind v4 CSS-based config**: Padrão do Next.js 16, sem `tailwind.config.ts`

---

## Pendências

- [ ] Google Auth habilitar no Firebase Console
- [ ] Google Maps API key para Places Autocomplete e mapa interativo
- [ ] Gemini API key para funcionalidades de IA
- [ ] PWA service worker (@serwist/next)
- [ ] Ícones PWA (72px - 512px)
- [ ] Screenshots para PWA install prompt
- [ ] Testar fluxo completo (criar roteiro → adicionar paradas → compartilhar)

---

## Comandos úteis

```bash
npm run dev          # Dev server localhost:3000
npm run build        # Build de produção
npx vercel deploy    # Deploy preview
npx vercel --prod    # Deploy produção
```
