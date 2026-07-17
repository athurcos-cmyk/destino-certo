# Changelog

## 2026-07-16 (cont. 7) — Bug de layout no mobile (menu de baixo sobrepondo conteúdo)

- Reportado pelo usuário testando no celular: ao rolar/interagir perto do menu de baixo, ele sobrepunha e cortava o conteúdo. Causa: o shell do app (`app/layout.tsx`) usava `h-screen` (`100vh` fixo) — no mobile, `100vh` é calculado pro tamanho máximo do viewport (com a barra de endereço do navegador escondida), então quando a barra aparece/some durante o scroll, o layout "pula" e o menu de baixo fica mal posicionado. Trocado por `h-dvh` (altura dinâmica de viewport), que se ajusta corretamente ao espaço realmente visível.

## 2026-07-16 (cont. 6) — App sempre abre no tema claro por padrão

- Removida a detecção automática de `prefers-color-scheme` do sistema no script de tema (`layout.tsx`). Agora o app inteiro abre sempre claro por padrão, mesmo se o sistema/navegador da pessoa preferir escuro — só fica escuro se a pessoa clicar no toggle de dark mode, que continua salvando a escolha no localStorage normalmente.

## 2026-07-16 (cont. 5) — Landing sempre clara

- A landing page (antes do login) agora ignora o dark mode e fica sempre no tema claro, mesmo se o sistema/navegador do visitante preferir escuro — padrão comum de manter a página de marketing só no tema de marca. O app em si (pós-login) continua respeitando dark mode normalmente. Implementado via classe `.force-light` em `globals.css` que redeclara os tokens de cor com os valores do tema claro, escopada só na landing.

## 2026-07-16 (cont. 4) — Adicionar/editar/remover parada instantâneo

- Causa da lentidão relatada pelo usuário: toda vez que adicionava, editava ou removia uma parada, o app recarregava o roteiro inteiro do Firestore (1 leitura do roteiro + 1 leitura por dia, sequenciais) antes de atualizar a tela — em vez de só refletir a mudança local, como o drag-and-drop já fazia corretamente.
- Corrigido em `roteiro/[id]/page.tsx`: `salvarParada`/`removerParada` agora atualizam o estado local na hora (otimista) e escrevem no Firestore por trás, fire-and-forget. Parada nova aparece com um ID temporário, trocado pelo ID real assim que o Firestore confirma; se a escrita falhar de verdade, a mudança é revertida na tela com um toast de erro.

## 2026-07-16 (cont. 3) — Auditoria final do redesign

- **Bug real corrigido:** o mapa do editor nunca centralizava no destino do roteiro (sempre abria em Curitiba) — havia até um cálculo de `bounds` (área cobrindo todas as paradas) pronto no código mas nunca aplicado. Agora o mapa centra no destino real (`roteiro.destinoLat/Lng`) e se ajusta pra mostrar todas as paradas com 2+ paradas.
- **Touch targets:** 3 botões (menu do card no dashboard, remover colaborador, trocar destino) estavam a 32px, abaixo da regra de 44px do design system — corrigidos. Isso expôs uma colisão visual entre o ícone decorativo de avião do card e o menu "..." maior; removido o ícone decorativo.
- **Limpeza:** removidas 2 funções mortas (`col()`/`docRef()`, deprecadas e nunca chamadas), ~10 imports não usados, 2 tipos `any` trocados por tipos corretos, cores hex duplicadas na landing substituídas pela constante `CORES_TIPO_PARADA` já existente.
- **Segurança:** revisão das `firestore.rules` (modelo dono/colaborador sólido, sem escalonamento de permissão) e confirmação de que nenhum segredo está no código-fonte ou no histórico do git.

## 2026-07-16 (cont. 2) — Prompt de instalação do PWA

- Sheet "Instale o Destino Certo" (estilo cartão de embarque, consistente com o redesign) para incentivar a instalação como app: no Android/Chrome/desktop captura o `beforeinstallprompt` e mostra botão "Instalar agora"; no iOS Safari (que não dispara esse evento) mostra passo a passo manual (Compartilhar → Adicionar à Tela de Início). Não aparece se o app já estiver instalado (`display-mode: standalone`). Dispensa é permanente via localStorage. Inspirado na implementação do projeto Zerou, adaptado pro design system e componentes (`Sheet`) do Destino Certo.

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
