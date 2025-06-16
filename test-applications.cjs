const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testApplicationsTable() {
  try {
    console.log('🔍 Testing applications table...')
    
    // Проверяем, существует ли таблица
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table "applications" does not exist')
        console.log('📋 Please run this SQL in Supabase SQL Editor:')
        console.log('\n' + '='.repeat(80))
        console.log(`
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
        `)
        console.log('='.repeat(80) + '\n')
      } else {
        console.error('❌ Error accessing applications table:', error)
      }
    } else {
      console.log('✅ Table "applications" exists and is accessible')
      console.log(`📊 Found ${data?.length || 0} applications`)
      
      // Проверяем структуру таблицы
      const { data: structure, error: structureError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'applications' 
            ORDER BY ordinal_position;
          `
        })
      
      if (!structureError && structure) {
        console.log('📋 Table structure:')
        console.table(structure)
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testApplicationsTable() 