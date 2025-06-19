-- Создание таблицы applications для заявок на тендеры
-- Выполните этот SQL в вашем Supabase SQL Editor

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_applications_tender_id ON applications(tender_id);
CREATE INDEX IF NOT EXISTS idx_applications_contractor_id ON applications(contractor_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Настройка RLS (Row Level Security)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
-- Подрядчики могут видеть только свои заявки
CREATE POLICY "Contractors can view own applications" ON applications
  FOR SELECT USING (
    auth.uid() = contractor_id
  );

-- Клиенты (владельцы тендеров) могут видеть заявки на свои тендеры
CREATE POLICY "Clients can view applications for their tenders" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenders 
      WHERE tenders.id = applications.tender_id 
      AND tenders.client_id = auth.uid()
    )
  );

-- Подрядчики могут создавать заявки
CREATE POLICY "Contractors can create applications" ON applications
  FOR INSERT WITH CHECK (
    auth.uid() = contractor_id
  );

-- Подрядчики могут обновлять только свои заявки (только proposal)
CREATE POLICY "Contractors can update own applications" ON applications
  FOR UPDATE USING (
    auth.uid() = contractor_id
  ) WITH CHECK (
    auth.uid() = contractor_id AND
    OLD.tender_id = NEW.tender_id AND
    OLD.contractor_id = NEW.contractor_id
  );

-- Клиенты могут обновлять статус заявок на свои тендеры
CREATE POLICY "Clients can update application status" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenders 
      WHERE tenders.id = applications.tender_id 
      AND tenders.client_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenders 
      WHERE tenders.id = applications.tender_id 
      AND tenders.client_id = auth.uid()
    )
  );

-- Комментарии к таблице и столбцам
COMMENT ON TABLE applications IS 'Заявки подрядчиков на участие в тендерах';
COMMENT ON COLUMN applications.id IS 'Уникальный идентификатор заявки';
COMMENT ON COLUMN applications.tender_id IS 'Идентификатор тендера';
COMMENT ON COLUMN applications.contractor_id IS 'Идентификатор подрядчика';
COMMENT ON COLUMN applications.proposal IS 'Коммерческое предложение подрядчика';
COMMENT ON COLUMN applications.status IS 'Статус заявки: pending, accepted, rejected';
COMMENT ON COLUMN applications.created_at IS 'Дата и время создания заявки';
COMMENT ON COLUMN applications.updated_at IS 'Дата и время последнего обновления';

-- Проверка существования таблицы tenders (создаем если не существует)
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

-- Комментарий
COMMENT ON TABLE tenders IS 'Таблица тендеров (если не существовала)'; 