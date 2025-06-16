ALTER TABLE companies ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id); CREATE INDEX IF NOT EXISTS idx_companies_region_id ON companies(region_id);
