-- Создание таблицы company_followers для функциональности подписок на компании

CREATE TABLE IF NOT EXISTS company_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальное ограничение: один пользователь может подписаться на компанию только один раз
  UNIQUE(company_id, user_id)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON company_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_followed_at ON company_followers(followed_at);

-- Включение RLS (Row Level Security)
ALTER TABLE company_followers ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
-- Пользователи могут видеть только свои подписки
CREATE POLICY "Users can view their own follows" ON company_followers
  FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои подписки
CREATE POLICY "Users can create their own follows" ON company_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут удалять свои подписки
CREATE POLICY "Users can delete their own follows" ON company_followers
  FOR DELETE USING (auth.uid() = user_id);

-- Владельцы компаний могут видеть подписчиков своих компаний
CREATE POLICY "Company owners can view their followers" ON company_followers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_followers.company_id 
      AND companies.owner_id = auth.uid()
    )
  );

-- Комментарии к таблице и столбцам
COMMENT ON TABLE company_followers IS 'Таблица подписок пользователей на компании';
COMMENT ON COLUMN company_followers.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN company_followers.company_id IS 'ID компании, на которую подписан пользователь';
COMMENT ON COLUMN company_followers.user_id IS 'ID пользователя, который подписался';
COMMENT ON COLUMN company_followers.followed_at IS 'Дата и время подписки';
COMMENT ON COLUMN company_followers.created_at IS 'Дата создания записи';
COMMENT ON COLUMN company_followers.updated_at IS 'Дата последнего обновления записи';