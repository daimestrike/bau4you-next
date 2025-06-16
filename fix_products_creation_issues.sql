-- =================================
-- ИСПРАВЛЕНИЕ ПРОБЛЕМ С СОЗДАНИЕМ ТОВАРОВ
-- =================================

-- 1. Проверяем текущую структуру таблицы products
SELECT 'ТЕКУЩАЯ СТРУКТУРА ТАБЛИЦЫ PRODUCTS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Добавляем недостающие столбцы в таблицу products
SELECT 'ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ СТОЛБЦЫ:' as info;

-- Основные отсутствующие столбцы
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'шт';
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount DECIMAL;

-- Дополнительные столбцы для расширенной функциональности
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_period INTEGER; -- в месяцах
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price DECIMAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_weight DECIMAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_dimensions JSONB;

-- 3. Создаём индексы для новых столбцов
SELECT 'СОЗДАЁМ ИНДЕКСЫ:' as info;
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- 4. Исправляем RLS политики для products
SELECT 'ИСПРАВЛЯЕМ RLS ПОЛИТИКИ:' as info;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Allow read access to all users" ON products;
DROP POLICY IF EXISTS "Allow read access to products" ON products;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow update for product owners" ON products;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow delete for product owners" ON products;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;

-- Создаём новые, более простые политики
CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (true);

CREATE POLICY "products_insert_policy" ON products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "products_update_policy" ON products
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "products_delete_policy" ON products
    FOR DELETE USING (auth.uid() = seller_id);

-- 5. Проверяем RLS политики для companies
SELECT 'ПРОВЕРЯЕМ RLS ПОЛИТИКИ ДЛЯ COMPANIES:' as info;

-- Создаём политики для companies если их нет
CREATE POLICY IF NOT EXISTS "companies_select_policy" ON companies
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "companies_insert_policy" ON companies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "companies_update_policy" ON companies
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY IF NOT EXISTS "companies_delete_policy" ON companies
    FOR DELETE USING (auth.uid() = owner_id);

-- 6. Убеждаемся что RLS включен
SELECT 'ВКЛЮЧАЕМ RLS:' as info;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 7. Проверяем итоговую структуру
SELECT 'ИТОГОВАЯ СТРУКТУРА ТАБЛИЦЫ PRODUCTS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Проверяем политики
SELECT 'ТЕКУЩИЕ RLS ПОЛИТИКИ ДЛЯ PRODUCTS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

SELECT 'ТЕКУЩИЕ RLS ПОЛИТИКИ ДЛЯ COMPANIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'companies';

-- 9. Тестируем создание товара (будет работать только после аутентификации)
SELECT 'ГОТОВО! Теперь можно создавать товары.' as result; 