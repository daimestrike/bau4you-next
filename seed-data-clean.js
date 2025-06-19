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

  // Тестовые тендеры (только основные поля)
  const tenders = [
    {
      title: 'Строительство офисного здания',
      description: 'Требуется строительство современного офисного здания площадью 2000 кв.м. Включает проектирование, строительство и отделочные работы.',
      deadline: '2024-06-30'
    },
    {
      title: 'Разработка мобильного приложения',
      description: 'Создание мобильного приложения для iOS и Android с функциями заказа услуг, оплаты и отслеживания статуса.',
      deadline: '2024-04-15'
    },
    {
      title: 'Поставка строительных материалов',
      description: 'Требуется поставка цемента, арматуры и других строительных материалов для крупного объекта.',
      deadline: '2024-03-20'
    },
    {
      title: 'Дизайн интерьера ресторана',
      description: 'Создание дизайн-проекта интерьера ресторана в современном стиле. Площадь 300 кв.м.',
      deadline: '2024-05-10'
    },
    {
      title: 'Установка системы видеонаблюдения',
      description: 'Проектирование и установка системы видеонаблюдения для торгового центра. 50 камер.',
      deadline: '2024-04-30'
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

  // Тестовые товары (только основные поля)
  const products = [
    {
      name: 'Профессиональная дрель Makita',
      description: 'Мощная ударная дрель для профессионального использования. Мощность 850 Вт, патрон 13 мм, функция удара.',
      price: 12500,
      category: 'Инструменты'
    },
    {
      name: 'Цемент М400 50кг',
      description: 'Портландцемент марки М400 в мешках по 50 кг. Высокое качество, соответствует ГОСТ.',
      price: 320,
      category: 'Стройматериалы'
    },
    {
      name: 'Светодиодная лампа 12W',
      description: 'Энергосберегающая LED лампа мощностью 12W, цоколь E27, теплый белый свет 3000K.',
      price: 450,
      category: 'Электрика'
    },
    {
      name: 'Керамическая плитка 30x30',
      description: 'Керамическая напольная плитка размером 30x30 см, матовая поверхность, цвет бежевый.',
      price: 890,
      category: 'Отделочные материалы'
    },
    {
      name: 'Металлочерепица Grand Line',
      description: 'Металлочерепица премиум класса с полимерным покрытием. Толщина 0.5 мм, гарантия 25 лет.',
      price: 650,
      category: 'Кровельные материалы'
    },
    {
      name: 'Перфоратор Bosch Professional',
      description: 'Профессиональный перфоратор SDS-Plus с функцией долбления. Мощность 800 Вт, энергия удара 2.7 Дж.',
      price: 18900,
      category: 'Инструменты'
    },
    {
      name: 'Утеплитель Rockwool 100мм',
      description: 'Минеральная вата для утепления стен и кровли. Толщина 100 мм, плотность 50 кг/м³.',
      price: 1250,
      category: 'Утеплители'
    },
    {
      name: 'Смеситель для кухни Grohe',
      description: 'Однорычажный смеситель для кухни с выдвижным изливом. Хромированное покрытие, керамический картридж.',
      price: 8500,
      category: 'Сантехника'
    }
  ];

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
  console.log(`   • ${products.length} товаров`)
}

seedData().catch(console.error)