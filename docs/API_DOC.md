# Universal CRM — API Documentation

Base URL: `http://localhost:4000` (production: your backend URL)
Auth: `Authorization: Bearer <JWT>` (required for all /api/* except auth/login, webhook, health)

## Auth
- `POST /api/auth/login` {email, password} → {token, user}
- `POST /api/auth/register` {email, password, fullName, role?, clientId?} → user
- `GET /api/auth/me` → current JWT user

## Leads
- `GET /api/leads` (filtered by client's `client_id`; super admin can pass `?clientId=`)
- `POST /api/leads` {name, phone, email, company, ...}
- `POST /api/leads/upload` multipart/form-data (file: CSV)
- `GET /api/leads/:id`
- `DELETE /api/leads/:id`

## Calls
- `GET /api/calls` — list with status, duration, provider, recording_url
- `POST /api/calls/start` {campaignId, agentId?, leadId?, phone} → triggers adapter + enqueues BullMQ
- `POST /api/calls/:id/stop` — adapter.stopCall() + DB update
- `GET /api/calls/:id/transcript` → adapter.getTranscript() → saved to `transcripts`
- `GET /api/calls/:id/recording` → adapter.getRecording() → saved to `recordings`

## Campaigns
- `GET/POST /api/campaigns`
- `POST /api/campaigns/:id/start|pause|stop`

## Analytics
- `GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Returns aggregated metrics by `client_id`, `date`, `metric`

## Admin / Super Admin Only
- `GET /api/admin/providers` — list providers
- `POST /api/admin/providers` — create new provider entry (encrypted key)
- `POST /api/admin/providers/:id/test` — adapter.testConnection()
- `GET/POST/PUT /api/admin/agents`
- `GET/POST/PUT /api/admin/phone-numbers`
- `GET/POST/PUT /api/admin/webhooks-manage`
- `GET/POST/PUT /api/admin/api-keys`
- `GET /api/admin/billing`

## Webhooks (Public — provider pushes to these)
- `POST /api/webhooks/:providerName` — validates `x-webhook-secret`, updates `calls.status`

## Queue (Internal / Admin)
- `POST /api/queue/enqueue` — enqueue a call job to BullMQ

## Appointments
- `GET /api/appointments` — list by client
- `POST /api/appointments` — book
