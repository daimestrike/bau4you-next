-- Исправление политик RLS для таблицы products

-- Удаляем существующие политики
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow read access to products" ON products;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow update for product owners" ON products;
DROP POLICY IF EXISTS "Allow delete for product owners" ON products;

-- Создаем новые политики
-- Разрешаем чтение всем (включая анонимных пользователей)
CREATE POLICY "Allow read access to all users" ON products 
FOR SELECT USING (true);

-- Разрешаем создание, обновление и удаление только аутентифицированным пользователям
CREATE POLICY "Allow insert for authenticated users" ON products 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update for authenticated users" ON products 
FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete for authenticated users" ON products 
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Убеждаемся, что RLS включен
ALTER TABLE products ENABLE ROW LEVEL SECURITY; 