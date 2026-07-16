@AGENTS.md

# Destino Certo

PWA de itinerários de viagem. Stack: Next.js 16 + Firebase Auth/Firestore + Google Maps + Tailwind v4 + shadcn/ui. Deploy Vercel.

## Princípio #1: Offline-First

O app é usado por pessoas viajando, que frequentemente ficam sem internet. **Toda funcionalidade crítica deve funcionar offline.**

### Regras obrigatórias:
- Todas as escritas (criar/editar/deletar roteiros, dias, paradas) devem ser salvas localmente PRIMEIRO (Firestore offline persistence ou IndexedDB/localStorage), depois sincronizadas quando online.
- Implementar fila de operações pendentes (queue) para mudanças feitas offline. Quando reconectar, processar a fila em ordem.
- Leituras devem usar cache local. Firestore já tem offline persistence — garantir que está habilitado.
- Service Worker deve forçar refresh quando nova versão for detectada (skipWaiting + clients.claim + postMessage para recarregar).
- Nunca assumir que `navigator.onLine === true`. Sempre tratar falhas de rede com fallback local.

### Exemplos:
- Usuário sem internet editando parada → salva no cache local → quando reconectar, sincroniza com Firestore.
- Usuário abre app offline → vê roteiros do cache local (Firestore offline persistence).
- Nova versão deployada → SW detecta → notifica usuário → faz refresh automático.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Firebase Auth (Google + Anônimo) |
| Database | Firestore (Web SDK, offline persistence) |
| Mapas | @vis.gl/react-google-maps |
| UI | Tailwind v4 + shadcn/ui |
| Fontes | Outfit (headings) + Work Sans (body) |
| Deploy | Vercel + GitHub |
