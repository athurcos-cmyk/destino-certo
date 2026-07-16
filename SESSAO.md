# Sessão atual — Destino Certo

**Branch:** master · **Deploy:** destino-certo-phi.vercel.app · **Firebase:** destino-certo12

## Estado atual (2026-07-15)

MVP completo e no ar. Usuários criam roteiros, adicionam paradas com busca Google Maps, reordenam com drag-and-drop, editam, removem, compartilham via link público.

- **Auth:** Google Sign-In (habilitado no Firebase) + Anônimo
- **Offline:** Firestore IndexedDB persistence habilitado + fila de sync + indicador "Você está offline"
- **PWA:** SW com auto-refresh em novas versões + ícone customizado
- **Mapa:** Google Maps com Places Autocomplete, markers coloridos por tipo
- **Design:** Sky blue #0EA5E9 + orange CTA #F97316 + Outfit/Work Sans

## Regras essenciais ativas

- Fire-and-forget em TODAS as escritas no Firestore (sem `await`, UI responde imediatamente)
- SW atualiza automaticamente sem prompt
- Touch targets >= 44px
- Cores via variáveis CSS, sem hex/rgba literal

## Pendências principais

- Dark Mode (plano pronto, não implementado)
- Compartilhamento multi-usuário (plano pronto)
- Animações (plano pronto)
- Deploy das firestore.rules (precisa auth Firebase CLI na conta certa)
- Google Maps API key não restrita por domínio
