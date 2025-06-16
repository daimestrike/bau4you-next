-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Allow authenticated users to manage portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Allow authenticated users to insert portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Allow company owners to update portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Allow company owners to delete portfolio" ON company_portfolio;

-- Создаем простую политику для всех операций
CREATE POLICY "Allow all operations for authenticated users" ON company_portfolio 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Альтернативно, если нужно разрешить всем (временно для отладки):
-- DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON company_portfolio;
-- CREATE POLICY "Allow all operations" ON company_portfolio FOR ALL USING (true) WITH CHECK (true); 