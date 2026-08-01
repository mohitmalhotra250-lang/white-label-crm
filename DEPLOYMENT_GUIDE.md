# Production Deployment — White-Label AI CRM
# Stack: Vercel (Frontend) + Neon PostgreSQL + Upstash Redis + Supabase Storage

## 1. Required Environment Variables (configure in Vercel + Backend)
DATABASE_URL=postgresql://user:pass@neon-host.neon.tech/universal_crm?sslmode=require
REDIS_URL=rediss://default:password@upstash-redis-host.upstash.io:6379
JWT_SECRET=<generate 256-bit>
WEBHOOK_SECRET=<generate strong secret>
ENCRYPTION_KEY=<32 char>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_KEY=<from Supabase dashboard>
S3_BUCKET=your-bucket

## 2. Deployment Commands
# Backend (Docker/Railway/Render — or deploy via Vercel serverless adapter)
docker-compose -f docker-compose.yml up -d db redis backend
# Frontend
vercel --prod

## 3. URLs (after domain configured)
Frontend: https://yourdomain.com
Backend API: https://api.yourdomain.com
Health: https://api.yourdomain.com/health
Admin: https://yourdomain.com/admin

## 4. Health Checks
- /health → DB connection + service status
- /api/admin/monitoring → DB latency + queue + provider health
- /api/admin/providers → test connection per provider

## 5. SSL / Domain
- Configure custom domain in Vercel dashboard
- Upload SSL cert or use Vercel automatic HTTPS
- Update Nginx / reverse proxy for custom domain

## 6. Security Before Going Live
- Change default JWT_SECRET
- Change WEBHOOK_SECRET
- Configure provider API keys via /api/admin/providers (encrypted)
- Enable PostgreSQL SSL (Neon provides by default)
- Apply database migrations: psql $DATABASE_URL -f database/usage-cost-schema.sql
- Verify webhook secret matches provider dashboard

## 7. Status
NOT AUTOMATICALLY DEPLOYED — Waiting for your cloud credentials and confirmation.
