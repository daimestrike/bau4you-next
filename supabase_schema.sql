-- Таблица профилей пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'contractor', 'supplier', 'admin')) DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица компаний
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('contractor', 'supplier', 'both')) DEFAULT 'contractor',
  website TEXT,
  logo_url TEXT,
  address TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица тендеров
CREATE TABLE IF NOT EXISTS tenders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  location TEXT,
  budget_min DECIMAL,
  budget_max DECIMAL,
  deadline DATE,
  status TEXT CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица товаров/материалов
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL NOT NULL,
  unit TEXT DEFAULT 'шт',
  images TEXT[], -- массив URL изображений
  specifications JSONB, -- технические характеристики в JSON
  stock_quantity INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive', 'out_of_stock')) DEFAULT 'active',
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  location TEXT,
  budget DECIMAL,
  deadline DATE,
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'on_hold')) DEFAULT 'planning',
  materials_list JSONB, -- список материалов из формы создания
  company_requirements JSONB, -- требования к компаниям из формы создания
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица материалов проекта (связь многие ко многим между проектами и продуктами)
CREATE TABLE IF NOT EXISTS project_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- может быть NULL если материал еще не выбран
  name TEXT NOT NULL, -- название материала
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  estimated_price DECIMAL,
  actual_price DECIMAL,
  status TEXT CHECK (status IN ('planned', 'ordered', 'delivered', 'installed')) DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица компаний проекта (связь многие ко многим между проектами и компаниями)
CREATE TABLE IF NOT EXISTS project_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- может быть NULL если компания еще не выбрана
  role TEXT NOT NULL, -- роль компании в проекте (генподрядчик, субподрядчик и т.д.)
  budget_min DECIMAL,
  budget_max DECIMAL,
  actual_budget DECIMAL,
  status TEXT CHECK (status IN ('searching', 'negotiating', 'contracted', 'working', 'completed')) DEFAULT 'searching',
  contract_details JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица заявок на тендеры
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE NOT NULL,
  contractor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proposal TEXT NOT NULL,
  budget DECIMAL,
  timeline TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tender_id, contractor_id) -- один подрядчик может подать только одну заявку на тендер
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL, -- связанный тендер (опционально)
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- связанный проект (опционально)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('tender', 'application', 'message', 'project', 'system')) DEFAULT 'system',
  related_id UUID, -- ID связанной сущности (тендер, проект и т.д.)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица опыта работы профилей
CREATE TABLE IF NOT EXISTS profile_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица услуг профилей
CREATE TABLE IF NOT EXISTS profile_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  total_amount DECIMAL NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица позиций заказа
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL NOT NULL, -- цена на момент заказа
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для companies (все могут читать, владельцы могут изменять)
CREATE POLICY "Anyone can view companies" ON companies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own companies" ON companies
  FOR UPDATE USING (auth.uid() = owner_id);

-- Политики для tenders (все могут читать опубликованные, клиенты могут управлять своими)
CREATE POLICY "Anyone can view published tenders" ON tenders
  FOR SELECT TO authenticated USING (status = 'published');

CREATE POLICY "Clients can view own tenders" ON tenders
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert own tenders" ON tenders
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own tenders" ON tenders
  FOR UPDATE USING (auth.uid() = client_id);

-- Политики для products (все могут читать активные, продавцы могут управлять своими)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT TO authenticated USING (status = 'active');

CREATE POLICY "Sellers can view own products" ON products
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

-- Политики для projects (только владельцы могут видеть и управлять)
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = owner_id);

-- Политики для project_materials (через связанные проекты)
CREATE POLICY "Users can view project materials" ON project_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_materials.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage project materials" ON project_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_materials.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Политики для project_companies (через связанные проекты)
CREATE POLICY "Users can view project companies" ON project_companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_companies.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage project companies" ON project_companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_companies.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Политики для applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Tender owners can view applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenders 
      WHERE tenders.id = applications.tender_id 
      AND tenders.client_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can insert applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update own applications" ON applications
  FOR UPDATE USING (auth.uid() = contractor_id);

-- Политики для messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Политики для notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_tenders_updated_at
  BEFORE UPDATE ON tenders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_project_materials_updated_at
  BEFORE UPDATE ON project_materials
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_project_companies_updated_at
  BEFORE UPDATE ON project_companies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_tenders_client_id ON tenders(client_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_materials_project_id ON project_materials(project_id);
CREATE INDEX IF NOT EXISTS idx_project_materials_product_id ON project_materials(product_id);
CREATE INDEX IF NOT EXISTS idx_project_companies_project_id ON project_companies(project_id);
CREATE INDEX IF NOT EXISTS idx_project_companies_company_id ON project_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_tender_id ON applications(tender_id);
CREATE INDEX IF NOT EXISTS idx_applications_contractor_id ON applications(contractor_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id); 