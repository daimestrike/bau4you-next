-- =================================
-- ДОБАВЛЕНИЕ ПОЛЕЙ ИЗОБРАЖЕНИЙ В ТАБЛИЦУ COMPANIES
-- =================================

-- 1. Проверяем текущую структуру таблицы companies
SELECT 'ТЕКУЩАЯ СТРУКТУРА ТАБЛИЦЫ COMPANIES:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'companies' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Добавляем недостающие столбцы для изображений
SELECT 'ДОБАВЛЯЕМ ПОЛЯ ИЗОБРАЖЕНИЙ:' as info;

-- Основные поля для изображений
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Дополнительные поля для расширенной функциональности компаний
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS specializations TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS mission_statement TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vision_statement TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS values TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS working_hours JSONB;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS awards TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+'));

-- 3. Создаём индексы для новых столбцов
SELECT 'СОЗДАЁМ ИНДЕКСЫ:' as info;
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verified);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating);
CREATE INDEX IF NOT EXISTS idx_companies_specializations ON companies USING GIN(specializations);

-- 4. Проверяем итоговую структуру
SELECT 'ИТОГОВАЯ СТРУКТУРА ТАБЛИЦЫ COMPANIES:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Проверяем, что поля изображений добавлены
SELECT 'ПРОВЕРЯЕМ ПОЛЯ ИЗОБРАЖЕНИЙ:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
  AND column_name IN ('logo_url', 'cover_image')
ORDER BY column_name;

SELECT 'ГОТОВО! Поля для изображений добавлены в таблицу companies.' as result; 