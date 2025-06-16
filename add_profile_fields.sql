-- 0) На всякий случай удаляем старые неудачные колонки 
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_region_id_fkey, 
  DROP COLUMN     IF EXISTS region_id, 
  DROP CONSTRAINT IF EXISTS profiles_city_id_fkey, 
  DROP COLUMN     IF EXISTS city_id 
; 

-- 1) Добавляем все новые текстовые поля 
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS name_first        TEXT, 
  ADD COLUMN IF NOT EXISTS name_last         TEXT, 
  ADD COLUMN IF NOT EXISTS website           TEXT, 
  ADD COLUMN IF NOT EXISTS country           TEXT, 
  ADD COLUMN IF NOT EXISTS city              TEXT, 
  ADD COLUMN IF NOT EXISTS region            TEXT, 
  ADD COLUMN IF NOT EXISTS street_address    TEXT, 
  ADD COLUMN IF NOT EXISTS description       TEXT, 
  ADD COLUMN IF NOT EXISTS headline          TEXT, 
  ADD COLUMN IF NOT EXISTS years_experience  INTEGER DEFAULT 0 
; 

-- 2) Добавляем корректные FK-поля (INTEGER → regions.id / cities.id) 
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL, 
  ADD COLUMN IF NOT EXISTS city_id   INTEGER REFERENCES cities(id)   ON DELETE SET NULL 
; 

-- 3) Индексы для быстрого поиска 
CREATE INDEX IF NOT EXISTS idx_profiles_region_id ON profiles(region_id); 
CREATE INDEX IF NOT EXISTS idx_profiles_city_id   ON profiles(city_id); 
CREATE INDEX IF NOT EXISTS idx_profiles_country   ON profiles(country); 
CREATE INDEX IF NOT EXISTS idx_profiles_city      ON profiles(city);