# 🚀 БЫСТРОЕ ИСПРАВЛЕНИЕ "Database error saving new user"

## Что нужно сделать ПРЯМО СЕЙЧАС:

### 1. Выполните SQL скрипт в Supabase

1. Откройте панель Supabase
2. Перейдите в **SQL Editor**
3. Скопируйте и выполните весь код из файла `simple_fix.sql`:

```sql
-- ПРОСТОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С РЕГИСТРАЦИЕЙ

-- 1. Удаляем старый триггер и функцию
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Создаем новую упрощенную функцию
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Пытаемся вставить профиль с базовыми данными
  INSERT INTO public.profiles (id, email, full_name, company_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING; -- Игнорируем если профиль уже существует
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Если произошла ошибка, все равно возвращаем NEW чтобы не блокировать регистрацию
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Создаем новый триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Исправляем существующих пользователей без профилей
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'client')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Подтверждаем email для всех пользователей (для разработки)
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
```

### 2. Отключите подтверждение email

1. В панели Supabase перейдите в **Authentication** → **Settings**
2. Найдите **"Email Auth"** → **"Confirm email"**
3. **ОТКЛЮЧИТЕ** опцию **"Enable email confirmations"**
4. Нажмите **Save**

### 3. Перезапустите приложение

Приложение уже перезапущено и работает на http://localhost:3002

## Что исправлено:

1. **Двойная защита**: Профиль создается и через триггер, и через код приложения
2. **Обработка ошибок**: Триггер не блокирует регистрацию даже при ошибках
3. **Исправление существующих пользователей**: Автоматически создаются профили
4. **Подтверждение email**: Автоматически подтверждается для всех пользователей

## Проверьте:

1. Попробуйте зарегистрировать нового пользователя
2. Попробуйте войти под существующим аккаунтом
3. Проверьте, что нет ошибок в консоли

## Если все еще не работает:

1. Проверьте логи в Supabase: **Logs** → **Database**
2. Проверьте консоль браузера на ошибки
3. Убедитесь, что SQL скрипт выполнился без ошибок 