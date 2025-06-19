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

const regions = [
  { name: 'Москва' },
  { name: 'Санкт-Петербург' },
  { name: 'Московская область' },
  { name: 'Ленинградская область' },
  { name: 'Краснодарский край' },
  { name: 'Свердловская область' },
  { name: 'Новосибирская область' },
  { name: 'Татарстан' },
  { name: 'Челябинская область' },
  { name: 'Нижегородская область' },
  { name: 'Самарская область' },
  { name: 'Омская область' },
  { name: 'Ростовская область' },
  { name: 'Уфа' },
  { name: 'Красноярский край' },
  { name: 'Пермский край' },
  { name: 'Воронежская область' },
  { name: 'Волгоградская область' },
  { name: 'Краснодар' },
  { name: 'Саратовская область' }
]

async function seedRegions() {
  console.log('🚀 Начинаем добавление регионов...')

  try {
    // Сначала проверим, есть ли уже данные
    const { data: existingRegions, error: checkError } = await supabase
      .from('regions')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('❌ Ошибка проверки существующих регионов:', checkError)
      return
    }

    if (existingRegions && existingRegions.length > 0) {
      console.log('✅ Регионы уже существуют в базе данных')
      return
    }

    // Добавляем регионы
    const { data, error } = await supabase
      .from('regions')
      .insert(regions)
      .select()

    if (error) {
      console.error('❌ Ошибка добавления регионов:', error)
      return
    }

    console.log(`✅ Успешно добавлено ${data.length} регионов`)
    console.log('Добавленные регионы:', data.map(r => r.name).join(', '))

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
  }
}

seedRegions()
  .then(() => {
    console.log('🎉 Процесс завершен')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  })