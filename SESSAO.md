# Sessão atual — Destino Certo

**Branch:** master · **Deploy:** destino-certo-phi.vercel.app · **Firebase:** destino-certo12

## Estado atual (2026-07-16)

MVP completo e no ar. Usuários criam roteiros, adicionam paradas com busca Google Maps, reordenam com drag-and-drop, editam, removem, compartilham via link público **ou** convidam colaboradores por e-mail para editar junto.

- **Auth:** Google Sign-In + E-mail/senha + Anônimo
- **Offline:** Firestore IndexedDB persistence habilitado + fila de sync + indicador "Você está offline"
- **PWA:** SW com auto-refresh em novas versões + ícone customizado
- **Mapa:** Google Maps com Places API (New) para busca, busca+seletor de dia flutuantes sobre o mapa, markers coloridos por tipo
- **Compartilhamento:** link público (view-only, com QR code) + colaboradores por e-mail (podem editar dias/paradas), painel único no editor
- **Design:** direção "Boarding Pass / Diário de Viagem" (ver `docs/design/DESIGN.md`). Sky blue #0EA5E9 + orange CTA #F97316, fonte de heading Fraunces (serifada) + Work Sans no corpo
- **Contexto automático no editor:** foto + resumo do destino (Wikipedia), clima, câmbio, feriados e nascer/pôr do sol — tudo sem exigir cadastro do usuário
- **Excluir roteiro:** disponível no dashboard e no editor (só dono), com confirmação e exclusão em cascata

## Regras essenciais ativas

- Fire-and-forget em TODAS as escritas no Firestore (sem `await`, UI responde imediatamente)
- SW atualiza automaticamente sem prompt
- Touch targets >= 44px
- Cores via variáveis CSS, sem hex/rgba literal
- Colaborador = qualquer usuário autenticado (Google ou e-mail/senha) cujo e-mail esteja em `roteiro.colaboradoresEmail`; regra do Firestore checa `request.auth.token.email` direto, sem backend

## Pendências principais

- Google Maps API key não restrita por domínio
- Foto de destino via Pexels — usuário optou por Wikipedia (sem chave) em vez disso; Pexels fica de fora a menos que peçam de novo
