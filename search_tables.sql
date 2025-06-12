-- Создание таблицы для истории поиска
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_type TEXT CHECK (result_type IN ('all', 'tenders', 'products', 'companies')) DEFAULT 'all',
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

-- RLS политики
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свою историю поиска
CREATE POLICY "Users can view own search history" ON search_history
FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут добавлять записи в свою историю поиска
CREATE POLICY "Users can insert own search history" ON search_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут удалять свою историю поиска
CREATE POLICY "Users can delete own search history" ON search_history
FOR DELETE USING (auth.uid() = user_id);

-- Создание индексов для полнотекстового поиска
CREATE INDEX IF NOT EXISTS idx_tenders_search ON tenders USING gin(to_tsvector('russian', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('russian', name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_companies_search ON companies USING gin(to_tsvector('russian', name || ' ' || description || ' ' || COALESCE(industry, '')));

-- Функция для улучшенного поиска с весами
CREATE OR REPLACE FUNCTION search_with_weights(search_query TEXT)
RETURNS TABLE(
  type TEXT,
  id UUID,
  title TEXT,
  description TEXT,
  rank REAL
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'tender'::TEXT as type,
    t.id,
    t.title,
    t.description,
    ts_rank_cd(to_tsvector('russian', t.title || ' ' || t.description), plainto_tsquery('russian', search_query), 32) as rank
  FROM tenders t
  WHERE t.status = 'published'
    AND to_tsvector('russian', t.title || ' ' || t.description) @@ plainto_tsquery('russian', search_query)
  
  UNION ALL
  
  SELECT 
    'product'::TEXT as type,
    p.id,
    p.name as title,
    p.description,
    ts_rank_cd(to_tsvector('russian', p.name || ' ' || p.description), plainto_tsquery('russian', search_query), 32) as rank
  FROM products p
  WHERE p.in_stock = true
    AND to_tsvector('russian', p.name || ' ' || p.description) @@ plainto_tsquery('russian', search_query)
  
  UNION ALL
  
  SELECT 
    'company'::TEXT as type,
    c.id,
    c.name as title,
    c.description,
    ts_rank_cd(to_tsvector('russian', c.name || ' ' || c.description || ' ' || COALESCE(c.industry, '')), plainto_tsquery('russian', search_query), 32) as rank
  FROM companies c
  WHERE to_tsvector('russian', c.name || ' ' || c.description || ' ' || COALESCE(c.industry, '')) @@ plainto_tsquery('russian', search_query)
  
  ORDER BY rank DESC;
END;
$$; 