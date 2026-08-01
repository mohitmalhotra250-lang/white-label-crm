# Production Validation & Testing Checklist

## Functional Testing
- [x] Signup (`POST /api/auth/register`) → login (`POST /api/auth/login`) → JWT session
- [x] Role access: Client routes blocked for Super Admin; Admin routes protected by `requireSuperAdmin`
- [x] CSV upload (`POST /api/leads/upload`) — drag/drop + sample download verified
- [x] Single lead add (`POST /api/leads`) with custom fields
- [x] Call start (`POST /api/calls/start`) → adapter → queue enqueue
- [x] Call stop (`POST /api/calls/:id/stop`) → adapter.stopCall()
- [x] Queue processing: BullMQ worker (`backend/src/jobs/worker.ts`) processes asynchronously
- [x] Duplicate prevention: DB unique + worker checks existing status before processing
- [x] Provider adapter switching: `AdapterFactory.create('Vapi')` vs `'Retell'` — same interface
- [x] Webhook secret validation (`x-webhook-secret`) enforced
- [x] Recording (`GET /api/calls/:id/recording`) and transcript (`GET /api/calls/:id/transcript`) retrieval via adapter
- [x] AI summary storage (`calls.ai_summary`)
- [x] Analytics (`GET /api/analytics`) aggregated by `client_id`
- [x] Appointment creation (`POST /api/appointments`)

## Error Handling
- [x] Invalid CSV → `LeadProcessor` skips bad rows; error logged
- [x] Invalid phone → stored as-is; adapter handles normalization
- [x] Empty lead list → dashboard shows EmptyState component
- [x] Provider API failure → adapter throws; worker retries 3x with backoff; DB updated to `failed`
- [x] Queue worker crash → BullMQ restarts; duplicate call prevented by status check
- [x] DB connection loss → `pg.Pool` reconnect; retry handled by worker
- [x] Network timeout → adapter error caught; `normalizeError` marks retryable

## Performance
- [x] DB indexes: `idx_leads_client_id`, `idx_calls_client_id`, `idx_calls_provider_call_id`, `idx_analytics_client_date`
- [x] Full-text search GIN indexes on leads/transcripts
- [x] Background queue prevents HTTP blocking
- [x] Lazy loading for recordings/transcripts (load on click)
- [x] Pagination-ready via `LIMIT` in queries

## Security
- [x] JWT verified in middleware/auth.ts (httpOnly + header)
- [x] Role-based access (`requireRole` / `requireSuperAdmin` / `requireClientAccess`)
- [x] API keys encrypted at rest (`api_key_encrypted` field)
- [x] Rate limiting (`express-rate-limit`: 100 req/min per IP)
- [x] Webhook HMAC secret validation added
- [x] SQL injection prevented (parameterized queries everywhere)
- [x] XSS prevented (React JSX escaping + no `dangerouslySetInnerHTML`)
- [x] CSRF: JWT cookie/session model used; state-changing POST requires token
- [x] Audit logs (`audit_logs`) for Super Admin actions

## UI / UX
- [x] Responsive: sidebar collapses to drawer on mobile; grids adapt
- [x] Dark mode: `dark` class on html; Tailwind `darkMode` configured
- [x] Professional cards with glassmorphism (`bg-white/[0.07]`, `backdrop-blur`)
- [x] Skeleton loader (`components/ui/skeleton.tsx`)
- [x] Toast notifications (`components/toast.tsx`)
- [x] Empty states (`components/empty-state.tsx`)
- [x] Error states (`components/error-state.tsx`)
- [x] Accessibility: semantic HTML, aria-labels on buttons, focus rings

## Final Fixes Applied
- [x] Webhook secret validation added
- [x] `main.ts` import order corrected
- [x] `/api/appointments` route created + frontend real API connection
- [x] Theme toggle component added (light/dark)
- [x] All adapter placeholders replaced with real implementations
