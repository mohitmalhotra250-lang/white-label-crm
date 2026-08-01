# Deployment Checklist — Universal White-Label AI Voice Calling CRM

## Pre-Deployment
- [x] All backend routes implemented and tested
- [x] Database schema applied (`psql < database/schema.sql`)
- [x] Provider adapters complete (Vapi, Retell, Bland, Tabbly, Grok, ElevenLabs, Custom)
- [x] Queue engine configured (Redis + BullMQ)
- [x] Socket.IO server initialized
- [x] Webhook secret set in `.env` (`WEBHOOK_SECRET`)
- [x] JWT secret set (`JWT_SECRET`)
- [x] API keys encrypted at rest (DB column `api_key_encrypted`)
- [x] Rate limiting enabled (`express-rate-limit`)
- [x] Audit logs table created
- [x] Multi-tenant middleware active (`requireClientAccess`)

## Backend Deployment
- [ ] Set environment variables in production (DB URL, REDIS_URL, JWT_SECRET, WEBHOOK_SECRET, ENCRYPTION_KEY)
- [ ] Run `npm install` in `/backend`
- [ ] Apply schema: `psql $DATABASE_URL -f ../database/schema.sql`
- [ ] Start: `npm run build` then `npm start` (or `npm run dev` for staging)
- [ ] Verify `/health` responds
- [ ] Verify `/api/admin/providers` accessible only with Super Admin token
- [ ] Configure first provider (Vapi/Retell) via admin panel
- [ ] Verify queue worker starts: check logs for `AI Calling Engine running`

## Frontend Deployment
- [ ] Set `NEXT_PUBLIC_API_URL` to backend public URL (or use proxy)
- [ ] Run `npm install` in `/frontend`
- [ ] Build: `npm run build`
- [ ] Start: `npm start` (or deploy to Vercel/Netlify)
- [ ] Verify `/login`, `/signup`, `/dashboard` load
- [ ] Verify `/admin` is hidden when logged in as Client (role check)

## Security Hardening (Production)
- [ ] Use HTTPS only (nginx / load balancer / cloud provider)
- [ ] Rotate JWT secret regularly
- [ ] Enable database SSL (if cloud managed DB)
- [ ] Configure S3/R2 for file storage (CSV, recordings)
- [ ] Set up backup/restore for PostgreSQL
- [ ] Monitor `audit_logs` for admin changes
- [ ] Set `WEBHOOK_SECRET` to strong random value
- [ ] Lock down `/admin/*` at network/ingress layer (optional extra layer)

## Performance
- [ ] Add PostgreSQL read replicas for analytics queries
- [ ] Scale BullMQ workers horizontally if needed (`concurrency` + multiple instances)
- [ ] Cache frequently accessed settings via Redis
- [ ] Use CDN for static frontend assets

## Post-Deployment Verification
- [ ] Client can sign up / login
- [ ] Client uploads CSV → leads appear in `/leads`
- [ ] Client clicks Start Calling → `/api/calls/start` returns call record + queue job
- [ ] Real-time progress updates via Socket.IO
- [ ] Call completes → recording/transcript/summary stored
- [ ] Super Admin can switch provider without frontend changes
- [ ] Analytics charts load from `/api/analytics`
