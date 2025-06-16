-- Правильные RLS политики для таблицы companies
-- Выполните этот скрипт ПОСЛЕ отключения RLS и тестирования

-- Включаем RLS для таблицы companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики (если есть)
DROP POLICY IF EXISTS "Enable read access for all users" ON companies;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON companies;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON companies;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON companies;

-- Политика для чтения: все могут видеть все компании
CREATE POLICY "Enable read access for all users" ON companies
    FOR SELECT
    USING (true);

-- Политика для создания: аутентифицированные пользователи могут создавать компании
CREATE POLICY "Enable insert for authenticated users only" ON companies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Политика для обновления: пользователи могут обновлять только свои компании
CREATE POLICY "Enable update for users based on owner_id" ON companies
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Политика для удаления: пользователи могут удалять только свои компании
CREATE POLICY "Enable delete for users based on owner_id" ON companies
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Проверяем созданные политики
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname; 