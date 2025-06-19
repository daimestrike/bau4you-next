-- Проверка и создание всех необходимых таблиц для проекта bau4you-next
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Создание таблицы profiles (если не существует)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR(20) CHECK (role IN ('client', 'contractor', 'supplier')) DEFAULT 'client',
  name_first VARCHAR(50),
  name_last VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  region_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание таблицы regions (если не существует) 
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создание таблицы tenders (основная для applications)
CREATE TABLE IF NOT EXISTS tenders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(255),
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  deadline DATE,
  requirements TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создание таблицы applications для заявок на тендеры
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Создание таблицы companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  specialization VARCHAR(100),
  region_id INTEGER REFERENCES regions(id),
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  address TEXT,
  logo_url TEXT,
  inn VARCHAR(20),
  ogrn VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Создание таблицы projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(255),
  budget DECIMAL(12,2),
  deadline DATE,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  region_id INTEGER REFERENCES regions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Создание таблицы project_applications
CREATE TABLE IF NOT EXISTS project_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  proposed_budget DECIMAL(12,2),
  proposed_timeline VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Создание таблицы products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2),
  discount_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  unit VARCHAR(20),
  images TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Создание таблицы commercial_proposals для системы КП
CREATE TABLE IF NOT EXISTS commercial_proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('created', 'uploaded')),
  proposal_data JSONB NULL,
  file_name VARCHAR(255) NULL,
  file_url TEXT NULL,
  file_size BIGINT NULL,
  note TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ИНДЕКСЫ
-- Индексы для applications
CREATE INDEX IF NOT EXISTS idx_applications_tender_id ON applications(tender_id);
CREATE INDEX IF NOT EXISTS idx_applications_contractor_id ON applications(contractor_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Индексы для tenders
CREATE INDEX IF NOT EXISTS idx_tenders_client_id ON tenders(client_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category);
CREATE INDEX IF NOT EXISTS idx_tenders_created_at ON tenders(created_at DESC);

-- Индексы для commercial_proposals
CREATE INDEX IF NOT EXISTS idx_commercial_proposals_user_id ON commercial_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_commercial_proposals_created_at ON commercial_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commercial_proposals_type ON commercial_proposals(type);

-- Индексы для companies
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_region_id ON companies(region_id);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);

-- Индексы для projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_region_id ON projects(region_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Индексы для project_applications
CREATE INDEX IF NOT EXISTS idx_project_applications_project_id ON project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_company_id ON project_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_contractor_id ON project_applications(contractor_id);

-- Индексы для products
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- RLS ПОЛИТИКИ
-- Включаем RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_proposals ENABLE ROW LEVEL SECURITY;

-- Политики для applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Users can create own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- Политики для commercial_proposals
CREATE POLICY "Users can manage own commercial proposals" ON commercial_proposals
  FOR ALL USING (auth.uid() = user_id);

-- Политики для companies (общий доступ на чтение, управление только владельцем)
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own companies" ON companies
  FOR ALL USING (auth.uid() = owner_id);

-- Политики для products (общий доступ на чтение, управление только владельцем компании)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Company owners can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = products.company_id 
      AND companies.owner_id = auth.uid()
    )
  );

-- Политики для tenders (общий доступ на чтение, управление только владельцем)
CREATE POLICY "Tenders are viewable by everyone" ON tenders
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own tenders" ON tenders
  FOR ALL USING (auth.uid() = client_id);

-- Политики для projects (общий доступ на чтение, управление только владельцем)
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = owner_id);

-- Добавляем базовые регионы (если таблица пустая)
INSERT INTO regions (name, code) VALUES 
  ('Москва', 'MSK'),
  ('Санкт-Петербург', 'SPB'),
  ('Московская область', 'MO'),
  ('Ленинградская область', 'LO'),
  ('Краснодарский край', 'KK'),
  ('Республика Татарстан', 'RT'),
  ('Свердловская область', 'SO'),
  ('Новосибирская область', 'NO'),
  ('Челябинская область', 'CHE'),
  ('Самарская область', 'SAM')
ON CONFLICT DO NOTHING;

-- Обновляем схему в Supabase
SELECT pg_catalog.set_config('search_path', '', false);
NOTIFY pgrst, 'reload schema';

-- Выводим информацию о созданных таблицах
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'regions', 'tenders', 'applications', 'companies', 'projects', 'project_applications', 'products', 'commercial_proposals')
ORDER BY tablename; 