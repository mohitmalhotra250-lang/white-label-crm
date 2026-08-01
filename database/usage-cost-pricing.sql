ALTER TABLE provider_costs ADD COLUMN IF NOT EXISTS cost_per_minute_cents INTEGER DEFAULT 0;
ALTER TABLE provider_costs ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR';
ALTER TABLE provider_costs ADD COLUMN IF NOT EXISTS setup_fee_cents INTEGER DEFAULT 0;
ALTER TABLE provider_costs ADD COLUMN IF NOT EXISTS markup_percent DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE provider_costs ADD COLUMN IF NOT EXISTS fixed_fee_per_call_cents INTEGER DEFAULT 0;
ALTER TABLE provider_costs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_provider_costs_provider ON provider_costs(provider);
