import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствуют переменные окружения Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('🔍 Проверяем структуру таблицы tenders...')

  // Попробуем получить один тендер, чтобы увидеть доступные поля
  const { data, error } = await supabase
    .from('tenders')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Ошибка при получении данных:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Структура таблицы tenders:')
    console.log('Доступные поля:', Object.keys(data[0]))
    console.log('\nПример записи:')
    console.log(JSON.stringify(data[0], null, 2))
  } else {
    console.log('⚠️ Таблица tenders пуста')
    
    // Попробуем создать тестовую запись с минимальными полями
    console.log('\n🧪 Пробуем создать тестовую запись...')
    const { data: testData, error: testError } = await supabase
      .from('tenders')
      .insert({
        title: 'Тестовый тендер',
        description: 'Описание тестового тендера'
      })
      .select()

    if (testError) {
      console.error('❌ Ошибка при создании тестовой записи:', testError)
    } else {
      console.log('✅ Тестовая запись создана:')
      console.log(JSON.stringify(testData, null, 2))
    }
  }
}

checkTableStructure().catch(console.error)