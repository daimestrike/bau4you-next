-- 1. Убираем старый city_id (если он был) 
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_city_id_fkey, 
  DROP COLUMN     IF EXISTS city_id; 

-- 2. Добавляем column и FK с целочисленным типом 
ALTER TABLE profiles 
  ADD COLUMN city_id INTEGER 
    REFERENCES cities(id) ON DELETE SET NULL; 

-- 3. Индекс для быстрого поиска 
CREATE INDEX IF NOT EXISTS idx_profiles_city_id 
  ON profiles(city_id);