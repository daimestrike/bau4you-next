-- Расширение функциональности компаний
-- Добавляем поля в таблицу companies для полноценного профиля в стиле LinkedIn

-- Дополнительные поля для companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected', 'none')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_documents TEXT[],
ADD COLUMN IF NOT EXISTS social_links JSONB,
ADD COLUMN IF NOT EXISTS working_hours JSONB,
ADD COLUMN IF NOT EXISTS specializations TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS awards TEXT[],
ADD COLUMN IF NOT EXISTS mission_statement TEXT,
ADD COLUMN IF NOT EXISTS vision_statement TEXT,
ADD COLUMN IF NOT EXISTS values TEXT[],
ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Таблица для портфолио компаний (выполненные проекты)
CREATE TABLE IF NOT EXISTS company_portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  client_name TEXT,
  project_value DECIMAL,
  start_date DATE,
  end_date DATE,
  location TEXT,
  images TEXT[],
  tags TEXT[],
  project_url TEXT,
  status TEXT CHECK (status IN ('completed', 'in_progress', 'draft')) DEFAULT 'completed',
  featured BOOLEAN DEFAULT FALSE,
  tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица отзывов о компаниях
CREATE TABLE IF NOT EXISTS company_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  review_text TEXT,
  pros TEXT,
  cons TEXT,
  work_quality_rating INTEGER CHECK (work_quality_rating >= 1 AND work_quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  deadline_rating INTEGER CHECK (deadline_rating >= 1 AND deadline_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, reviewer_id, project_id), -- один отзыв на проект
  UNIQUE(company_id, reviewer_id, tender_id) -- один отзыв на тендер
);

-- Таблица лайков отзывов
CREATE TABLE IF NOT EXISTS review_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES company_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Таблица команды компании (расширенная информация о сотрудниках)
CREATE TABLE IF NOT EXISTS company_team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  phone TEXT,
  is_key_person BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  joined_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица достижений и наград компаний
CREATE TABLE IF NOT EXISTS company_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('award', 'certification', 'achievement', 'recognition')),
  issuer TEXT,
  date_received DATE,
  expiry_date DATE,
  certificate_url TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица подписчиков компаний
CREATE TABLE IF NOT EXISTS company_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Таблица новостей и обновлений компаний
CREATE TABLE IF NOT EXISTS company_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  update_type TEXT CHECK (update_type IN ('news', 'project', 'achievement', 'announcement', 'event')) DEFAULT 'news',
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица лайков обновлений
CREATE TABLE IF NOT EXISTS company_update_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID REFERENCES company_updates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(update_id, user_id)
);

-- Таблица комментариев к обновлениям
CREATE TABLE IF NOT EXISTS company_update_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID REFERENCES company_updates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES company_update_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем Row Level Security
ALTER TABLE company_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_update_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_update_comments ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
-- Портфолио - видно всем, редактируют только владельцы компании
CREATE POLICY "Company portfolio is viewable by everyone" ON company_portfolio
  FOR SELECT USING (true);

CREATE POLICY "Company portfolio can be managed by company owners" ON company_portfolio
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Отзывы - видны всем, создают только авторизованные пользователи
CREATE POLICY "Company reviews are viewable by everyone" ON company_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON company_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON company_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews" ON company_reviews
  FOR DELETE USING (reviewer_id = auth.uid());

-- Лайки отзывов
CREATE POLICY "Review likes are viewable by everyone" ON review_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage review likes" ON review_likes
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Команда компании - видна всем, редактируют только владельцы
CREATE POLICY "Company team is viewable by everyone" ON company_team
  FOR SELECT USING (true);

CREATE POLICY "Company team can be managed by company owners" ON company_team
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Достижения - видны всем, редактируют только владельцы
CREATE POLICY "Company achievements are viewable by everyone" ON company_achievements
  FOR SELECT USING (true);

CREATE POLICY "Company achievements can be managed by company owners" ON company_achievements
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Подписчики - видны всем, управляют только сами пользователи
CREATE POLICY "Company followers are viewable by everyone" ON company_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own following" ON company_followers
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Обновления компаний - видны всем, создают только владельцы
CREATE POLICY "Company updates are viewable by everyone" ON company_updates
  FOR SELECT USING (true);

CREATE POLICY "Company updates can be managed by company owners" ON company_updates
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_id = auth.uid()
    )
  );

-- Лайки обновлений
CREATE POLICY "Company update likes are viewable by everyone" ON company_update_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage update likes" ON company_update_likes
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Комментарии к обновлениям
CREATE POLICY "Company update comments are viewable by everyone" ON company_update_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON company_update_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON company_update_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON company_update_comments
  FOR DELETE USING (user_id = auth.uid());

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_company_portfolio_company_id ON company_portfolio(company_id);
CREATE INDEX IF NOT EXISTS idx_company_portfolio_featured ON company_portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_company_reviews_company_id ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_reviewer_id ON company_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_rating ON company_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_company_team_company_id ON company_team(company_id);
CREATE INDEX IF NOT EXISTS idx_company_achievements_company_id ON company_achievements(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON company_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_company_updates_company_id ON company_updates(company_id);
CREATE INDEX IF NOT EXISTS idx_company_update_likes_update_id ON company_update_likes(update_id);
CREATE INDEX IF NOT EXISTS idx_company_update_comments_update_id ON company_update_comments(update_id);

-- Триггеры для автоматического обновления счетчиков
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM company_reviews 
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    ),
    reviews_count = (
      SELECT COUNT(*) 
      FROM company_reviews 
      WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    )
  WHERE id = COALESCE(NEW.company_id, OLD.company_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON company_reviews
  FOR EACH ROW EXECUTE FUNCTION update_company_rating();

-- Функция для обновления счетчика лайков отзывов
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE company_reviews 
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM review_likes 
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_helpful_count_trigger
  AFTER INSERT OR DELETE ON review_likes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Функция для обновления счетчиков обновлений
CREATE OR REPLACE FUNCTION update_company_update_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'company_update_likes' THEN
    UPDATE company_updates 
    SET likes_count = (
      SELECT COUNT(*) 
      FROM company_update_likes 
      WHERE update_id = COALESCE(NEW.update_id, OLD.update_id)
    )
    WHERE id = COALESCE(NEW.update_id, OLD.update_id);
  END IF;
  
  IF TG_TABLE_NAME = 'company_update_comments' THEN
    UPDATE company_updates 
    SET comments_count = (
      SELECT COUNT(*) 
      FROM company_update_comments 
      WHERE update_id = COALESCE(NEW.update_id, OLD.update_id)
    )
    WHERE id = COALESCE(NEW.update_id, OLD.update_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_update_likes_count_trigger
  AFTER INSERT OR DELETE ON company_update_likes
  FOR EACH ROW EXECUTE FUNCTION update_company_update_counts();

CREATE TRIGGER update_company_update_comments_count_trigger
  AFTER INSERT OR DELETE ON company_update_comments
  FOR EACH ROW EXECUTE FUNCTION update_company_update_counts();

-- Добавляем триггеры updated_at для новых таблиц
CREATE TRIGGER update_company_portfolio_updated_at
  BEFORE UPDATE ON company_portfolio
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_company_reviews_updated_at
  BEFORE UPDATE ON company_reviews
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_company_team_updated_at
  BEFORE UPDATE ON company_team
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_company_updates_updated_at
  BEFORE UPDATE ON company_updates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_company_update_comments_updated_at
  BEFORE UPDATE ON company_update_comments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at(); 