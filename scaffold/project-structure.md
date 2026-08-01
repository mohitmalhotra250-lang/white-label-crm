# Project Scaffold — Universal White-Label AI Voice CRM

## Tech Stack (Documented)
- **Frontend**: React 18 + Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui patterns
- **Backend**: Node.js 20 + TypeScript + Express / Fastify + Prisma ORM (optional: FastAPI if Python preferred)
- **Database**: PostgreSQL 15+ (schema delivered in database/schema.sql)
- **Cache / Queue**: Redis 7+ (Bull / Celery equivalent for job queue + real-time state)
- **File Storage**: AWS S3 / Cloudflare R2 / MinIO (CSV + recordings + reports)
- **Auth**: JWT (httpOnly cookies + Authorization header) + bcrypt

## Folder Structure

```
white-label-crm/
├── docs/
│   ├── ARCHITECTURE.md          # Full system design, roles, security
│   └── UI_GUIDE.md              # (Future) Design tokens, glassmorphism spec
├── database/
│   └── schema.sql               # Complete PostgreSQL DDL (multi-tenant)
├── adapter/
│   ├── provider-adapter.ts     # Abstract interface + common types
│   ├── vapi-adapter.ts         # Concrete Vapi implementation
│   ├── retell-adapter.ts       # Concrete Retell implementation
│   ├── bland-adapter.ts        # (Placeholder — add when needed)
│   ├── tabbly-adapter.ts       # (Placeholder)
│   └── index.ts                # AdapterFactory registry
├── backend/
│   ├── src/
│   │   ├── main.ts             # Express / Fastify entry
│   │   ├── routes/
│   │   │   ├── auth.ts         # JWT login / register / password reset
│   │   │   ├── clients.ts      # Super Admin only
│   │   │   ├── leads.ts        # Upload, edit, delete, search, bulk
│   │   │   ├── calls.ts        # Start / pause / stop / status
│   │   │   ├── campaigns.ts    # Campaign orchestration
│   │   │   ├── recordings.ts   # Download / stream
│   │   │   ├── transcripts.ts  # Search / copy / download
│   │   │   ├── analytics.ts    # Graph data (calls/day, conversion, etc.)
│   │   │   ├── webhooks.ts     # Incoming provider webhooks + replay
│   │   │   └── admin/
│   │   │       ├── providers.ts
│   │   │       ├── agents.ts
│   │   │       ├── billing.ts
│   │   │       └── api-keys.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verify
│   │   │   ├── role.ts         # Super Admin / Client gate
│   │   │   ├── rate-limit.ts
│   │   │   └── audit.ts        # Log admin actions
│   │   ├── services/
│   │   │   ├── campaign-service.ts    # Queue management
│   │   │   ├── lead-processor.ts      # CSV parsing, dedup, mapping
│   │   │   ├── adapter-service.ts     # Loads AdapterFactory by provider
│   │   │   ├── webhook-service.ts     # Validate + replay + retry
│   │   │   ├── notification-service.ts
│   │   │   └── billing-service.ts     # Minutes / cost tracking
│   │   ├── jobs/
│   │   │   ├── call-queue.ts          # Pull from DB, call adapter
│   │   │   ├── retry-worker.ts        # Retry failed calls
│   │   │   └── analytics-aggregator.ts
│   │   └── lib/
│   │       ├── db.ts                # Prisma / SQL client
│   │       ├── crypto.ts            # API key encryption
│   │       └── logger.ts
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with theme provider
│   │   ├── page.tsx              # Login / landing
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # Sidebar + topbar
│   │   │   ├── page.tsx          # Dashboard cards
│   │   │   ├── leads/
│   │   │   ├── calling/
│   │   │   ├── call-history/
│   │   │   ├── recordings/
│   │   │   ├── appointments/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── (admin)/              # Super Admin only routes
│   ├── components/
│   │   ├── ui/                   # shadcn-style primitives
│   │   ├── dashboard/cards/
│   │   ├── leads/upload/
│   │   ├── calling/queue/
│   │   ├── call-history/table/
│   │   ├── recordings/player/
│   │   ├── analytics/charts/
│   │   └── sidebar/
│   ├── lib/
│   │   ├── api.ts                # Fetch wrapper with auth
│   │   ├── auth.ts               # JWT helpers
│   │   └── types.ts              # Shared TypeScript types
│   └── public/
│       └── logo.svg
├── docker-compose.yml            # Postgres + Redis + App + Worker
├── Dockerfile
├── .env.example
└── README.md
```

## Key Design Decisions

### Provider Independence (The Adapter Contract)
- The backend never imports `vapi` SDK directly into routes.
- All routes use `AdapterFactory.create(providerName, config)`.
- Routes call `adapter.startCall(...)`, `adapter.getTranscript(...)`. They receive `NormalizedCall`.
- If Vapi is down, admin switches provider in database (`providers` table). Next call uses new adapter. Frontend unchanged.

### Multi-Tenancy
- Every query includes `client_id = ?` (or admin override).
- Database has `client_id` on nearly every table.
- Super Admin endpoints use middleware to allow `client_id IS NULL` or cross-tenant access.

### Real-Time Progress (Without Changing Frontend)
- Client dashboard shows calling progress via polling (`/calls?campaign_id=X`) every 3s, or SSE/WebSocket.
- Status updates come from webhooks (`webhooks` table) or polling adapter `getStatus()`.
- Call queue is a background job (Redis-based or cron), not blocking HTTP.

### White-Label
- `clients` table stores `business_name`, `logo_url`, `timezone`, `language`, `slug`.
- Settings table (`settings`) holds custom branding colors, domain mapping, email templates.
- Frontend reads settings on load and applies branding.

---
*Next Step: Initialize backend with Prisma (or SQLAlchemy), seed database with schema.sql, create adapter-service wrapper, then build Client Dashboard UI using this scaffold.*
