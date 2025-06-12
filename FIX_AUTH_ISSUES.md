# Исправление проблем с аутентификацией

## Проблемы:
1. **"Database error saving new user"** - ошибка при регистрации
2. **"Email not confirmed"** - ошибка при входе

## Решение:

### Шаг 1: Исправить функцию создания профиля в Supabase

Выполните SQL скрипт `fix_profile_creation.sql` в SQL Editor Supabase:

```sql
-- Исправленная функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Пересоздаем триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Шаг 2: Исправить существующих пользователей

Выполните SQL скрипт `fix_existing_users.sql` в SQL Editor Supabase:

```sql
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
```

### Шаг 3: Отключить подтверждение email в настройках Supabase

1. Откройте панель Supabase
2. Перейдите в **Authentication** → **Settings**
3. В разделе **Email Auth** найдите **"Confirm email"**
4. **ОТКЛЮЧИТЕ** опцию **"Enable email confirmations"**
5. Сохраните изменения

### Шаг 4: Проверить настройки SMTP (опционально)

Если проблемы продолжаются, проверьте настройки SMTP:
1. В **Authentication** → **Settings** → **SMTP Settings**
2. Убедитесь, что настройки корректны или временно отключите SMTP

## Что было исправлено в коде:

### 1. Функция signUp (`src/lib/supabase.ts`)
- Исправлена логика регистрации и автоматического входа
- Убрана попытка двойного входа
- Улучшена обработка ошибок

### 2. Функция создания профиля (SQL)
- Добавлены все необходимые поля (company_name, phone)
- Исправлено получение данных из raw_user_meta_data

## Проверка работы:

1. Попробуйте зарегистрировать нового пользователя
2. Проверьте, что профиль создался в таблице `profiles`
3. Попробуйте войти под существующим аккаунтом
4. Убедитесь, что нет ошибок "Email not confirmed"

## Если проблемы остаются:

1. **Очистите кэш браузера**
2. **Перезапустите приложение**: `npm run dev`
3. **Проверьте логи в консоли браузера**
4. **Проверьте логи в Supabase Dashboard** → **Logs**

## Для продакшена:

⚠️ **Не забудьте включить обратно подтверждение email в продакшене!**

1. Включите **"Enable email confirmations"**
2. Настройте корректные SMTP настройки
3. Создайте страницу подтверждения email
4. Добавьте возможность повторной отправки письма подтверждения 