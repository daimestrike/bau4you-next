-- Удаляем существующую политику
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Создаем новую политику, которая позволяет аутентифицированным пользователям
-- просматривать профили других пользователей (необходимо для поиска по email)
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id 
    OR 
    auth.uid() IS NOT NULL
  );

-- Проверяем, что политика создалась
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';