# Histórico do Projeto

## Linha do Tempo

### 2026-07-15 - Fundação e Design System

**Manhã/Tarde**
- Ideia do projeto: criar um PWA de itinerários de viagem para substituir roteiros no Word
- Nome escolhido: **Destino Certo** (projeto Firebase: `destino-certo12`)
- Domínio Vercel: `destino-certo-phi.vercel.app`
- Repositório GitHub: `github.com/athurcos-cmyk/destino-certo`

**Setup Inicial**
- Projeto Next.js 16 criado com TypeScript, Tailwind v4, App Router
- Dependências core instaladas: Firebase, Google Maps, React Query, shadcn/ui, Gemini
- Firebase configurado com Auth anônimo + Google, Firestore Database
- Domínios autorizados configurados para autenticação

**Implementação**
- Landing page com Aurora gradients, features, how it works, CTA
- Autenticação: login Google + modo anônimo
- App shell: sidebar desktop + bottom nav mobile com FAB "Novo Roteiro"
- Dashboard com cards de roteiro (gradient strip + ícones circulares)
- CRUD de roteiros com dias automáticos entre datas
- Editor de roteiro: timeline com dots coloridos + time pills
- Modal de adicionar parada (nome, endereço, horário, tipo, notas)
- Compartilhamento via link público com slug único
- Página pública de roteiro compartilhado com timeline espelhada
- API de IA: pesquisa de lugares + sugestão de roteiro (Gemini Flash)
- Painel assistente IA integrado ao editor

**Design System (UI/UX Pro Max + agentes)**
- Análise por 2 agentes de design (Landing/Visual + App UI/Mobile)
- Design system gerado: Aurora UI + Minimal Single Column
- Paleta: sky blue `#0EA5E9` + adventure orange `#F97316`
- Background: `#F0F9FF` (ice blue), Texto: `#0C4A6E` (navy)
- Fontes: Outfit (headings) + Work Sans (body)
- Touch targets 44x44px, glassmorphism, Aurora keyframes
- Timeline redesign: linha contínua + dots + time pills
- FAB central no bottom nav mobile
- Aplicado em 10 arquivos

**Deploy**
- Push inicial para GitHub
- Deploy no Vercel com variáveis de ambiente Firebase
- Build passando limpo em produção

**Documentação**
- `SYSTEM_DESIGN.md`: Arquitetura completa, stack, schema, decisões
- `CHANGELOG.md`: Todas as features e mudanças
- `SESSION.md`: Detalhes da sessão atual, pendências
- `HISTORY.md`: Este arquivo

---

## Próximos Passos (Fase 2)

### Google Maps
- Obter API key do Google Maps
- Integrar `@vis.gl/react-google-maps` com Places Autocomplete
- Adicionar mapa interativo no editor de roteiro
- Mostrar rotas entre paradas consecutivas

### Google Auth
- Habilitar Google Sign-In no Firebase Console
- Configurar OAuth consent screen
- Testar fluxo completo de login

### Gemini AI
- Obter API key do Gemini
- Habilitar Search Grounding para pesquisas em tempo real
- Melhorar prompts de pesquisa e sugestão

### PWA
- Configurar @serwist/next para service worker
- Gerar ícones PWA (72px a 512px)
- Tirar screenshots para PWA install prompt
- Testar instalação e offline

### UX
- Drag and drop funcional (@dnd-kit) para reordenar paradas
- Edição inline de campos
- Dark mode

---

## Referências

- [Plano de Implementação](C:\Users\Thurcos\.claude\plans\sim-mas-primeiro-vamos-typed-stallman.md)
- [GitHub](https://github.com/athurcos-cmyk/destino-certo)
- [Vercel](https://destino-certo-phi.vercel.app)
- [Firebase Console](https://console.firebase.google.com/project/destino-certo12)
