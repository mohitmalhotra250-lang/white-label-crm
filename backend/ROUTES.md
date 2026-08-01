# Backend API Routes — Universal White-Label AI Voice CRM

## Auth
- `POST /api/auth/login` — email + password → JWT
- `POST /api/auth/register` — create user (client or super_admin)
- `GET /api/auth/me` — current JWT user

## Leads (Client/Admin — filtered by `client_id`)
- `GET /api/leads` — list (limit 200)
- `POST /api/leads` — create single lead
- `POST /api/leads/upload` — CSV multipart upload → `LeadProcessor`
- `GET /api/leads/:id` — get lead
- `DELETE /api/leads/:id` — delete

## Calls (Client/Admin — adapter layer integrated)
- `GET /api/calls` — list
- `POST /api/calls/start` — starts call via `AdapterService.startCall()` (reads campaign + provider from DB)
- `POST /api/calls/:id/stop` — stops via `adapter.stopCall()`
- `GET /api/calls/:id/transcript` — fetches via `adapter.getTranscript()` → writes `transcripts`
- `GET /api/calls/:id/recording` — fetches via `adapter.getRecording()` → writes `recordings`

## Campaigns (Client/Admin)
- `GET /api/campaigns`
- `POST /api/campaigns`
- `POST /api/campaigns/:id/start`
- `POST /api/campaigns/:id/pause`
- `POST /api/campaigns/:id/stop`

## Admin / Super Admin Only
- `GET/POST /api/admin/providers` — manage API keys / base URLs / health
- `POST /api/admin/providers/:id/test` — `AdapterService.testConnection()`
- `GET/POST/PUT/DELETE /api/admin/agents`
- `GET/POST/PUT /api/admin/phone-numbers`
- `GET/POST/PUT /api/admin/webhooks-manage`
- `GET/POST/PUT /api/admin/api-keys`
- `GET /api/admin/billing`

## System
- `POST /api/webhooks/:providerName` — incoming Vapi/Retell events → updates `calls.status`
- `GET /api/analytics` — aggregated metrics by `client_id` + date range
- `GET /health` — service health

## Adapter Layer Evidence
Every call route uses `AdapterService` which calls `AdapterFactory.create(name)` — never hardcodes Vapi/Retell in routes.
