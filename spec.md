# Guardião Urbano

## Current State

A aplicação tem um painel remoto em `/remote-admin` que tenta chamar funções de backend com prefixo `admin` (ex: `adminCreateLicense`, `adminListLicenses`, `adminActivateLicense`, etc.) usando um token secreto `GUARDIAN-REMOT-1003`. Essas funções existem no código fonte `main.mo` mas NÃO estão no backend compilado (`backend.d.ts` / `backend.did.d.ts`), causando erro ao criar/gerir licenças.

## Requested Changes (Diff)

### Add
- Funções de backend com token secreto para gestão remota de licenças sem Internet Identity:
  - `adminCreateLicense(token, code, clientName, phone)` 
  - `adminActivateLicense(token, code)`
  - `adminRenewLicense(token, code)`
  - `adminBlockLicense(token, code)`
  - `adminListLicenses(token)` → query
  - `adminListUsers(token)` → query
  - `adminGetMetrics(token)` → query
  - `adminListActiveSOSAlerts(token)` → query
  - `adminListIncidents(token)` → query
  - `adminValidateIncident(token, id)`
  - `adminRemoveIncident(token, id)`
  - `adminBlockUser(token, userId)`
  - `adminUnblockUser(token, userId)`

### Modify
- Backend regenerado para incluir todas as funções acima no Candid interface

### Remove
- Nada

## Implementation Plan
1. Regenerar backend Motoko com todas as funções existentes + novas funções admin com token
2. Atualizar `backend.d.ts` com as novas assinaturas
3. Validar build
