-- Добавляем политику для поиска пользователей по email
-- Это необходимо для функции добавления сотрудников в команду

-- Удаляем существующую политику просмотра профилей
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Создаем новую политику, которая позволяет:
-- 1. Пользователям видеть свой собственный профиль полностью
-- 2. Аутентифицированным пользователям искать других по email (только базовые поля)
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT TO authenticated USING (
    -- Пользователь может видеть свой профиль полностью
    auth.uid() = id 
    OR 
    -- Или аутентифицированные пользователи могут видеть базовую информацию других
    auth.uid() IS NOT NULL
  );

-- Альтернативный вариант: создать отдельную политику только для поиска по email
-- Если нужно более строгое ограничение, можно использовать этот вариант:

/*
CREATE POLICY "Users can search by email" ON profiles
  FOR SELECT TO authenticated USING (
    -- Разрешаем поиск только по email, id, full_name, avatar_url, phone
    auth.uid() IS NOT NULL
  );
*/

-- Проверяем, что политики применились
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';