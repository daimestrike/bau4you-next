-- Скрипт для исправления существующих пользователей без профилей

-- 1. Создаем профили для пользователей, у которых их нет
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'client')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Обновляем email_confirmed_at для всех пользователей (временно для разработки)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 3. Проверяем результат
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  p.full_name,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC; 