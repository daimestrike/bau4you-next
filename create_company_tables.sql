-- Создание таблицы портфолио компаний
CREATE TABLE IF NOT EXISTS company_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    location TEXT,
    category TEXT,
    status TEXT DEFAULT 'completed',
    featured BOOLEAN DEFAULT false,
    images TEXT[], -- массив URL изображений
    tags TEXT[], -- массив тегов
    project_url TEXT,
    client_name TEXT,
    project_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы отзывов о компаниях
CREATE TABLE IF NOT EXISTS company_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    reviewer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    project_id UUID REFERENCES company_portfolio(id) ON DELETE SET NULL,
    verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы команды компании
CREATE TABLE IF NOT EXISTS company_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы достижений компании
CREATE TABLE IF NOT EXISTS company_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    achievement_date DATE,
    category TEXT, -- 'award', 'certification', 'milestone', etc.
    issuer TEXT, -- кто выдал награду/сертификат
    image_url TEXT,
    document_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы обновлений компании
CREATE TABLE IF NOT EXISTS company_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'news', -- 'news', 'announcement', 'project_update', etc.
    image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы подписчиков компании
CREATE TABLE IF NOT EXISTS company_followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, follower_id)
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_company_portfolio_company_id ON company_portfolio(company_id);
CREATE INDEX IF NOT EXISTS idx_company_portfolio_featured ON company_portfolio(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_company_reviews_company_id ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_rating ON company_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_company_team_company_id ON company_team(company_id);
CREATE INDEX IF NOT EXISTS idx_company_team_active ON company_team(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_company_achievements_company_id ON company_achievements(company_id);
CREATE INDEX IF NOT EXISTS idx_company_achievements_featured ON company_achievements(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_company_updates_company_id ON company_updates(company_id);
CREATE INDEX IF NOT EXISTS idx_company_updates_published ON company_updates(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_follower_id ON company_followers(follower_id);

-- Создание триггеров для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_portfolio_updated_at BEFORE UPDATE ON company_portfolio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_reviews_updated_at BEFORE UPDATE ON company_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_team_updated_at BEFORE UPDATE ON company_team FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_achievements_updated_at BEFORE UPDATE ON company_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_updates_updated_at BEFORE UPDATE ON company_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Настройка RLS (Row Level Security)
ALTER TABLE company_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_followers ENABLE ROW LEVEL SECURITY;

-- Политики RLS для чтения (все могут читать)
CREATE POLICY "Allow read access to company_portfolio" ON company_portfolio FOR SELECT USING (true);
CREATE POLICY "Allow read access to company_reviews" ON company_reviews FOR SELECT USING (true);
CREATE POLICY "Allow read access to company_team" ON company_team FOR SELECT USING (true);
CREATE POLICY "Allow read access to company_achievements" ON company_achievements FOR SELECT USING (true);
CREATE POLICY "Allow read access to company_updates" ON company_updates FOR SELECT USING (true);
CREATE POLICY "Allow read access to company_followers" ON company_followers FOR SELECT USING (true);

-- Политики RLS для записи (только владельцы компаний)
CREATE POLICY "Allow company owners to manage portfolio" ON company_portfolio 
FOR ALL USING (
    company_id IN (
        SELECT id FROM companies WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Allow company owners to manage team" ON company_team 
FOR ALL USING (
    company_id IN (
        SELECT id FROM companies WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Allow company owners to manage achievements" ON company_achievements 
FOR ALL USING (
    company_id IN (
        SELECT id FROM companies WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Allow company owners to manage updates" ON company_updates 
FOR ALL USING (
    company_id IN (
        SELECT id FROM companies WHERE owner_id = auth.uid()
    )
);

-- Политики для отзывов (любой авторизованный пользователь может оставить отзыв)
CREATE POLICY "Allow authenticated users to create reviews" ON company_reviews 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own reviews" ON company_reviews 
FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Allow users to delete their own reviews" ON company_reviews 
FOR DELETE USING (reviewer_id = auth.uid());

-- Политики для подписчиков
CREATE POLICY "Allow users to follow companies" ON company_followers 
FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Allow users to unfollow companies" ON company_followers 
FOR DELETE USING (follower_id = auth.uid()); 