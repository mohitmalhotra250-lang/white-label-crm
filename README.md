# Universal White-Label AI Voice Calling CRM

Production-ready, multi-tenant, provider-independent AI Voice Calling CRM.

## What It Is
- White-label CRM where clients upload CSV leads and start AI calling in one click
- Super Admin controls all providers (Vapi, Retell, Bland, Tabbly, Grok, ElevenLabs, Custom)
- Provider Adapter Layer ensures frontend never changes when switching AI providers
- Built with PostgreSQL, Redis/BullMQ, Socket.IO, React/Next.js

## Project Structure
- `database/schema.sql` — PostgreSQL DDL (multi-tenant, enums, indexes, triggers)
- `adapter/` — Provider abstraction layer + concrete adapters
- `backend/` — Express API + middleware + services + queue job + socket
- `frontend/` — Next.js 14 App Router dashboard + admin portal
- `docs/` — ARCHITECTURE.md, TEST_PLAN.md, DEPLOYMENT_CHECKLIST.md, API_DOC.md

## Quick Start
```bash
# 1. Database
psql -U user -d universal_crm -f database/schema.sql

# 2. Backend
cd backend && npm install && npm run dev   # port 4000

# 3. Frontend
cd ../frontend && npm install && npm run dev # port 3000

# 4. Login
Visit http://localhost:3000/login
Use superadmin@universalcrm.ai (update password after seed)
```

## Production Deployment
Follow `docs/DEPLOYMENT_CHECKLIST.md`. Key steps: HTTPS, rotate JWT secret, configure S3/R2 for files, scale BullMQ workers if needed, enable DB backups.

## Architecture
See `docs/ARCHITECTURE.md` for layered design, multi-tenancy, security, and performance targets.
