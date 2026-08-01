CREATE TABLE IF NOT EXISTS client_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes_used INTEGER DEFAULT 0,
  calls_completed INTEGER DEFAULT 0,
  calls_started INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, date)
);

CREATE TABLE IF NOT EXISTS client_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  total_minutes_purchased INTEGER DEFAULT 0,
  minutes_used INTEGER DEFAULT 0,
  minutes_remaining INTEGER DEFAULT 0,
  monthly_call_limit INTEGER DEFAULT 0,
  daily_call_limit INTEGER DEFAULT 0,
  concurrent_call_limit INTEGER DEFAULT 0,
  total_leads_uploaded INTEGER DEFAULT 0,
  total_calls_completed INTEGER DEFAULT 0,
  current_plan VARCHAR(50) DEFAULT 'Basic',
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id)
);

CREATE TABLE IF NOT EXISTS provider_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  total_calls INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  cost_per_minute_cents INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  gross_profit_cents INTEGER DEFAULT 0,
  profit_margin_percent DECIMAL(5,2) DEFAULT 0,
  average_duration_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(provider)
);

CREATE TABLE IF NOT EXISTS billing_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  total_revenue_cents INTEGER DEFAULT 0,
  total_ai_cost_cents INTEGER DEFAULT 0,
  total_profit_cents INTEGER DEFAULT 0,
  remaining_minutes INTEGER DEFAULT 0,
  plan VARCHAR(50),
  renewal_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_id)
);

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_usage_client_date ON client_usage(client_id, date);
CREATE INDEX idx_client_limits_client ON client_limits(client_id);
CREATE INDEX idx_provider_costs_provider ON provider_costs(provider);
CREATE INDEX idx_usage_logs_client ON usage_logs(client_id);
