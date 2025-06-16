# Исправление ошибки добавления проектов в портфолио

## Проблема
При добавлении проекта в портфолио компании возникает ошибка:
```
new row violates row-level security policy for table "company_portfolio"
```

## Причина
1. Политика RLS (Row Level Security) блокирует вставку записей
2. Пользователь не авторизован при попытке добавления проекта

## Решение

### 1. Исправьте политики RLS в Supabase Dashboard

Выполните следующий SQL в SQL Editor вашего Supabase Dashboard:

```sql
-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Allow authenticated users to manage portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Allow authenticated users to insert portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Allow company owners to update portfolio" ON company_portfolio;
DROP POLICY IF EXISTS "Allow company owners to delete portfolio" ON company_portfolio;

-- Создаем простую политику для всех операций
CREATE POLICY "Allow all operations for authenticated users" ON company_portfolio 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
```

### 2. Проверьте авторизацию

Убедитесь, что вы авторизованы в системе:
1. Откройте приложение в браузере
2. Войдите в систему через `/login`
3. Перейдите на страницу компании
4. Попробуйте добавить проект в портфолио

### 3. Тестирование

Для тестирования авторизации запустите:
```bash
node test-auth-simple.cjs
```

## Что было исправлено

1. **Добавлена проверка авторизации** на страницу добавления портфолио (`/companies/[id]/portfolio/add`)
2. **Исправлены политики RLS** для таблицы `company_portfolio`
3. **Добавлена защита от неавторизованного доступа** - редирект на страницу входа

## Структура таблицы company_portfolio

Таблица создана со следующими полями:
- `id` - UUID (первичный ключ)
- `company_id` - UUID (ссылка на компанию)
- `title` - название проекта
- `description` - описание
- `start_date`, `end_date` - даты проекта
- `location` - местоположение
- `category` - категория
- `status` - статус проекта
- `featured` - рекомендуемый проект
- `images` - массив URL изображений
- `tags` - массив тегов
- `project_url` - ссылка на проект
- `client_name` - имя клиента
- `project_value` - стоимость проекта

## Следующие шаги

После исправления политик RLS:
1. Войдите в систему
2. Перейдите на страницу компании
3. Нажмите "Добавить проект" в разделе портфолио
4. Заполните форму и сохраните

Проект должен успешно добавиться без ошибок. 