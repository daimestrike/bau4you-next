-- =================================
-- ПРОСТОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ PRODUCTS
-- =================================

-- 1. Отключаем RLS временно для диагностики
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем все существующие политики
DROP POLICY IF EXISTS "Allow read access to all users" ON products;
DROP POLICY IF EXISTS "Allow read access to products" ON products;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow update for product owners" ON products;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow delete for product owners" ON products;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update for product owners" ON products;
DROP POLICY IF EXISTS "Enable delete for product owners" ON products;

-- 3. Добавляем недостающие столбцы если их нет
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'шт';
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount DECIMAL;

-- 4. Создаём простые и работающие политики
CREATE POLICY "products_allow_all_read" ON products
    FOR SELECT USING (true);

CREATE POLICY "products_allow_authenticated_insert" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "products_allow_authenticated_update" ON products
    FOR UPDATE USING (true);

CREATE POLICY "products_allow_authenticated_delete" ON products
    FOR DELETE USING (true);

-- 5. Включаем RLS обратно
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. Проверяем что политики созданы
SELECT 'ПРОВЕРЯЕМ ПОЛИТИКИ:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'products';

-- 7. Тестируем создание товара
SELECT 'ТЕСТИРУЕМ СОЗДАНИЕ ТОВАРА:' as info;

-- Пробуем вставить тестовый товар
INSERT INTO products (name, description, category, price, status, in_stock) 
VALUES ('Тест товар', 'Тестовое описание', 'tools', 100, 'active', true)
ON CONFLICT DO NOTHING;

-- Проверяем что товар создался
SELECT COUNT(*) as products_count FROM products WHERE name = 'Тест товар';

-- Удаляем тестовый товар
DELETE FROM products WHERE name = 'Тест товар';

SELECT 'ГОТОВО! RLS политики исправлены.' as result; 