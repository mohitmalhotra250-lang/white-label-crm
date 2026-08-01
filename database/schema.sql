-- ===================================================================
-- Universal White-Label AI Voice Calling CRM — PostgreSQL Schema
-- Multi-tenant, provider-independent, scalable
-- ===================================================================

-- Extensions (enables UUID generation, full-text search, JSONB utilities)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -------------------------------------------------------------------
-- ENUMS
-- -------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('super_admin', 'client');
CREATE TYPE client_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE lead_status AS ENUM (
  'new', 'contacted', 'interested', 'not_interested',
  'appointment_booked', 'callback_requested', 'converted', 'churned'
);
CREATE TYPE call_status AS ENUM (
  'dialing', 'ringing', 'connected', 'talking', 'transferred',
  'completed', 'busy', 'rejected', 'no_answer', 'voicemail', 'failed', 'retrying'
);
CREATE TYPE campaign_status AS ENUM ('draft', 'running', 'paused', 'completed', 'stopped');
CREATE TYPE provider_health AS ENUM ('connected', 'disconnected', 'error');
CREATE TYPE appointment_status AS ENUM ('booked', 'pending', 'completed', 'cancelled');
CREATE TYPE sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE notification_type AS ENUM (
  'csv_uploaded', 'calling_started', 'calling_paused', 'calling_completed',
  'appointment_booked', 'api_failure', 'provider_disconnected'
);

-- -------------------------------------------------------------------
-- USERS (Super Admin + Client users)
-- -------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'client',
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- -------------------------------------------------------------------
-- CLIENTS (Tenants / Businesses)
-- -------------------------------------------------------------------
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  slug VARCHAR(150) UNIQUE,
  logo_url VARCHAR(500),
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  billing_email VARCHAR(255),
  status client_status NOT NULL DEFAULT 'active',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_clients_status ON clients(status);

-- -------------------------------------------------------------------
-- LEADS
-- -------------------------------------------------------------------
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  custom_fields JSONB NOT NULL DEFAULT '{}',
  status lead_status NOT NULL DEFAULT 'new',
  tags VARCHAR(100)[],
  notes TEXT,
  timeline JSONB[] NOT NULL DEFAULT '{}',
  duplicate_key VARCHAR(255),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leads_client_id ON leads(client_id);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_duplicate_key ON leads(duplicate_key);
CREATE INDEX idx_leads_custom_json ON leads USING GIN (custom_fields);
CREATE INDEX idx_leads_search ON leads USING GIN (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(company,'') || ' ' || coalesce(email,'')));

-- -------------------------------------------------------------------
-- CAMPAIGNS (Calling campaigns per client)
-- -------------------------------------------------------------------
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  csv_file_url VARCHAR(500),
  total_leads INTEGER NOT NULL DEFAULT 0,
  completed_calls INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- -------------------------------------------------------------------
-- CALLS (The core calling record)
-- -------------------------------------------------------------------
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  provider_call_id VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  status call_status NOT NULL DEFAULT 'dialing',
  call_outcome VARCHAR(100),
  duration_seconds INTEGER DEFAULT 0,
  provider VARCHAR(50),
  recording_url VARCHAR(500),
  transcript_url VARCHAR(500),
  ai_summary TEXT,
  sentiment sentiment,
  retry_count INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  start_timestamp TIMESTAMP WITH TIME ZONE,
  end_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_calls_client_id ON calls(client_id);
CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_campaign_id ON calls(campaign_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_provider_call_id ON calls(provider_call_id);
CREATE INDEX idx_calls_phone ON calls(phone);
CREATE INDEX idx_calls_start_time ON calls(start_timestamp);

-- -------------------------------------------------------------------
-- CALL LOGS (Event stream per call — for debugging / audit)
-- -------------------------------------------------------------------
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  event VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  sender VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_call_logs_call_id ON call_logs(call_id);
CREATE INDEX idx_call_logs_created_at ON call_logs(created_at);

-- -------------------------------------------------------------------
-- RECORDINGS
-- -------------------------------------------------------------------
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  storage_provider VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recordings_call_id ON recordings(call_id);

-- -------------------------------------------------------------------
-- TRANSCRIPTS
-- -------------------------------------------------------------------
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  speaker_segments JSONB NOT NULL DEFAULT '[]',
  word_timestamps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX idx_transcripts_content_search ON transcripts USING GIN (to_tsvector('english', content));

-- -------------------------------------------------------------------
-- APPOINTMENTS
-- -------------------------------------------------------------------
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  phone VARCHAR(50),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'booked',
  notes TEXT,
  calendar_event_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);

-- -------------------------------------------------------------------
-- AGENTS (AI Agents configured by Super Admin)
-- -------------------------------------------------------------------
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  voice VARCHAR(100),
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  greeting TEXT,
  knowledge_base TEXT,
  faq JSONB NOT NULL DEFAULT '[]',
  call_flow JSONB NOT NULL DEFAULT '{}',
  transfer_rules JSONB NOT NULL DEFAULT '{}',
  appointment_rules JSONB NOT NULL DEFAULT '{}',
  end_call_rules JSONB NOT NULL DEFAULT '{}',
  memory_config JSONB NOT NULL DEFAULT '{}',
  temperature FLOAT DEFAULT 0.7,
  variables JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_agents_client_id ON agents(client_id);
CREATE INDEX idx_agents_is_active ON agents(is_active);

-- -------------------------------------------------------------------
-- PROVIDERS (API connections managed by Super Admin)
-- -------------------------------------------------------------------
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  api_key_encrypted VARCHAR(500),
  webhook_url VARCHAR(500),
  base_url VARCHAR(500),
  auth_type VARCHAR(50) DEFAULT 'bearer',
  headers JSONB NOT NULL DEFAULT '{}',
  version VARCHAR(20) DEFAULT 'v1',
  health_status provider_health NOT NULL DEFAULT 'disconnected',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_providers_enabled ON providers(enabled);
CREATE INDEX idx_providers_health ON providers(health_status);

-- -------------------------------------------------------------------
-- API KEYS (For public REST / webhook authentication)
-- -------------------------------------------------------------------
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  scopes VARCHAR(100)[] NOT NULL DEFAULT '{}',
  rate_limit_rpm INTEGER DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- -------------------------------------------------------------------
-- WEBHOOKS (Incoming / Outgoing — managed by Super Admin)
-- -------------------------------------------------------------------
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secret_encrypted VARCHAR(500),
  retries INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_logs JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_webhooks_client_id ON webhooks(client_id);
CREATE INDEX idx_webhooks_event ON webhooks(event_type);

-- -------------------------------------------------------------------
-- NOTIFICATIONS (In-app notifications per user)
-- -------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message VARCHAR(1000) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_client_id ON notifications(client_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;

-- -------------------------------------------------------------------
-- ANALYTICS (Pre-aggregated or computed metrics by date / client)
-- -------------------------------------------------------------------
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric VARCHAR(100) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  granularity VARCHAR(20) NOT NULL DEFAULT 'daily',
  source VARCHAR(50) DEFAULT 'computed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, date, metric, granularity)
);
CREATE INDEX idx_analytics_client_date ON analytics(client_id, date);
CREATE INDEX idx_analytics_metric ON analytics(metric);

-- -------------------------------------------------------------------
-- SETTINGS (Client-level and global settings — JSONB for flexibility)
-- -------------------------------------------------------------------
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, key)
);
CREATE INDEX idx_settings_client_key ON settings(client_id, key);

-- -------------------------------------------------------------------
-- PHONE NUMBERS (Assigned numbers — Super Admin manages)
-- -------------------------------------------------------------------
CREATE TABLE phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  number VARCHAR(30) NOT NULL UNIQUE,
  country VARCHAR(10),
  caller_id VARCHAR(50),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  rotation_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_phone_numbers_client_id ON phone_numbers(client_id);
CREATE INDEX idx_phone_numbers_active ON phone_numbers(is_active) WHERE is_active = TRUE;

-- -------------------------------------------------------------------
-- AUDIT LOGS (Super Admin actions only — immutable log)
-- -------------------------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  action VARCHAR(200) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- -------------------------------------------------------------------
-- BILLING / USAGE (Track minutes, calls, storage per client)
-- -------------------------------------------------------------------
CREATE TABLE billing_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes_used INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  storage_bytes BIGINT DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, date)
);
CREATE INDEX idx_billing_usage_client_date ON billing_usage(client_id, date);

-- -------------------------------------------------------------------
-- TRIGGER: Update clients.updated_at / users.updated_at automatically
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_calls_updated_at BEFORE UPDATE ON calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------------
-- SAMPLE DATA (Super Admin bootstrap — change password immediately)
-- -------------------------------------------------------------------
INSERT INTO clients (id, name, business_name, slug, timezone, language, status)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Universal CRM Demo',
  'Universal CRM Demo Ltd.',
  'universal-demo',
  'Asia/Kolkata',
  'en',
  'active'
) ON CONFLICT DO NOTHING;

INSERT INTO users (id, email, password_hash, full_name, role, client_id, is_active, created_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'superadmin@universalcrm.ai',
  '$2b$12$ExampleHashReplaceWithRealBcryptHashInProduction',
  'Super Admin',
  'super_admin',
  NULL,
  TRUE,
  NOW()
) ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------
-- COMMENTS
-- -------------------------------------------------------------------
COMMENT ON TABLE users IS 'Multi-tenant users. Super Admin has client_id NULL.';
COMMENT ON TABLE clients IS 'Tenant businesses. All data is isolated by client_id.';
COMMENT ON TABLE leads IS 'Uploaded leads with custom JSON fields and duplicate detection.';
COMMENT ON TABLE calls IS 'Every voice call. Provider-agnostic via adapter layer.';
COMMENT ON TABLE providers IS 'Provider adapter configurations (Vapi, Retell, Bland, etc.).';
COMMENT ON TABLE agents IS 'AI Agent configurations. Admin assigns to clients.';
