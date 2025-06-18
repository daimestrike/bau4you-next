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

async function seedData() {
  console.log('🚀 Начинаем добавление тестовых данных...')

  // Тестовые компании
  const companies = [
    {
      name: 'СтройТех Групп',
      description: 'Ведущая строительная компания с 15-летним опытом работы на рынке. Специализируемся на строительстве жилых и коммерческих объектов.',
      industry: 'Строительство',
      city: 'Москва',
      employee_count: 150,
      founded_year: 2009,
      is_verified: true
    },
    {
      name: 'ИТ Решения Плюс',
      description: 'Инновационная IT-компания, разрабатывающая современные программные решения для бизнеса.',
      industry: 'Информационные технологии',
      city: 'Санкт-Петербург',
      employee_count: 75,
      founded_year: 2015,
      is_verified: true
    },
    {
      name: 'ЭкоМатериалы',
      description: 'Поставщик экологически чистых строительных материалов премиум-класса.',
      industry: 'Торговля',
      city: 'Екатеринбург',
      employee_count: 45,
      founded_year: 2018,
      is_verified: false
    },
    {
      name: 'Дизайн Студия Модерн',
      description: 'Креативная студия дизайна интерьеров и архитектурного проектирования.',
      industry: 'Дизайн',
      city: 'Новосибирск',
      employee_count: 25,
      founded_year: 2020,
      is_verified: true
    },
    {
      name: 'БезопасностьПро',
      description: 'Комплексные решения в области безопасности и видеонаблюдения.',
      industry: 'Безопасность',
      city: 'Казань',
      employee_count: 60,
      founded_year: 2012,
      is_verified: true
    }
  ];

  // Добавляем компании
  console.log('🏢 Добавляем компании...')
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .insert(companies)
    .select()

  if (companiesError) {
    console.error('❌ Ошибка при добавлении компаний:', companiesError)
  } else {
    console.log('✅ Компании добавлены успешно')
  }

  // Тестовые тендеры
  const tenders = [
    {
      title: 'Строительство офисного здания',
      description: 'Требуется строительство современного офисного здания площадью 2000 кв.м.',
      deadline: '2024-06-30',
      status: 'active'
    },
    {
      title: 'Разработка мобильного приложения',
      description: 'Создание мобильного приложения для iOS и Android.',
      deadline: '2024-04-15',
      status: 'active'
    },
    {
      title: 'Поставка строительных материалов',
      description: 'Требуется поставка цемента, арматуры и других строительных материалов.',
      deadline: '2024-03-20',
      status: 'active'
    }
  ];

  // Добавляем тендеры
  console.log('📋 Добавляем тендеры...')
  const { data: tendersData, error: tendersError } = await supabase
    .from('tenders')
    .insert(tenders)
    .select()

  if (tendersError) {
    console.error('❌ Ошибка при добавлении тендеров:', tendersError)
  } else {
    console.log('✅ Тендеры добавлены успешно')
  }

  // Тестовые товары
  const products = [
    {
      name: 'Профессиональная дрель Makita',
      description: 'Мощная ударная дрель для профессионального использования.',
      price: 12500,
      category: 'Инструменты',
      in_stock: true,
      status: 'active'
    },
    {
      name: 'Цемент М400 50кг',
      description: 'Портландцемент марки М400 в мешках по 50 кг.',
      price: 320,
      category: 'Стройматериалы',
      in_stock: true,
      status: 'active'
    },
    {
      name: 'Светодиодная лампа 12W',
      description: 'Энергосберегающая LED лампа мощностью 12W.',
      price: 450,
      category: 'Электрика',
      in_stock: true,
      status: 'active'
    }
  ];

  // Тестовые проекты
  const projects = [
    {
      name: 'Реконструкция торгового центра',
      description: 'Полная реконструкция торгового центра с современным дизайном.',
      category: 'Строительство',
      budget: 5000000,
      deadline: '2024-08-15',
      status: 'planning'
    },
    {
      name: 'Создание веб-платформы',
      description: 'Разработка современной веб-платформы для электронной коммерции.',
      category: 'IT',
      budget: 800000,
      deadline: '2024-05-30',
      status: 'active'
    },
    {
      name: 'Благоустройство парковой зоны',
      description: 'Комплексное благоустройство парковой зоны с детскими площадками.',
      category: 'Благоустройство',
      budget: 2500000,
      deadline: '2024-07-01',
      status: 'planning'
    }
  ];

  // Добавляем проекты
  console.log('🏗️ Добавляем проекты...')
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .insert(projects)
    .select()

  if (projectsError) {
    console.error('❌ Ошибка при добавлении проектов:', projectsError)
  } else {
    console.log('✅ Проекты добавлены успешно')
  }

  // Добавляем товары
  console.log('🛒 Добавляем товары...')
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (productsError) {
    console.error('❌ Ошибка при добавлении товаров:', productsError)
  } else {
    console.log('✅ Товары добавлены успешно')
  }

  console.log('🎉 Все тестовые данные добавлены!')
  console.log('📊 Добавлено:')
  console.log(`   • ${companies.length} компаний`)
  console.log(`   • ${tenders.length} тендеров`)
  console.log(`   • ${projects.length} проектов`)
  console.log(`   • ${products.length} товаров`)
}

seedData().catch(console.error)