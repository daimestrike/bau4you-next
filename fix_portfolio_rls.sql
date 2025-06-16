-- Удаляем старую политику
DROP POLICY IF EXISTS "Allow authenticated users to manage portfolio" ON company_portfolio;

-- Создаем новые политики для разных операций

-- Политика для вставки (INSERT) - только авторизованные пользователи
CREATE POLICY "Allow authenticated users to insert portfolio" ON company_portfolio 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Политика для обновления (UPDATE) - только владельцы компаний
CREATE POLICY "Allow company owners to update portfolio" ON company_portfolio 
FOR UPDATE USING (
    company_id IN (
        SELECT id FROM companies WHERE owner_id = auth.uid()
    )
);

-- Политика для удаления (DELETE) - только владельцы компаний  
CREATE POLICY "Allow company owners to delete portfolio" ON company_portfolio 
FOR DELETE USING (
    company_id IN (
        SELECT id FROM companies WHERE owner_id = auth.uid()
    )
); 