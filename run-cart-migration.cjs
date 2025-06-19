const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Запуск миграции для создания таблицы cart_items...')
    
    // Читаем SQL файл
    const sqlPath = path.join(__dirname, 'create_cart_items_table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📄 SQL миграция:')
    console.log(sql)
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Выполняем миграцию
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Ошибка выполнения миграции:', error)
      
      // Попробуем выполнить команды по частям
      console.log('🔄 Попытка выполнения команд по частям...')
      
      const commands = sql.split(';').filter(cmd => cmd.trim().length > 0)
      
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i].trim() + ';'
        if (command.length > 1) {
          console.log(`📝 Выполнение команды ${i + 1}/${commands.length}:`)
          console.log(command.substring(0, 100) + '...')
          
          const { error: cmdError } = await supabase.rpc('exec_sql', { sql_query: command })
          
          if (cmdError) {
            console.error(`❌ Ошибка в команде ${i + 1}:`, cmdError)
          } else {
            console.log(`✅ Команда ${i + 1} выполнена успешно`)
          }
        }
      }
    } else {
      console.log('✅ Миграция выполнена успешно!')
      console.log('Результат:', data)
    }
    
    // Проверяем, что таблица создана
    console.log('\n🔍 Проверка создания таблицы cart_items...')
    const { data: tableCheck, error: checkError } = await supabase
      .from('cart_items')
      .select('count(*)')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Таблица cart_items не найдена:', checkError.message)
    } else {
      console.log('✅ Таблица cart_items успешно создана и доступна!')
    }
    
    // Проверяем обновления таблицы orders
    console.log('\n🔍 Проверка обновлений таблицы orders...')
    const { data: ordersCheck, error: ordersError } = await supabase
      .from('orders')
      .select('buyer_info, delivery_address, message, items')
      .limit(1)
    
    if (ordersError) {
      console.error('❌ Ошибка проверки таблицы orders:', ordersError.message)
    } else {
      console.log('✅ Таблица orders успешно обновлена!')
    }
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
  }
}

// Альтернативный способ выполнения через прямые SQL запросы
async function runMigrationDirect() {
  try {
    console.log('🚀 Альтернативный способ: выполнение миграции через прямые запросы...')
    
    // 1. Создаем таблицу cart_items
    console.log('📝 Создание таблицы cart_items...')
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql_query: createTableQuery })
    if (createError) {
      console.error('❌ Ошибка создания таблицы:', createError)
    } else {
      console.log('✅ Таблица cart_items создана')
    }
    
    // 2. Включаем RLS
    console.log('📝 Включение Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql_query: 'ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;' 
    })
    if (rlsError) {
      console.error('❌ Ошибка включения RLS:', rlsError)
    } else {
      console.log('✅ RLS включен')
    }
    
    // 3. Создаем политики
    const policies = [
      `CREATE POLICY "Users can view own cart items" ON cart_items FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (auth.uid() = user_id);`
    ]
    
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql_query: policy })
      if (policyError && !policyError.message.includes('already exists')) {
        console.error('❌ Ошибка создания политики:', policyError)
      }
    }
    console.log('✅ Политики безопасности созданы')
    
    // 4. Создаем индексы
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);`,
      `CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at);`
    ]
    
    for (const index of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql_query: index })
      if (indexError) {
        console.error('❌ Ошибка создания индекса:', indexError)
      }
    }
    console.log('✅ Индексы созданы')
    
    // 5. Обновляем таблицу orders
    const orderUpdates = [
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_info JSONB;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS message TEXT;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;`
    ]
    
    for (const update of orderUpdates) {
      const { error: updateError } = await supabase.rpc('exec_sql', { sql_query: update })
      if (updateError) {
        console.error('❌ Ошибка обновления orders:', updateError)
      }
    }
    console.log('✅ Таблица orders обновлена')
    
    // Финальная проверка
    const { data: finalCheck, error: finalError } = await supabase
      .from('cart_items')
      .select('count(*)')
      .limit(1)
    
    if (finalError) {
      console.error('❌ Финальная проверка не пройдена:', finalError)
    } else {
      console.log('🎉 Миграция завершена успешно!')
    }
    
  } catch (error) {
    console.error('❌ Ошибка в альтернативном методе:', error)
  }
}

// Запускаем миграцию
console.log('🔧 Начинаем миграцию базы данных...\n')

runMigrationDirect()
  .then(() => {
    console.log('\n✅ Процесс миграции завершен')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Критическая ошибка:', error)
    process.exit(1)
  }) 