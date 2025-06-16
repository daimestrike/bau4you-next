-- Создание таблицы applications для заявок подрядчиков на тендеры
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_applications_tender_id ON applications(tender_id);
CREATE INDEX IF NOT EXISTS idx_applications_contractor_id ON applications(contractor_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Настройка Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Политика для подрядчиков: могут видеть только свои заявки
CREATE POLICY "Contractors can view own applications" ON applications
  FOR SELECT USING (contractor_id = auth.uid());

-- Политика для заказчиков: могут видеть заявки на свои тендеры
CREATE POLICY "Clients can view applications on their tenders" ON applications
  FOR SELECT USING (
    tender_id IN (
      SELECT id FROM tenders WHERE client_id = auth.uid()
    )
  );

-- Политика для создания заявок: подрядчики могут создавать заявки
CREATE POLICY "Contractors can create applications" ON applications
  FOR INSERT WITH CHECK (contractor_id = auth.uid());

-- Политика для обновления заявок: заказчики могут обновлять статус заявок на свои тендеры
CREATE POLICY "Clients can update application status" ON applications
  FOR UPDATE USING (
    tender_id IN (
      SELECT id FROM tenders WHERE client_id = auth.uid()
    )
  );

-- Политика для удаления заявок: подрядчики могут удалять свои заявки (только если статус pending)
CREATE POLICY "Contractors can delete own pending applications" ON applications
  FOR DELETE USING (
    contractor_id = auth.uid() AND status = 'pending'
  );

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at_trigger
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Добавление ограничения: один подрядчик может подать только одну заявку на тендер
ALTER TABLE applications ADD CONSTRAINT unique_contractor_tender 
  UNIQUE (tender_id, contractor_id); 