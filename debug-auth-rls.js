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

async function debugAuthAndRLS() {
  console.log('🔍 Проверяем аутентификацию и RLS политики...')

  try {
    // Проверяем текущего пользователя
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Ошибка получения пользователя:', userError)
      return
    }
    
    if (!user) {
      console.log('❌ Пользователь не авторизован')
      console.log('🔧 Попробуем войти с тестовыми данными...')
      
      // Попробуем войти с тестовыми данными
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })
      
      if (signInError) {
        console.error('❌ Ошибка входа:', signInError)
        console.log('🔧 Попробуем зарегистрировать тестового пользователя...')
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'password123'
        })
        
        if (signUpError) {
          console.error('❌ Ошибка регистрации:', signUpError)
          return
        }
        
        console.log('✅ Тестовый пользователь зарегистрирован:', signUpData.user?.id)
      } else {
        console.log('✅ Вход выполнен успешно:', signInData.user?.id)
      }
      
      // Получаем пользователя снова
      const { data: { user: newUser } } = await supabase.auth.getUser()
      if (newUser) {
        console.log('✅ Текущий пользователь:', newUser.id)
      }
    } else {
      console.log('✅ Пользователь авторизован:', user.id)
      console.log('📧 Email:', user.email)
      console.log('🔑 Role:', user.role)
    }
    
    // Проверяем сессию
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('❌ Ошибка получения сессии:', sessionError)
    } else if (session) {
      console.log('✅ Активная сессия найдена')
      console.log('🔑 Access token присутствует:', !!session.access_token)
    } else {
      console.log('❌ Активная сессия не найдена')
    }
    
    // Теперь попробуем создать компанию
    console.log('\n📝 Пробуем создать тестовую компанию...')
    const testCompanyData = {
      name: 'Test Company Auth',
      description: 'Test description for auth',
      type: 'contractor'
    }
    
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      console.error('❌ Пользователь не авторизован для создания компании')
      return
    }
    
    console.log('👤 Создаем компанию от имени пользователя:', currentUser.id)
    
    const { data: companyResult, error: companyError } = await supabase
      .from('companies')
      .insert({
        ...testCompanyData,
        owner_id: currentUser.id
      })
      .select()
      .single()
    
    if (companyError) {
      console.error('❌ Ошибка при создании компании:', companyError)
      console.log('🔍 Код ошибки:', companyError.code)
      console.log('🔍 Сообщение:', companyError.message)
      
      if (companyError.code === '42501') {
        console.log('\n🔧 Это ошибка RLS политики. Проверим политики...')
        
        // Попробуем получить информацию о политиках
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'companies')
        
        if (policiesError) {
          console.log('❌ Не удалось получить информацию о политиках:', policiesError)
        } else {
          console.log('📋 Политики для таблицы companies:', policies)
        }
      }
    } else {
      console.log('✅ Компания создана успешно:', companyResult.id)
      
      // Удаляем тестовую компанию
      await supabase
        .from('companies')
        .delete()
        .eq('id', companyResult.id)
      console.log('🗑️ Тестовая компания удалена')
    }
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error)
  }
}

debugAuthAndRLS()
  .then(() => {
    console.log('🎉 Отладка завершена')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  })