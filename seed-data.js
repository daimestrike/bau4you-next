import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedData() {
  console.log('🌱 Начинаем добавление тестовых данных...')

  try {
    // Тестовые компании
    console.log('📊 Добавляем компании...')
    const companies = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'СтройМастер',
        description: 'Ведущая строительная компания с 15-летним опытом работы. Специализируемся на жилом и коммерческом строительстве, реконструкции и ремонте.',
        industry: 'construction',
        city: 'Москва',
        address: 'ул. Строителей, 15',
        phone: '+7 (495) 123-45-67',
        email: 'info@stroymaster.ru',
        website: 'https://stroymaster.ru',
        logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
        cover_image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop&crop=center',
        founding_year: 2008,
        employee_count: 85,
        services: ['Строительство домов', 'Ремонт квартир', 'Коммерческое строительство', 'Реконструкция'],
        verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'АрхиДизайн Студия',
        description: 'Архитектурная студия полного цикла. Создаем уникальные проекты от концепции до воплощения. Индивидуальный подход к каждому клиенту.',
        industry: 'architecture',
        city: 'Санкт-Петербург',
        address: 'Невский пр., 120',
        phone: '+7 (812) 987-65-43',
        email: 'hello@archidesign.spb.ru',
        website: 'https://archidesign.spb.ru',
        logo_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&h=200&fit=crop&crop=center',
        cover_image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=400&fit=crop&crop=center',
        founding_year: 2015,
        employee_count: 12,
        services: ['Архитектурное проектирование', 'Дизайн интерьера', '3D визуализация', 'Авторский надзор'],
        verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'ЭлектроТех Сервис',
        description: 'Профессиональные электромонтажные работы любой сложности. Проектирование, монтаж и обслуживание электрических систем.',
        industry: 'electrical',
        city: 'Екатеринбург',
        address: 'ул. Энергетиков, 45',
        phone: '+7 (343) 555-12-34',
        email: 'order@electrotech.ural.ru',
        website: 'https://electrotech.ural.ru',
        logo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop&crop=center',
        cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center',
        founding_year: 2012,
        employee_count: 28,
        services: ['Электромонтаж', 'Проектирование электросетей', 'Установка освещения', 'Аварийный ремонт'],
        verified: false
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'СантехПро',
        description: 'Комплексные сантехнические услуги для дома и офиса. Быстро, качественно, с гарантией. Работаем 24/7.',
        industry: 'plumbing',
        city: 'Новосибирск',
        address: 'ул. Водопроводная, 8',
        phone: '+7 (383) 777-88-99',
        email: 'info@santehpro.nsk.ru',
        website: 'https://santehpro.nsk.ru',
        logo_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=200&h=200&fit=crop&crop=center',
        cover_image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=400&fit=crop&crop=center',
        founding_year: 2018,
        employee_count: 15,
        services: ['Установка сантехники', 'Ремонт труб', 'Монтаж систем отопления', 'Аварийная служба'],
        verified: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'КровляСпец',
        description: 'Специалисты по кровельным работам с 20-летним опытом. Все виды кровли: от ремонта до полной замены.',
        industry: 'roofing',
        city: 'Казань',
        address: 'ул. Кровельная, 22',
        phone: '+7 (843) 444-55-66',
        email: 'zakaz@krovlyaspec.kzn.ru',
        website: 'https://krovlyaspec.kzn.ru',
        logo_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop&crop=center',
        cover_image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=400&fit=crop&crop=center',
        founding_year: 2003,
        employee_count: 35,
        services: ['Монтаж кровли', 'Ремонт крыш', 'Утепление кровли', 'Водосточные системы'],
        verified: true
      }
    ]

    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .upsert(companies, { onConflict: 'id' })

    if (companiesError) {
      console.error('❌ Ошибка при добавлении компаний:', companiesError)
    } else {
      console.log('✅ Компании добавлены успешно')
    }

    // Тестовые тендеры
    console.log('📋 Добавляем тендеры...')
    const tenders = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        title: 'Строительство загородного дома 200 м²',
        description: 'Требуется строительство двухэтажного загородного дома площадью 200 м² из газобетона. Участок подготовлен, есть все коммуникации. Нужен полный цикл работ от фундамента до отделки.',
        budget_min: 10000000,
        deadline: '2024-08-15',
        location: 'Московская область, Одинцовский район',
        category: 'construction',
        status: 'published',
        requirements: ['Опыт строительства от 5 лет', 'Наличие СРО', 'Портфолио аналогичных проектов', 'Гарантия на работы'],
        client_id: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        title: 'Дизайн-проект квартиры 85 м²',
        description: 'Разработка дизайн-проекта трехкомнатной квартиры в новостройке. Современный стиль, функциональные решения. Включает планировочное решение, 3D визуализацию, рабочие чертежи.',
        budget_min: 225000,
        deadline: '2024-06-30',
        location: 'Санкт-Петербург, Приморский район',
        category: 'interior_design',
        status: 'published',
        requirements: ['Портфолио в современном стиле', 'Опыт работы с новостройками', '3D визуализация', 'Рабочие чертежи'],
        client_id: '550e8400-e29b-41d4-a716-446655440002'
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440003',
        title: 'Электромонтаж в офисном здании',
        description: 'Монтаж электрической сети в новом офисном здании 5 этажей. Общая площадь 2500 м². Требуется полный комплекс работ: силовые линии, освещение, слаботочные системы.',
        budget_min: 3250000,
        deadline: '2024-07-20',
        location: 'Екатеринбург, Центральный район',
        category: 'electrical',
        status: 'published',
        requirements: ['Допуск к электромонтажным работам', 'Опыт работы с офисными зданиями', 'Команда от 10 человек', 'Соблюдение сроков'],
        client_id: '550e8400-e29b-41d4-a716-446655440003'
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440004',
        title: 'Реконструкция системы отопления',
        description: 'Полная замена системы отопления в жилом доме 1980 года постройки. 5 этажей, 60 квартир. Требуется демонтаж старой системы и монтаж новой с современными радиаторами.',
        budget_min: 2300000,
        deadline: '2024-09-01',
        location: 'Новосибирск, Ленинский район',
        category: 'plumbing',
        status: 'published',
        requirements: ['Лицензия на сантехнические работы', 'Опыт реконструкции', 'Работа с управляющими компаниями', 'Гарантия 3 года'],
        client_id: '550e8400-e29b-41d4-a716-446655440004'
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440005',
        title: 'Ремонт кровли торгового центра',
        description: 'Капитальный ремонт кровли торгового центра площадью 5000 м². Замена гидроизоляции, утепление, монтаж новой мембранной кровли. Работы в зимний период.',
        budget_min: 4500000,
        deadline: '2024-12-15',
        location: 'Казань, Вахитовский район',
        category: 'roofing',
        status: 'published',
        requirements: ['Опыт работы с большими площадями', 'Возможность работы зимой', 'Альпинистское снаряжение', 'Страхование ответственности'],
        client_id: '550e8400-e29b-41d4-a716-446655440005'
      }
    ]

    const { data: tendersData, error: tendersError } = await supabase
      .from('tenders')
      .upsert(tenders, { onConflict: 'id' })

    if (tendersError) {
      console.error('❌ Ошибка при добавлении тендеров:', tendersError)
    } else {
      console.log('✅ Тендеры добавлены успешно')
    }

    // Тестовые товары
    console.log('🛒 Добавляем товары...')
    const products = [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        name: 'Перфоратор Bosch GBH 2-28 F',
        description: 'Профессиональный перфоратор с функцией отбойного молотка. Мощность 880 Вт, энергия удара 3.2 Дж. Идеален для сверления отверстий в бетоне, кирпиче и камне. Характеристики: мощность 880 Вт, энергия удара 3.2 Дж, макс. диаметр в бетоне 28 мм, вес 3.2 кг, гарантия 2 года.',
        price: 25900,
        discount: 15,
        category: 'Инструменты',
        image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop',
        in_stock: true,
        stock_quantity: 25,
        status: 'active',

      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        name: 'Газобетонные блоки YTONG D400',
        description: 'Автоклавные газобетонные блоки высокого качества. Размер 625x250x200 мм. Отличные теплоизоляционные свойства, легкость обработки. Плотность D400, теплопроводность 0.096 Вт/м°C, прочность 2.5 МПа, морозостойкость F100, упаковка 64 блока на поддоне.',
        price: 4200,
        category: 'materials',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        in_stock: true,

      },
      {
        id: '770e8400-e29b-41d4-a716-446655440003',
        name: 'Светодиодный прожектор 50W',
        description: 'Мощный LED прожектор для наружного освещения. Степень защиты IP65, срок службы 50000 часов. Идеален для освещения строительных площадок и фасадов. Мощность 50 Вт, световой поток 5000 лм, цветовая температура 4000K, угол свечения 120°.',
        price: 3500,
        category: 'electrical',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        in_stock: true,

      },
      {
        id: '770e8400-e29b-41d4-a716-446655440004',
        name: 'Смеситель для кухни Grohe Eurosmart',
        description: 'Однорычажный смеситель для кухни с поворотным изливом. Хромированное покрытие, керамический картридж, экономичный расход воды. Материал: латунь с хромированием, высота излива 200 мм, расход 5.7 л/мин, гарантия 5 лет.',
        price: 8900,
        category: 'plumbing',
        image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop',
        in_stock: true,

      },
      {
        id: '770e8400-e29b-41d4-a716-446655440005',
        name: 'Металлочерепица Grand Line Classic',
        description: 'Металлочерепица с полимерным покрытием. Толщина стали 0.5 мм, гарантия на покрытие 15 лет. Размер листа 1180x2250 мм. Покрытие полиэстер, площадь покрытия 2.4 м², цвет RAL 3005 (винно-красный).',
        price: 890,
        category: 'roofing',
        image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
        in_stock: true,

      },
      {
        id: '770e8400-e29b-41d4-a716-446655440006',
        name: 'Дрель-шуруповерт Makita DF331D',
        description: 'Аккумуляторная дрель-шуруповерт 12V. Компактная и легкая, идеальна для работы в ограниченном пространстве. В комплекте 2 аккумулятора и зарядное устройство. Напряжение 12V, макс. крутящий момент 30 Нм, патрон 10 мм, емкость аккумулятора 2.0 Ач, вес 1.1 кг.',
        price: 12500,
        category: 'equipment',
        image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop',
        in_stock: true,

      },
      {
        id: '770e8400-e29b-41d4-a716-446655440007',
        name: 'Керамическая плитка Cersanit Sakura',
        description: 'Настенная керамическая плитка для ванной комнаты. Размер 25x40 см, глянцевая поверхность, влагостойкая. Коллекция в японском стиле. Толщина 8 мм, водопоглощение <10%, морозостойкая, упаковка 1.5 м² (15 плиток).',
        price: 1250,
        category: 'materials',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        in_stock: true,

      },
      {
        id: '770e8400-e29b-41d4-a716-446655440008',
        name: 'Кабель ВВГнг-LS 3x2.5',
        description: 'Силовой кабель с медными жилами в ПВХ изоляции. Не распространяет горение, пониженное дымо- и газовыделение. Для внутренней проводки. Сечение 3x2.5 мм², проводник медь, изоляция ПВХ, оболочка ПВХ пониженной горючести, напряжение 0.66/1 кВ.',
        price: 85,
        category: 'electrical',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        in_stock: true,

      }
    ]

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' })

    if (productsError) {
      console.error('❌ Ошибка при добавлении товаров:', productsError)
    } else {
      console.log('✅ Товары добавлены успешно')
    }

    console.log('🎉 Все тестовые данные добавлены успешно!')
    console.log('📊 Добавлено:')
    console.log(`   • ${companies.length} компаний`)
    console.log(`   • ${tenders.length} тендеров`)
    console.log(`   • ${products.length} товаров`)

  } catch (error) {
    console.error('❌ Общая ошибка:', error)
  }
}

seedData()