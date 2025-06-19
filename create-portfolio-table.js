import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('SUPABASE_URL:', !!supabaseUrl);
  console.log('ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

// Используем anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createTableSQL = `
-- Таблица для портфолио компаний (выполненные проекты)
CREATE TABLE IF NOT EXISTS company_portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  client_name TEXT,
  project_value DECIMAL,
  start_date DATE,
  end_date DATE,
  location TEXT,
  images TEXT[],
  tags TEXT[],
  project_url TEXT,
  status TEXT CHECK (status IN ('completed', 'in_progress', 'draft')) DEFAULT 'completed',
  featured BOOLEAN DEFAULT FALSE,
  tender_id UUID REFERENCES tenders(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_company_portfolio_company_id ON company_portfolio(company_id);
CREATE INDEX IF NOT EXISTS idx_company_portfolio_featured ON company_portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_company_portfolio_created_at ON company_portfolio(created_at);

-- Включаем RLS (Row Level Security)
ALTER TABLE company_portfolio ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: все могут читать
CREATE POLICY IF NOT EXISTS "Anyone can view portfolio items" ON company_portfolio
  FOR SELECT USING (true);

-- Политика для вставки: только владельцы компании
CREATE POLICY IF NOT EXISTS "Company owners can insert portfolio items" ON company_portfolio
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_portfolio.company_id 
      AND companies.owner_id = auth.uid()
    )
  );

-- Политика для обновления: только владельцы компании
CREATE POLICY IF NOT EXISTS "Company owners can update portfolio items" ON company_portfolio
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_portfolio.company_id 
      AND companies.owner_id = auth.uid()
    )
  );

-- Политика для удаления: только владельцы компании
CREATE POLICY IF NOT EXISTS "Company owners can delete portfolio items" ON company_portfolio
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_portfolio.company_id 
      AND companies.owner_id = auth.uid()
    )
  );
`;

async function createTable() {
  try {
    console.log('Creating company_portfolio table...');
    
    // Выполняем SQL через прямой запрос к PostgREST
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    });
    
    if (!response.ok) {
      console.log('Direct SQL execution failed, trying alternative method...');
      
      // Альтернативный способ - создаем таблицу через отдельные запросы
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'company_portfolio')
        .single();
      
      if (error && error.code === 'PGRST116') {
        console.log('Table does not exist, need to create it manually.');
        console.log('Please run the following SQL in your Supabase SQL editor:');
        console.log('\n' + createTableSQL);
      } else {
        console.log('Table check result:', { data, error });
      }
    } else {
      const result = await response.text();
      console.log('Table created successfully:', result);
    }
    
  } catch (err) {
    console.error('Error creating table:', err);
    console.log('\nPlease manually execute this SQL in Supabase SQL editor:');
    console.log('\n' + createTableSQL);
  }
}

createTable();