# Veltrik — Azure Deployment Plan

## Overview

Full-stack EV marketplace (Next.js + Socket.io + PostgreSQL) deployed to Azure South India.

## Status

> **Current:** Planning ✅ (awaiting Azure subscription)

- [x] Phase 1: Setup Azure CLI & azd
- [x] Phase 2: Dockerize the app (Dockerfile + .dockerignore created)
- [x] Phase 3: Generate Infrastructure (Bicep + azure.yaml)
- [ ] Phase 4: Provision Azure Resources (requires subscription)
- [ ] Phase 5: Deploy Application
- [ ] Phase 6: Verify & Hardening

## Current State Summary

- Build: 52 static pages, all routes compile successfully
- Server: Custom Express (port 3000) + Socket.io (port 3001) via `server.ts`
- Database: PostgreSQL 15 local (`veltrik` dev, `veltrik_test` test)
- Auth: NextAuth.js with Prisma adapter (credentials + Google)
- Storage: Local filesystem (`public/uploads`)
- Realtime: Socket.io (namespaces: `/notifications`, `/listings`, `/messages`)
- Tests: 206/206 passing across 29 files

## Key Findings from Local Run

- Express 5 requires `app.use()` instead of `app.all("*")` for catch-all — fixed in `server.ts`
- Native binaries (`lightningcss`, `@tailwindcss/oxide`) must be bundled — npm bug on arm64
- Socket.io server must be part of the same container image

## Architecture Plan

### Compute: Azure Container Apps

Single container running the custom Next.js server (`server.ts`). This handles both:
- HTTP requests (Next.js pages + API routes)
- WebSocket connections (Socket.io on port 3001)

**Rationale:**
- Single container is simplest for this architecture
- Container Apps supports both HTTP and WebSocket on the same revision
- Auto-scaling and scale-to-zero for cost efficiency
- Managed identity support for Azure services

### Database: Azure Database for PostgreSQL Flexible Server

**Rationale:**
- Fully managed PostgreSQL with automated backups
- Zone-redundant HA available
- Private network access with VNet integration
- Geo-redundant backups for DR

### Supporting Services

| Service | Purpose |
|---------|---------|
| Azure Container Registry | Store Docker images |
| Azure Key Vault | Secrets (NEXTAUTH_SECRET, DB creds, Razorpay keys, MSG91 keys, SMTP) |
| Log Analytics Workspace | Centralized logging |
| Managed Identity | Container → Key Vault, Container → PostgreSQL |

## Infrastructure (Bicep)

### Resources

```
Resource Group: rg-veltrik-<env>
├── Container Apps Environment: cae-veltrik-<env>
│   ├── CA logs to Log Analytics
│   └── VNet integration
├── Container App: ca-veltrik-<env>
│   ├── Ingress: port 3000 (HTTP)
│   ├── Ingress: port 3001 (WebSocket)
│   ├── Environment variables from Key Vault
│   └── Managed Identity
├── Container Registry: crveltrik<env>
│   └── Admin disabled, auth via Managed Identity
├── PostgreSQL Flexible Server: psql-veltrik-<env>
│   ├── Database: veltrik
│   ├── Private endpoint or firewall rules
│   └── Managed Identity auth (Entra)
├── Key Vault: kv-veltrik-<env>
│   └── RBAC: identity has read access
├── Log Analytics: log-veltrik-<env>
└── Application Insights: ai-veltrik-<env>
```

### Docker Image

Single Docker image containing:
- Next.js build output (`.next/`)
- Compiled server (`server.ts` via `tsx` or compiled JS)
- Prisma client + schema for migrations
- Socket.io runtime

**Entrypoint:** `node server.ts` (or compiled equivalent)

### Environment Variables

**From Key Vault:**
- `DATABASE_URL` — PostgreSQL connection string (via Entra or password)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` — production URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- `MSG91_AUTH_KEY` / `MSG91_TEMPLATE_ID`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`

**Set in Container App:**
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL` — production URL
- `AZURE_STORAGE_CONNECTION` — for uploads (if using Blob Storage)

### Uploads Strategy

Current: `public/uploads` (local filesystem — not suitable for multi-replica)

**Option A (Recommended):** Azure Blob Storage
- Create a blob container for uploads
- Replace `lib/upload.ts` to use `@azure/storage-blob`
- Managed Identity auth

**Option B (Quick start):** Persistent volume in Container Apps
- Single-replica only (no HA)
- Ephemeral storage — data lost on restart

## Deployment Pipeline

```
azd up
├── azd provision → creates all Azure resources
├── azd deploy  → builds Docker image, pushes to ACR, updates Container App
└── post-deploy → run Prisma migrations (via `az containerapp exec` or init container)
```

## Prerequisites for User

1. **Azure subscription** — active with billing
2. **Permissions** — Contributor + User Access Administrator on subscription
3. **azd** — `curl -fsSL https://aka.ms/install-azd.sh | bash`
4. **Azure CLI** — `brew install azure-cli` (macOS)
5. **Docker Desktop** — or `brew install docker`

## Cost Estimate (Approximate, South India)

| Service | Tier | Monthly (est.) |
|---------|------|---------------|
| Container Apps | Consumption | $5–20 |
| PostgreSQL Flexible | Burstable (1 vCPU, 2 GB) | $15–25 |
| Container Registry | Basic | $5 |
| Key Vault | Standard | $1 |
| Log Analytics | Pay-as-you-go | $2–5 |
| Blob Storage (if used) | Hot LRS | $1–5 |
| **Total** | | **$30–60/mo** |

## Generated Artifacts

| File | Purpose |
|------|---------|
| `.azure/deployment-plan.md` | This plan |
| `.azureignore` | Files excluded from AZD deployment |
| `azure.yaml` | AZD configuration (Container Apps host) |
| `Dockerfile` | Multi-stage Node.js 22 Alpine build |
| `.dockerignore` | Docker build exclusions |
| `infra/main.bicep` | Main Bicep orchestrator (subscription-scoped) |
| `infra/modules/log-analytics.bicep` | Log Analytics Workspace (PerGB2018, 30-day retention) |
| `infra/modules/container-registry.bicep` | ACR (Basic SKU, admin disabled) |
| `infra/modules/container-app.bicep` | Container App + Environment + health probes + HTTP scaling |
| `infra/modules/acr-pull-role.bicep` | AcrPull role assignment (system-assigned MI) |
| `infra/modules/key-vault.bicep` | Key Vault (RBAC, soft delete, purge protection) |
| `infra/modules/postgresql.bicep` | PostgreSQL Flexible Server (Burstable B1ms, 32GB, v15) |

## server.ts Changes for Azure

| Change | Why |
|--------|-----|
| Added `/health` endpoint | Required by Container Apps health probes |
| Added `trust proxy` | Azure load balancer needs trusted proxy for correct IPs |
| Listen on `0.0.0.0` in production | Container Apps requires binding to all interfaces |

## Next Step

Get an Azure subscription, then:
1. `azd auth login` — authenticate with Azure
2. `azd env new <env-name>` — create environment
3. `azd env set AZURE_LOCATION southindia` — set region
4. `azd provision` — create all Azure resources
5. Set Key Vault secrets (DATABASE_URL, NEXTAUTH_SECRET, etc.)
6. `azd deploy` — build and push Docker image, update Container App
7. Run Prisma migrations on the deployed database
