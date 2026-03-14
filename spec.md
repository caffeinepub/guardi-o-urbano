# Guardião Urbano

## Current State
A plataforma Guardião Urbano é uma PWA de segurança urbana com navegação de 5 abas (Início, Mapa, Comunidade, Localização, Perfil). Tem botão SOS no dashboard, partilha de localização, sistema de licenças e painel admin remoto. Problemas identificados: dados por vezes não aparecem, botão SOS não está numa aba dedicada, não há gestão de contactos de emergência, interface densa e navegação confusa.

## Requested Changes (Diff)

### Add
- Nova aba **SOS** dedicada (`/sos`) com botão SOS central gigante e estado de alerta ativo
- Nova aba **Contactos de Emergência** (`/contacts`) com CRUD completo de contactos (nome, telefone, tipo: SMS/ligação/notificação), armazenados em localStorage
- Lógica de alerta SOS: ao pressionar SOS, obtém GPS, gera mensagem automática com link Google Maps, tenta enviar via `sms:` URI para todos os contactos de emergência, e inicia navegação para sos-active
- Loading skeletons em todas as páginas com dados assíncronos
- Página de Conta (`/profile`) renomeada visualmente para "Conta & Licença" com estado da licença proeminente

### Modify
- **BottomNav**: 5 abas novas: Home, SOS (aba central destacada em vermelho), Contactos, Localização, Conta
- **App.tsx**: adicionar rotas `/sos` e `/contacts`
- **DashboardPage**: simplificar ao máximo — boas-vindas, status da licença, alertas recentes, atalhos rápidos. Sem botão SOS aqui (movido para aba própria)
- **SOSActivePage**: manter mas melhorar com link Google Maps e mensagem automática
- **LocationPage**: fundo vermelho escuro como as outras telas, melhorar UX
- **ProfilePage**: renomear para Conta & Licença, mostrar dados do utilizador, estado da licença, expiração, código da licença de forma clara
- Todas as telas: fundo vermelho escuro consistente, botões grandes, texto mínimo, skeletons durante carregamento

### Remove
- Aba "Mapa" e "Comunidade" da navegação principal (ainda acessíveis via atalhos no dashboard)
- Botão SOS do DashboardPage (movido para aba SOS dedicada)

## Implementation Plan
1. Criar `EmergencyContactsPage.tsx` com lista, adicionar/editar/remover contactos, armazenamento em localStorage
2. Criar `SOSTabPage.tsx` com botão SOS central, estado ativo, envio de alertas a contactos, link Google Maps
3. Atualizar `BottomNav.tsx` com nova estrutura: Home | SOS | Contactos | Localização | Conta
4. Atualizar `App.tsx` com novas rotas
5. Simplificar `DashboardPage.tsx` — remover botão SOS, mostrar status e atalhos
6. Melhorar `ProfilePage.tsx` para mostrar dados claramente com skeletons
7. Aplicar fundo vermelho escuro e loading states a todas as telas
8. Melhorar `SOSActivePage.tsx` com Google Maps link
