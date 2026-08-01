# Universal White-Label AI Voice Calling CRM — Architecture

## 1. Overview
A multi-tenant, white-label SaaS platform that lets businesses (Clients) upload leads and start AI voice calling with zero API configuration. The Super Admin controls every AI provider, agent, phone number, and billing rule. Clients never see which provider is used.

## 2. Core Philosophy
- **Client Simplicity**: Login → Upload CSV → Click Start Calling → Monitor.
- **Provider Independence**: Only the Provider Adapter Layer talks to Vapi, Retell, Tabbly, Bland, Grok, ElevenLabs, or future APIs.
- **Frontend Stability**: The Client Dashboard never changes when swapping providers.
- **Hidden Complexity**: Agent prompts, API keys, webhooks, and provider health are Super Admin only.

## 3. System Architecture (Layered)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT DASHBOARD (Next.js 14 + TypeScript + Tailwind)               │
│  Dark/Light mode • Glassmorphism • Skeleton loaders • Toasts        │
│  Roles: Client only. No admin menus.                                │
├─────────────────────────────────────────────────────────────────────┤
│  API GATEWAY / BACKEND (Node.js / TypeScript — Express / Fastify)   │
│  JWT Auth • Role-Based Access • Rate Limiting • Audit Logs           │
│  Multi-tenant queries (RLS / row-level filtering via client_id)      │
├─────────────────────────────────────────────────────────────────────┤
│  SERVICE LAYER                                                      │
│  Campaign Orchestrator • Lead Processor • Call Queue • Retry Job    │
│  Notification Service • Analytics Aggregator • Billing Calculator   │
├─────────────────────────────────────────────────────────────────────┤
│  PROVIDER ADAPTER LAYER (The Abstraction)                           │
│  Common interface: startCall / pause / stop / transcript / record  │
│  Implementations: VapiAdapter • RetellAdapter • BlandAdapter • ...  │
│  Health checks • Auto-retry • Provider switching (Admin only)       │
├─────────────────────────────────────────────────────────────────────┤
│  EXTERNAL PROVIDERS                                                 │
│  Vapi • Retell • Tabbly • Bland AI • Grok Voice • ElevenLabs • ...  │
│  Webhook ingestion • Recording storage • Transcript retrieval       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.1 Data Flow — Start Calling
1. Client uploads CSV → Lead Processor validates, deduplicates, maps columns → stored in `leads`.
2. Client clicks **Start Calling** → Campaign Orchestrator creates a `campaign` (status = `running`).
3. Orchestrator pulls uncalled leads from `leads` → creates `calls` records (status = `dialing`).
4. Adapter Layer receives `startCall()` with agent config + phone number → sends to Provider API.
5. Provider initiates call → adapter receives webhook/event → updates `calls` status in real time (via Webhook Manager or polling).
6. During call: status flows `dialing → ringing → connected → talking → completed`.
7. Call ends → adapter fetches transcript + recording URL + AI summary → writes to `transcripts`, `recordings`, `calls`.
8. Orchestrator advances queue → updates `campaign.progress`. If provider fails → retry job tries 3x with backoff.

### 3.2 Multi-Tenancy Model
- Every table has `client_id` (nullable for Super Admin global data).
- All DB connections filter by `client_id` via middleware/Prisma `where` clauses.
- API keys are scoped to `client_id`.
- Super Admin can view all clients via unrestricted queries (`client_id IS NULL` or `OR` logic with admin check).

### 3.3 Provider Adapter Contract (Common Return Format)
Every adapter MUST normalize provider-specific responses into:

```typescript
interface NormalizedCall {
  providerCallId: string;   // Provider's external ID
  status: CallStatus;       // dialing | ringing | connected | talking | completed | busy | failed | ...
  durationSeconds?: number;
  recordingUrl?: string;
  transcriptUrl?: string;
  aiSummary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  cost?: number;            // Per-minute or per-call cost for billing
  errorMessage?: string;    // If failed
}
```

Adding a new provider = implementing this interface in a new adapter file. Zero frontend changes.

## 4. User Roles & Access

| Role         | Capabilities                                                                 |
|--------------|------------------------------------------------------------------------------|
| Super Admin  | All clients • Providers • Agents • Phone numbers • Webhooks • Billing • Logs |
| Client       | Leads • Calling • Call History • Recordings • Transcripts • Analytics • Settings |

- JWT tokens include `userId`, `role`, `clientId`.
- Middleware rejects requests that attempt to access another client's data.
- Super Admin routes are protected by `requireRole('super_admin')`.

## 5. Security Model
- **Auth**: JWT (httpOnly cookie + Authorization header fallback) + bcrypt/hashing.
- **Secrets**: Provider API keys encrypted at rest (AES-256-GCM or database-level encryption). Decryption only in Adapter Layer memory.
- **Webhooks**: Incoming webhooks validated with HMAC secret + replay protection (timestamp + nonce). Webhook Manager logs retries.
- **Files**: CSV uploads scanned (mime-check, size limits), stored on object storage (AWS S3 / R2 / MinIO) with pre-signed URLs. Audio files isolated by `client_id` folder.
- **Rate Limiting**: Per-user (100 req/min), per-IP, per-client aggregate.
- **Audit**: `audit_logs` table (optional) recording Super Admin actions (switch provider, edit agent, change billing).

## 6. Storage Strategy
- **Database**: PostgreSQL 15+ (primary relational store).
- **File Storage**: Object storage (S3-compatible) for CSV, audio, reports.
- **Cache / Queue**: Redis for job queues (Bull / Celery / Sidekiq) + real-time dashboard state.
- **Search**: PostgreSQL full-text indexes on `leads`, `transcripts`, `calls`. For massive scale, Elasticsearch/Meilisearch can be added behind search service without changing UI.

## 7. Performance Targets
- 100+ clients, 10,000+ leads per CSV, 100,000+ total leads.
- Real-time dashboard updates via WebSocket / SSE (optional: Server-Sent Events for simplicity) or polling every 3s.
- Queue-based calling: background workers pull from `calls` table, not blocking HTTP requests.
- Lazy loading for recordings and transcripts (load on click, not on list view).

## 8. Deployment Model
- **Frontend**: Vercel / Netlify (Next.js) or Docker container.
- **Backend**: Containerized (Docker / Kubernetes) with horizontal scaling.
- **Database**: Managed PostgreSQL (AWS RDS / Supabase / DigitalOcean) with read replicas for analytics.
- **Workers**: Separate container/process for calling queue + retry jobs.
- **Webhooks**: Public HTTPS endpoint secured by secret; can be behind nginx reverse proxy.

## 9. Technology Choices (Documented)
- **Frontend**: React 18 + Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui patterns
- **Backend**: Node.js 20 + TypeScript + Express / Fastify + Prisma ORM
- **Database**: PostgreSQL 15+
- **Queue / Cache**: Redis 7+
- **File Storage**: AWS S3 / Cloudflare R2 / MinIO
- **Monitoring**: Structured JSON logs + basic health endpoints (`/health`, `/ready`)

---
*This architecture ensures that clients see only the dashboard, while Super Admins manage complexity behind the adapter layer. Adding Retell, Bland, or a future AI provider never touches the frontend.*
