# Changelog

## 2026-07-16 (cont.) — Redesign completo ("Boarding Pass") + excluir roteiro + 3 features novas

- **Redesign visual do app inteiro** via skill `/frontend-design`, direção "Boarding Pass / Diário de Viagem": fonte de heading trocada de Outfit para Fraunces (serifada), tokens novos `--paper`/`.bg-grain`/`.route-dashed`/`.ticket-notch`/`.ticket-notch-bottom` em `globals.css`. Landing page reconstruída do zero (removidos os blobs de gradiente e o card de glassmorphism genéricos) — e removida a seção "Assistente com IA" que anunciava uma feature que não existe mais desde a sessão anterior (bug de conteúdo). Cards do dashboard e headers de login/compartilhar público agora em formato de canhoto de bilhete.
- **Excluir roteiro** — botão novo no dashboard (menu "...") e no editor (só dono), com confirmação e exclusão em cascata (dias + paradas + roteiro). Corrigido bug onde `stopPropagation` quebrava a abertura do próprio menu, e condição de corrida onde a lista recarregava antes da exclusão terminar.
- **Foto + resumo do destino** — novo card "Sobre o destino" no topo do editor, via Wikipedia REST API (pt, com fallback pra en), sem chave.
- **Nascer/pôr do sol** — adicionado ao card de info da viagem, via sunrise-sunset.org. Corrigido depois de detectado: a primeira versão estimava fuso horário por longitude (errava ~2h em países como Portugal); trocado para usar o `utc_offset_seconds` real da Open-Meteo.
- **QR code do link público** — opção adicional (não substitui "Copiar link") no dialog de compartilhar, via api.qrserver.com, sem chave.
- Pesquisei e testei ao vivo várias APIs gratuitas candidatas antes de implementar: Travel-Advisory.info e REST Countries v3.1/v5 estavam fora do ar/quebrados no momento do teste, não foram integrados.

## 2026-07-16 — Auditoria da área logada: mapa, espaçamento, compartilhamento com permissões

- Corrigida busca de lugares, que estava 100% quebrada (API legada do Google desativada no projeto) — migrada para Places API (New) (`AutocompleteSuggestion`/`Place`).
- Mapa deixou de ser só um clique-cego: ganhou busca de lugar e seletor de dia flutuantes sobre o mapa.
- Corrigido overflow horizontal do header do editor no mobile (botões viraram icon-only).
- Cards de parada ~35% mais compactos (116px → ~74px) — resolve o "espaçamento gigante" ao adicionar várias paradas num dia.
- Botões de editar/remover parada agora sempre visíveis no mobile (antes só apareciam em hover, inacessíveis em touch).
- Compartilhamento reformulado: painel único com link público (view-only) separado de colaboradores por e-mail (podem editar). Login por e-mail/senha implementado (`auth.ts`, `login/page.tsx`) como base de identidade dos colaboradores. `firestore.rules` atualizado com permissão de colaborador via `request.auth.token.email` — **aguardando deploy manual autorizado**.
- Dashboard ganhou seção "Compartilhados comigo" para roteiros onde o usuário é colaborador.
- Corrigido `desativarCompartilhamento` que usava `await` numa escrita (violava o padrão fire-and-forget do projeto).

## 2026-07-15 — Fundação do app

- Projeto criado: Next.js 16 + Firebase + Google Maps + Vercel. Detalhes em `docs/history/2026-07.md`.
- Design system aplicado: sky blue + orange CTA, Outfit + Work Sans, Aurora gradients.
- Auth: Google Sign-In e anônimo.
- CRUD completo de roteiros com timeline, drag-and-drop, e compartilhamento via link.
- Google Maps integrado com Places Autocomplete e markers coloridos.
- PWA: service worker, auto-refresh, offline persistence, ícone customizado.
- 15 bugs críticos corrigidos após auditoria de 12 agentes.
- Arquitetura offline-first: Firestore IndexedDB, fila de sync, fire-and-forget em todas as escritas.
- Docs reorganizados no padrão Zerou: SESSAO.md, BUSCA_RAPIDA.md, DESIGN.md, SECURITY.md, TODOS.md.
- IA removida (quota Gemini zerada). APIs gratuitas mapeadas para features futuras.
