-- Исправление проблемы с updated_at в таблице companies
-- Выполните этот SQL в Supabase Dashboard -> SQL Editor

-- 1. Добавляем поле updated_at в таблицу companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Обновляем существующие записи
UPDATE companies SET updated_at = created_at WHERE updated_at IS NULL;

-- 3. Проверяем, что поле добавлено
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'companies' AND column_name = 'updated_at'; 