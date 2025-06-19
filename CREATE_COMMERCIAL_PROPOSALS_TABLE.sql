-- Создание таблицы commercial_proposals для системы коммерческих предложений
-- Выполните этот SQL в вашем Supabase SQL Editor после создания таблицы applications

CREATE TABLE IF NOT EXISTS commercial_proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('created', 'uploaded')),
  proposal_data JSONB NULL, -- Данные КП созданного в системе
  file_name VARCHAR(255) NULL, -- Имя загруженного файла
  file_url TEXT NULL, -- URL файла в S3
  file_size BIGINT NULL, -- Размер файла в байтах
  note TEXT NULL, -- Заметка пользователя
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_commercial_proposals_user_id ON commercial_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_commercial_proposals_created_at ON commercial_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commercial_proposals_type ON commercial_proposals(type);
CREATE INDEX IF NOT EXISTS idx_commercial_proposals_title ON commercial_proposals USING gin(to_tsvector('russian', title));

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_commercial_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_commercial_proposals_updated_at
  BEFORE UPDATE ON commercial_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_commercial_proposals_updated_at();

-- Настройка RLS (Row Level Security)
ALTER TABLE commercial_proposals ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои КП
CREATE POLICY "Users can view own commercial proposals" ON commercial_proposals
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать КП для себя
CREATE POLICY "Users can create own commercial proposals" ON commercial_proposals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять только свои КП
CREATE POLICY "Users can update own commercial proposals" ON commercial_proposals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут удалять только свои КП
CREATE POLICY "Users can delete own commercial proposals" ON commercial_proposals
  FOR DELETE USING (auth.uid() = user_id);

-- Комментарии к таблице и столбцам
COMMENT ON TABLE commercial_proposals IS 'Таблица для хранения коммерческих предложений пользователей';
COMMENT ON COLUMN commercial_proposals.id IS 'Уникальный идентификатор предложения';
COMMENT ON COLUMN commercial_proposals.user_id IS 'Идентификатор пользователя-владельца';
COMMENT ON COLUMN commercial_proposals.title IS 'Название коммерческого предложения';
COMMENT ON COLUMN commercial_proposals.type IS 'Тип: created (созданное в системе) или uploaded (загруженный файл)';
COMMENT ON COLUMN commercial_proposals.proposal_data IS 'JSON данные для КП созданного в системе';
COMMENT ON COLUMN commercial_proposals.file_name IS 'Имя загруженного файла';
COMMENT ON COLUMN commercial_proposals.file_url IS 'URL файла в S3 хранилище';
COMMENT ON COLUMN commercial_proposals.file_size IS 'Размер файла в байтах';
COMMENT ON COLUMN commercial_proposals.note IS 'Заметка пользователя о документе';
COMMENT ON COLUMN commercial_proposals.created_at IS 'Дата и время создания';
COMMENT ON COLUMN commercial_proposals.updated_at IS 'Дата и время последнего обновления';

-- Пример данных для тестирования (можно удалить после создания таблицы)
-- INSERT INTO commercial_proposals (user_id, title, type, note) VALUES 
-- (auth.uid(), 'Тестовое КП', 'created', 'Пример коммерческого предложения для тестирования системы'); 