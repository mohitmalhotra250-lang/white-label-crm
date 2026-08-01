import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import callsRoutes from './routes/calls';
import campaignsRoutes from './routes/campaigns';
import adminProviderRoutes from './routes/admin/providers';
import adminAgentRoutes from './routes/admin/agents';
import adminPhoneRoutes from './routes/admin/phone-numbers';
import adminWebhookRoutes from './routes/admin/webhook-manage';
import adminApiKeyRoutes from './routes/admin/api-keys';
import adminBillingRoutes from './routes/admin/billing';
import adminRevenueRoutes from './routes/admin/revenue';
import pricingRoutes from './routes/admin/pricing';
import adminSandboxRoutes from './routes/admin/sandbox';
import adminHealthRoutes from './routes/admin/health';
import webhookRoutes from './routes/webhooks';
import analyticsRoutes from './routes/analytics';
import http from 'http';
import { initSocket } from './lib/socket';
import { enqueueCall } from './jobs/queue';
import './jobs/worker'; // starts worker

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api/', limiter);

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'crm-backend', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/admin/providers', adminProviderRoutes);
app.use('/api/admin/agents', adminAgentRoutes);
app.use('/api/admin/phone-numbers', adminPhoneRoutes);
app.use('/api/admin/webhooks-manage', adminWebhookRoutes);
app.use('/api/admin/api-keys', adminApiKeyRoutes);
app.use('/api/admin/billing', adminBillingRoutes);
app.use('/api/admin/revenue', adminRevenueRoutes);
app.use('/api/admin/pricing', pricingRoutes);
app.use('/api/admin/sandbox', adminSandboxRoutes);
app.use('/api/admin/health', adminHealthRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.post('/api/queue/enqueue', async (req, res) => { try { const id = await enqueueCall(req.body); res.json({ queued: true, jobId: id }); } catch(e){ res.status(500).json({ error: String(e) }); } });
import appointmentRoutes from './routes/appointments';
app.use('/api/appointments', appointmentRoutes);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`CRM Backend + AI Calling Engine running on port ${PORT}`));
initSocket(server);
