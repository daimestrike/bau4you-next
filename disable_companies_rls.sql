-- Временное отключение RLS для таблицы companies
-- Выполните этот скрипт в Supabase SQL Editor

-- Отключаем RLS для таблицы companies
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Проверяем статус RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'companies';

-- Показываем текущие политики (если есть)
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'companies'; 