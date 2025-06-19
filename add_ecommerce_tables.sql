-- Добавляем таблицы для e-commerce функционала

-- Таблица корзины покупок
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- один товар для одного пользователя в корзине
);

-- Таблица отзывов на продукты
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  images TEXT[], -- массив URL изображений к отзыву
  is_verified_purchase BOOLEAN DEFAULT FALSE, -- проверено ли что пользователь покупал товар
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- один отзыв от пользователя на товар
);

-- Таблица избранных товаров (wishlist)
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- один товар в избранном у пользователя
);

-- Таблица скидок и промокодов
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')) NOT NULL,
  discount_value DECIMAL NOT NULL,
  min_order_amount DECIMAL DEFAULT 0,
  max_uses INTEGER, -- максимальное количество использований
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица использования промокодов
CREATE TABLE IF NOT EXISTS discount_code_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  discount_amount DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discount_code_id, user_id, order_id)
);

-- Таблица предложений товаров для проектов
CREATE TABLE IF NOT EXISTS product_project_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  offered_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- кто предлагает
  offered_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- кому предлагают
  quantity INTEGER NOT NULL DEFAULT 1,
  offered_price DECIMAL, -- специальная цена для проекта
  message TEXT, -- сообщение к предложению
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE, -- срок действия предложения
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем поля в таблицу продуктов для улучшенного функционала
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB; -- {length, width, height}
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_period INTEGER; -- гарантия в месяцах
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price DECIMAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[]; -- теги для поиска
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_order_quantity INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_weight DECIMAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_dimensions JSONB;

-- Добавляем поля в таблицу заказов
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL; -- заказ от компании

-- Включаем RLS для новых таблиц
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_project_offers ENABLE ROW LEVEL SECURITY;

-- Политики для корзины
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Политики для отзывов
CREATE POLICY "Anyone can view reviews" ON product_reviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own reviews" ON product_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Политики для избранного
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Политики для промокодов
CREATE POLICY "Anyone can view active discount codes" ON discount_codes
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can view own discount code uses" ON discount_code_uses
  FOR SELECT USING (auth.uid() = user_id);

-- Политики для предложений товаров
CREATE POLICY "Users can view offers to them" ON product_project_offers
  FOR SELECT USING (auth.uid() = offered_to);

CREATE POLICY "Users can manage offers they created" ON product_project_offers
  FOR ALL USING (auth.uid() = offered_by);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_dates ON discount_codes(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_product_project_offers_product_id ON product_project_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_project_offers_project_id ON product_project_offers(project_id);
CREATE INDEX IF NOT EXISTS idx_product_project_offers_offered_to ON product_project_offers(offered_to);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Функция для обновления количества использований промокода
CREATE OR REPLACE FUNCTION update_discount_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE discount_codes 
  SET used_count = used_count + 1
  WHERE id = NEW.discount_code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления количества использований
CREATE TRIGGER update_discount_usage_trigger
  AFTER INSERT ON discount_code_uses
  FOR EACH ROW EXECUTE FUNCTION update_discount_code_usage();

-- Функция для расчета средней оценки продукта
CREATE OR REPLACE FUNCTION calculate_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем средний рейтинг в таблице продуктов (если такое поле добавим)
  -- Пока просто возвращаем NEW
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления рейтинга продукта при добавлении/изменении/удалении отзыва
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION calculate_product_rating(); 