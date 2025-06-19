import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Проверяем базу данных...')
  
  try {
    // Проверяем таблицу company_followers
    console.log('\n📊 Проверяем таблицу company_followers...')
    const { data: followers, error: followersError } = await supabase
      .from('company_followers')
      .select('*')
      .limit(5)
    
    if (followersError) {
      console.log('❌ Ошибка при запросе company_followers:', followersError.message)
      if (followersError.message.includes('does not exist')) {
        console.log('💡 Таблица company_followers не существует. Создайте её с помощью SQL скрипта.')
      }
    } else {
      console.log('✅ Таблица company_followers существует')
      console.log('📊 Количество записей:', followers.length)
      if (followers.length > 0) {
        console.log('📋 Первые записи:', followers)
      }
    }
    
    // Проверяем таблицу companies
    console.log('\n🏢 Проверяем таблицу companies...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(5)
    
    if (companiesError) {
      console.log('❌ Ошибка при запросе companies:', companiesError.message)
    } else {
      console.log('✅ Таблица companies существует')
      console.log('📊 Количество компаний:', companies.length)
      if (companies.length > 0) {
        console.log('📋 Первые компании:', companies)
      }
    }
    
    // Проверяем таблицу profiles
    console.log('\n👤 Проверяем таблицу profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name_first, name_last')
      .limit(5)
    
    if (profilesError) {
      console.log('❌ Ошибка при запросе profiles:', profilesError.message)
    } else {
      console.log('✅ Таблица profiles существует')
      console.log('📊 Количество профилей:', profiles.length)
      if (profiles.length > 0) {
        console.log('📋 Первые профили:', profiles)
      }
    }
    
    // Проверяем текущего пользователя
    console.log('\n🔐 Проверяем аутентификацию...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Ошибка аутентификации:', authError.message)
    } else if (user) {
      console.log('✅ Пользователь найден:', user.email)
    } else {
      console.log('❌ Пользователь не найден')
    }
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error)
  }
}

testDatabase()