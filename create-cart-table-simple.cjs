// Простой скрипт для создания таблицы cart_items
// Выполните этот SQL в Supabase SQL Editor

console.log(`
🚀 Скопируйте и выполните следующий SQL в Supabase SQL Editor:

-- ========================================
-- СОЗДАНИЕ ТАБЛИЦЫ CART_ITEMS
-- ========================================

-- 1. Создание таблицы корзины покупок
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 2. Включаем Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 3. Политики безопасности для cart_items
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at);

-- 5. Триггер для обновления updated_at
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 6. Обновляем таблицу orders для поддержки новой структуры
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_info JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;

-- ========================================
-- КОНЕЦ МИГРАЦИИ
-- ========================================

📋 Инструкции:
1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Скопируйте и вставьте весь SQL код выше
4. Нажмите "Run" для выполнения
5. Проверьте, что таблица cart_items появилась в Table Editor

✅ После выполнения функциональность корзины будет работать!
`)

console.log('\n🔗 Ссылки:')
console.log('- Supabase Dashboard: https://supabase.com/dashboard')
console.log('- SQL Editor: https://supabase.com/dashboard/project/[your-project]/sql')
console.log('- Table Editor: https://supabase.com/dashboard/project/[your-project]/editor') 