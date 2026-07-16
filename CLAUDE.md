@AGENTS.md

# Destino Certo — instruções para agentes (Claude)

## Leitura inicial obrigatória

1. Leia `SESSAO.md` (brief curto do estado atual).
2. Use `docs/BUSCA_RAPIDA.md` para decidir qual contexto abrir.
3. Não abra arquivos grandes por padrão. Use Grep primeiro em `docs/history/`.

## Mapa de contexto

| Tema | Arquivo |
|---|---|
| Estado atual | `SESSAO.md` |
| Mudanças recentes | `CHANGELOG.md` |
| Busca por assunto | `docs/BUSCA_RAPIDA.md` |
| Histórico mensal | `docs/history/YYYY-MM.md` |
| Design/UI | `docs/design/DESIGN.md` |
| Pendências/roadmap | `docs/planning/TODOS.md` |
| Arquitetura | `docs/ARCHITECTURE.md` |
| Segurança | `docs/SECURITY.md`, `firestore.rules` |

## Projeto

PWA de itinerários de viagem mobile-first. Tagline: "Seu roteiro de viagem organizado e compartilhável." Produção: https://destino-certo-phi.vercel.app · Repo: `athurcos-cmyk/destino-certo` · Branch: `master` (direto, sem PR).

## Stack

Next.js 16 (App Router, Turbopack), TypeScript, Firebase Web SDK (Auth + Firestore com offline persistence), @vis.gl/react-google-maps, Tailwind v4, shadcn/ui, TanStack Query, @dnd-kit, Sonner, Lucide React. Deploy: Vercel + GitHub.

## ⚠️ REGRA PRINCIPAL: o app deve funcionar offline

O app é usado por pessoas viajando, que perdem sinal o tempo todo. **O app precisa funcionar offline.** Toda escrita no Firestore deve usar o padrão fire-and-forget para que a UI responda imediatamente do cache local, sem depender do servidor.

**Padrão correto (fire-and-forget):**
```ts
// Escrita: dispara e trata erro se aparecer
addDocument("roteiros", dados).catch((err) => console.error(err));
// Feche o dialog, limpe o form — ANTES de chamar o write
setOpen(false);
```

**Padrão ERRADO (bloqueia na rede):**
```ts
// ❌ NÃO FAÇA — trava com spinner se o transporte oscilar
await addDocument("roteiros", dados);
setOpen(false);
```

**Como funciona:** Firestore usa `enableIndexedDbPersistence` (`src/lib/firebase/config.ts`). O write vai pro cache local imediatamente e a leitura via `getCollection`/`getDocument` reflete a mudança. A sync com o servidor acontece em background. Se offline, a operação fica na fila e sincroniza quando voltar.

**Exceção permitida:** operações que *leem* resultado do servidor (gerar slug, carregar dados iniciais) podem usar `await` — mas o *write* subsequente ainda deve ser fire-and-forget.

```ts
// Correto para fluxo carregar → write:
await carregarDados();                     // await OK — é leitura do servidor
setParadaForm(defaultForm);               // atualiza UI imediatamente
addDocument("paradas", dados).catch(...); // write é fire-and-forget
```

## ⚠️ REGRA PRINCIPAL: todo campo novo no Firestore precisa atualizar a regra no MESMO commit

Sempre que um campo novo for adicionado a um payload que o cliente grava no Firestore, **no mesmo commit**:
1. Abrir `firestore.rules` e conferir se as regras aceitam esse campo.
2. Rodar `npx firebase deploy --only firestore:rules --project destino-certo12` antes de considerar a mudança pronta. Deploy da regra só com autorização explícita do dono.

## Regras de código

- **Offline-first**: ver seção acima. Nunca use `await` em escrita pra liberar UI. O Firestore já faz a fila offline.
- **IDs server-side**: usar `addDoc` (Firestore gera o ID). Não precisa de `clientMutationId`.
- UI mobile-first. Touch targets >= 44px.
- **Cores: usar variáveis CSS** (`--primary`, `--cta`, `--background`, etc.). Não usar hex/rgba literal fora de `globals.css`. Zona de landing page é exceção.
- Edição cirúrgica: não reescrever arquivo inteiro para mudar poucas linhas.
- Antes de mexer em UI, leia `docs/design/DESIGN.md` (se existir).

## Service Worker — atualização automática

O SW deve forçar refresh **automaticamente** quando detectar nova versão. Sem botão, sem prompt. O usuário sempre vê a versão mais recente.

**Padrão:** `skipWaiting()` no install + `clients.claim()` no activate. O `pwa-register.tsx` escuta `updatefound` e dispara `skipWaiting`. No `controllerchange`, recarrega a página.

## Pontos sensíveis (nunca fazer)

- Não commitar `.env.local` nem service account.
- Não hardcodar `firebaseConfig` (somente variáveis `NEXT_PUBLIC_`).
- Não expor erro técnico ao usuário final — usar mensagens amigáveis.
- Não usar `await` em escrita no Firestore.
- Não usar hex/rgba literal fora de `globals.css`.

## Validação antes de entregar

`npm run build`. Deploy de regras: `npx firebase deploy --only firestore:rules --project destino-certo12` (somente regras).

## Atualização de docs no fim da sessão

| Arquivo | Atualizar quando | Não atualizar quando |
|---|---|---|
| `CHANGELOG.md` | Entregou código, bugfix, decisão relevante | Conversa, ajuste mínimo |
| `SESSAO.md` | Mudou estado atual, stack, ou regra essencial | Bugfix comum, UI pontual |
| `docs/history/YYYY-MM.md` | Sessão com +8 bullets, auditoria, decisão importante | Mudança que cabe no changelog |
| `docs/BUSCA_RAPIDA.md` | Mudaram caminhos, pastas ou comandos de busca | Feature comum |
