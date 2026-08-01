# Multi-tenant white-label settings extension (add to settings table or new table)
CREATE TABLE IF NOT EXISTS white_label_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  logo_url VARCHAR(500),
  brand_name VARCHAR(255),
  favicon_url VARCHAR(500),
  custom_domain VARCHAR(255),
  primary_color VARCHAR(50) DEFAULT '#06b6d4',
  email_template_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
