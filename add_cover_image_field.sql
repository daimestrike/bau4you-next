-- Добавляем поле cover_image в таблицу companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Добавляем комментарий к полю
COMMENT ON COLUMN companies.cover_image IS 'URL обложки компании'; 