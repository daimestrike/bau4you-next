import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  console.log('🔧 Создаем тестовые данные...')
  
  try {
    // Получаем первого пользователя и первую компанию
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(3)
    
    if (!users || users.length === 0) {
      console.log('❌ Нет пользователей в базе данных')
      return
    }
    
    if (!companies || companies.length === 0) {
      console.log('❌ Нет компаний в базе данных')
      return
    }
    
    const userId = users[0].id
    console.log('👤 Используем пользователя:', userId)
    console.log('🏢 Доступно компаний:', companies.length)
    
    // Создаем подписки на все доступные компании
    for (const company of companies) {
      console.log(`📝 Создаем подписку на компанию: ${company.id}`)
      
      const { data, error } = await supabase
        .from('company_followers')
        .insert({
          user_id: userId,
          company_id: company.id
        })
        .select()
      
      if (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️ Подписка уже существует для компании: ${company.id}`)
        } else {
          console.log(`❌ Ошибка создания подписки: ${error.message}`)
        }
      } else {
        console.log(`✅ Подписка создана для компании: ${company.id}`)
      }
    }
    
    // Проверяем созданные подписки
    console.log('\n📊 Проверяем созданные подписки...')
    const { data: followers, error: followersError } = await supabase
      .from('company_followers')
      .select(`
        company_id,
        companies (
          id,
          name
        )
      `)
      .eq('user_id', userId)
    
    if (followersError) {
      console.log('❌ Ошибка при проверке подписок:', followersError.message)
    } else {
      console.log('✅ Найдено подписок:', followers.length)
      followers.forEach(follower => {
        console.log(`  - ${follower.companies?.name} (${follower.company_id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error)
  }
}

createTestData()