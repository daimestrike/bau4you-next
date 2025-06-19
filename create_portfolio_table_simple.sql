-- Создание таблицы портфолио компаний
CREATE TABLE company_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location TEXT,
    category TEXT,
    status TEXT DEFAULT 'completed',
    featured BOOLEAN DEFAULT false,
    images TEXT[],
    tags TEXT[],
    project_url TEXT,
    client_name TEXT,
    project_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX idx_company_portfolio_company_id ON company_portfolio(company_id);
CREATE INDEX idx_company_portfolio_featured ON company_portfolio(featured) WHERE featured = true;

-- Настройка RLS (Row Level Security)
ALTER TABLE company_portfolio ENABLE ROW LEVEL SECURITY;

-- Политики RLS для чтения (все могут читать)
CREATE POLICY "Allow read access to company_portfolio" ON company_portfolio FOR SELECT USING (true);

-- Политики RLS для записи (только авторизованные пользователи)
CREATE POLICY "Allow authenticated users to manage portfolio" ON company_portfolio 
FOR ALL USING (auth.role() = 'authenticated'); 