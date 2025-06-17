import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
export { createClient }

// Auth functions
export const signUp = async (email: string, password: string, userData: Record<string, unknown>) => {
  try {
    // Сначала пытаемся зарегистрировать пользователя
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Метаданные для создания профиля через триггер
        emailRedirectTo: undefined // Отключаем редирект для подтверждения email
      }
    })
    
    if (signUpError) {
      console.error('Ошибка при регистрации:', signUpError)
      return { data: null, error: signUpError }
    }
    
    // Ждем немного, чтобы триггер успел создать профиль
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Проверяем, создался ли профиль через триггер
    if (signUpData.user) {
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, name_first, name_last, company_name, phone')
        .eq('id', signUpData.user.id)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Ошибка при проверке профиля:', checkError)
      } else if (existingProfile) {
        // Если триггер не заполнил все поля, дополняем их
        const needsUpdate = !existingProfile.name_first || !existingProfile.name_last || 
                           !existingProfile.company_name || !existingProfile.phone
        
        if (needsUpdate) {
          const updates: Record<string, string> = {}
          
          if (!existingProfile.name_first && userData.name_first) {
            updates.name_first = userData.name_first as string
          }
          if (!existingProfile.name_last && userData.name_last) {
            updates.name_last = userData.name_last as string
          }
          if (!existingProfile.company_name && userData.company_name) {
            updates.company_name = userData.company_name as string
          }
          if (!existingProfile.phone && userData.phone) {
            updates.phone = userData.phone as string
          }
          
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', signUpData.user.id)
            
            if (updateError) {
              console.error('Ошибка при дополнении профиля:', updateError)
            }
          }
        }
      } else {
        // Если профиль не создался триггером, создаем вручную
        const profileData = {
          id: signUpData.user.id,
          email: signUpData.user.email || email,
          name_first: (userData.name_first as string) || (userData.full_name as string)?.split(' ')[0] || '',
          name_last: (userData.name_last as string) || (userData.full_name as string)?.split(' ').slice(1).join(' ') || '',
          company_name: userData.company_name as string || '',
          phone: userData.phone as string || '',
          role: userData.role as string || 'client'
        }
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
        
        if (createError) {
          console.error('Ошибка при создании профиля:', createError)
        }
      }
    }
    
    // Проверяем, есть ли сессия после регистрации
    if (signUpData.session) {
      console.log('✅ Сессия создана автоматически после регистрации')
      return { data: signUpData, error: null }
    }
    
    // Если сессии нет, пытаемся войти вручную
    console.log('🔄 Пытаемся войти после регистрации...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (signInError) {
      console.error('❌ Ошибка при входе после регистрации:', signInError)
      // Возвращаем успех регистрации, даже если автоматический вход не удался
      return { data: signUpData, error: null }
    }
    
    console.log('✅ Успешный вход после регистрации')
    return { data: signInData, error: signInError }
  } catch (error) {
    console.error('Исключение при регистрации:', error)
    return { data: null, error: error as Error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Попытка входа через Supabase для:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('Ответ от Supabase:', { 
      user: data?.user?.email, 
      session: !!data?.session,
      sessionToken: data?.session?.access_token ? `${data.session.access_token.substring(0, 20)}...` : 'none',
      error: error?.message 
    })
    
    if (error) {
      console.error('Ошибка Supabase signIn:', error)
      return { data: null, error }
    }
    
    if (!data.user || !data.session) {
      console.error('Пользователь или сессия не найдены в ответе')
      return { data: null, error: new Error('Ошибка аутентификации') }
    }

    // Дополнительно убеждаемся, что сессия установлена
    try {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      })
      console.log('✅ Сессия успешно установлена')
    } catch (sessionError) {
      console.error('❌ Ошибка установки сессии:', sessionError)
    }

    // Отправляем данные на сервер для установки cookies
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }),
        credentials: 'include'
      })
      console.log('✅ Server session установлена')
    } catch (serverError) {
      console.error('❌ Ошибка установки server session:', serverError)
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Исключение в signIn:', err)
    return { data: null, error: err as Error }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  try {
    // Добавляем таймаут для функции получения пользователя
    const getUserPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000)
    )

    const { data: { user }, error } = await Promise.race([getUserPromise, timeoutPromise]) as any
    
    // Логируем только если есть пользователь
    if (user) {
      console.log('✅ getCurrentUser successful:', user.id)
    }
    
    return { user, error }
  } catch (error) {
    // Не логируем ошибку "Auth session missing" так как это нормальное состояние
    const errorMessage = (error as Error).message
    if (!errorMessage.includes('Auth session missing')) {
      console.error('❌ getCurrentUser failed:', error)
    }
    return { user: null, error: error as Error }
  }
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Record<string, unknown>) => {
  console.log('updateProfile called with updates:', updates)
  
  // Создаем совершенно новый объект с явно указанными полями
  const profileUpdate: Record<string, unknown> = {}
  
  // Строковые поля
  if (updates.name_first !== undefined) profileUpdate.name_first = updates.name_first
  if (updates.name_last !== undefined) profileUpdate.name_last = updates.name_last
  if (updates.company_name !== undefined) profileUpdate.company_name = updates.company_name
  if (updates.phone !== undefined) profileUpdate.phone = updates.phone
  if (updates.website !== undefined) profileUpdate.website = updates.website
  if (updates.country !== undefined) profileUpdate.country = updates.country
  if (updates.city !== undefined) profileUpdate.city = updates.city
  if (updates.region !== undefined) profileUpdate.region = updates.region
  if (updates.street_address !== undefined) profileUpdate.street_address = updates.street_address
  if (updates.description !== undefined) profileUpdate.description = updates.description
  if (updates.headline !== undefined) profileUpdate.headline = updates.headline
  if (updates.role !== undefined) profileUpdate.role = updates.role
  
  // Числовые поля с обработкой
  if (updates.years_experience !== undefined) {
    const value = updates.years_experience
    if (value === '' || value === null || value === undefined) {
      profileUpdate.years_experience = null
    } else if (typeof value === 'string') {
      const parsed = parseInt(value, 10)
      profileUpdate.years_experience = isNaN(parsed) ? null : parsed
    } else {
      profileUpdate.years_experience = value
    }
  }
  
  if (updates.region_id !== undefined) {
    const value = updates.region_id
    if (value === '' || value === null || value === undefined) {
      profileUpdate.region_id = null
    } else if (typeof value === 'string') {
      const parsed = parseInt(value, 10)
      profileUpdate.region_id = isNaN(parsed) ? null : parsed
    } else {
      profileUpdate.region_id = value
    }
  }
  
  if (updates.city_id !== undefined) {
    const value = updates.city_id
    if (value === '' || value === null || value === undefined) {
      profileUpdate.city_id = null
    } else if (typeof value === 'string') {
      const parsed = parseInt(value, 10)
      profileUpdate.city_id = isNaN(parsed) ? null : parsed
    } else {
      profileUpdate.city_id = value
    }
  }

  console.log('Manually constructed profileUpdate:', profileUpdate)
  console.log('Keys in profileUpdate:', Object.keys(profileUpdate))

  // Финальная проверка - убеждаемся, что updated_at точно нет
  if ('updated_at' in profileUpdate) {
    console.error('CRITICAL ERROR: updated_at somehow appeared in profileUpdate!')
    delete profileUpdate.updated_at
  }

  // Create a completely clean object to ensure no unwanted fields
  const cleanUpdate = JSON.parse(JSON.stringify(profileUpdate))
  
  // Double-check and remove any updated_at field that might have appeared
  if ('updated_at' in cleanUpdate) {
    delete cleanUpdate.updated_at
  }
  
  console.log('Final clean update object:', cleanUpdate)
  console.log('Final clean update keys:', Object.keys(cleanUpdate))

  // Temporarily disable the trigger by using a raw SQL approach
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(cleanUpdate)
      .eq('id', userId)
      .select('*')
    
    return { data, error }
  } catch (triggerError) {
    console.log('Trigger error detected, trying alternative approach...')
    
    // If the trigger fails, try to disable it temporarily
    // This is a workaround until the updated_at column is added
    const updateFields = Object.keys(cleanUpdate)
      .map(key => `${key} = $${Object.keys(cleanUpdate).indexOf(key) + 2}`)
      .join(', ')
    
    const values = [userId, ...Object.values(cleanUpdate)]
    
    const { data: rawData, error: rawError } = await supabase.rpc('sql', {
      query: `
        UPDATE profiles 
        SET ${updateFields}
        WHERE id = $1
        RETURNING *;
      `,
      params: values
    })
    
        return { data: rawData, error: rawError }
  }
}

// Tender functions
export const getTenders = async (filters?: {
  category?: string
  location?: string
  budget_min?: number
  budget_max?: number
}) => {
  let query = supabase
    .from('tenders')
    .select(`
      *,
      profiles:client_id(*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  if (filters?.budget_min) {
    query = query.gte('budget_min', filters.budget_min)
  }
  if (filters?.budget_max) {
    query = query.lte('budget_max', filters.budget_max)
  }

  const { data, error } = await query
  return { data, error }
}

export const getTender = async (id: string) => {
  const { data, error } = await supabase
    .from('tenders')
    .select(`
      *,
      profiles:client_id(*),
      applications(
        *,
        profiles:contractor_id(*)
      )
    `)
    .eq('id', id)
    .single()
  return { data, error }
}

export const createTender = async (tenderData: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('tenders')
    .insert({
      ...tenderData,
      client_id: user.id
    })
    .select()
    .single()
  return { data, error }
}

export const getUserTenders = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('tenders')
    .select(`
      *,
      applications(
        *,
        profiles:contractor_id(*)
      )
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Company functions
export const getCompanies = async (filters?: {
  search?: string
  region_id?: number
  specialization?: string
}) => {
  let query = supabase
    .from('companies')
    .select(`
      *,
      regions (
        id,
        name
      )
    `)
    .order('name')

  // Применяем фильтры
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  
  if (filters?.region_id) {
    query = query.eq('region_id', filters.region_id)
  }

  if (filters?.specialization) {
    query = query.ilike('description', `%${filters.specialization}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export const getCompany = async (id: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      regions (
        id,
        name
      )
    `)
    .eq('id', id)
    .single()
  return { data, error }
}

export const getRegions = async () => {
  const { data, error } = await supabase
    .from('regions')
    .select('id, name')
    .order('name')
  return { data, error }
}

export const createCompany = async (companyData: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      ...companyData,
      owner_id: user.id
    })
    .select()
    .single()
  return { data, error }
}

// Product functions
export const getProducts = async (filters?: {
  category?: string
  price_min?: number
  price_max?: number
}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.price_min) {
    query = query.gte('price', filters.price_min)
  }
  if (filters?.price_max) {
    query = query.lte('price', filters.price_max)
  }

  const { data, error } = await query
  return { data, error }
}

export const getCompanyProducts = async (companyId: string, filters?: {
  category?: string
  price_min?: number
  price_max?: number
}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id(*),
      companies:company_id(*)
    `)
    .eq('company_id', companyId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.price_min) {
    query = query.gte('price', filters.price_min)
  }
  if (filters?.price_max) {
    query = query.lte('price', filters.price_max)
  }

  const { data, error } = await query
  return { data, error }
}

export const getUserProducts = async (filters?: {
  category?: string
  status?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  let query = supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  return { data, error }
}

export const updateProduct = async (productId: string, updates: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .eq('seller_id', user.id) // Дополнительная проверка безопасности
    .select()
    .single()

  return { data, error }
}

export const deleteProduct = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('seller_id', user.id) // Дополнительная проверка безопасности

  return { error }
}

export const getProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id(*),
      companies:company_id(*)
    `)
    .eq('id', id)
    .single()
  return { data, error }
}

// Получение последних товаров для карусели
export const getLatestProducts = async (limit: number = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id(*),
      companies:company_id(*)
    `)
    .eq('status', 'active')
    .gt('stock_quantity', 0)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const getLatestTenders = async (limit: number = 4) => {
  const { data, error } = await supabase
    .from('tenders')
    .select(`
      *,
      profiles:client_id(*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const getLatestProjects = async (limit: number = 4) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('status', ['planning', 'active'])
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const getLatestCompanies = async (limit: number = 3) => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      regions (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const createProduct = async (productData: Record<string, unknown>) => {
  console.log('🚀 createProduct вызвана с данными:', productData)
  
  try {
    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Пользователь:', user ? user.id : 'не авторизован')
    
    if (authError) {
      console.error('❌ Ошибка авторизации:', authError)
      return { data: null, error: authError }
    }
    
    if (!user) {
      const noUserError = new Error('Пользователь не авторизован')
      console.error('❌ Пользователь не найден')
      return { data: null, error: noUserError }
    }
    
    // Получаем компанию пользователя
    console.log('🏢 Ищем компанию пользователя...')
    let company = null
    
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id, name, type')
      .eq('owner_id', user.id)
      .or('type.eq.supplier,type.eq.both')
      .maybeSingle()
    
    console.log('🏢 Результат поиска компании:', { companyData, companyError })
    
    if (companyError) {
      console.error('❌ Ошибка при поиске компании:', companyError)
      // Не останавливаем процесс, продолжаем без компании
    } else {
      company = companyData
    }
    
    // Подготавливаем данные для вставки
    const insertData = {
      ...productData,
      seller_id: user.id,
      company_id: company?.id || null
      // created_at и updated_at должны создаваться автоматически
    }
    
    console.log('📦 Вставляем товар с данными:', insertData)
    
    // Создаем товар
    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single()
    
    console.log('✅ Результат создания товара:', { data, error })
    
    if (error) {
      console.error('❌ Ошибка при создании товара:', error)
    }
    
    return { data, error }
    
  } catch (err) {
    console.error('💥 Неожиданная ошибка в createProduct:', err)
    return { data: null, error: err as Error }
  }
}

// Project functions
export const getProjects = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_materials (
        id,
        quantity,
        status,
        products (
          id,
          name,
          price,
          category
        )
      ),
      project_companies (
        id,
        role,
        status,
        companies (
          id,
          name,
          type,
          location
        )
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getProject = async (id: string) => {
  console.log('=== ФУНКЦИЯ getProject ===')
  console.log('Ищем проект с ID:', id)
  
  // Сначала попробуем простой запрос без JOIN-ов
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
    
  console.log('Результат поиска проекта:')
  console.log('data:', data)
  console.log('error:', error)
    
  return { data, error }
}

export const createProject = async (projectData: Record<string, unknown>) => {
  console.log('=== ФУНКЦИЯ createProject ===')
  console.log('Входящие данные:', projectData)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Пользователь не авторизован')
    return { data: null, error: new Error('Пользователь не авторизован') }
  }
  
  console.log('Пользователь авторизован:', user.id)
  
  const dataToInsert = {
    ...projectData,
    owner_id: user.id
  }
  
  console.log('Данные для вставки в БД:', dataToInsert)

  const { data, error } = await supabase
    .from('projects')
    .insert(dataToInsert)
    .select()
    .single()
    
  console.log('Результат вставки в БД:')
  console.log('data:', data)
  console.log('error:', error)
    
  return { data, error }
}

export const addProjectMaterial = async (projectId: string, materialData: {
  product_id?: string
  name: string
  category: string
  quantity: number
  estimated_price?: number
}) => {
  const { data, error } = await supabase
    .from('project_materials')
    .insert({
      project_id: projectId,
      ...materialData,
      status: 'planned'
    })
    .select()
    .single()
  return { data, error }
}

export const addProjectCompany = async (projectId: string, companyData: {
  company_id?: string
  role: string
  budget_min?: number
  budget_max?: number
}) => {
  const { data, error } = await supabase
    .from('project_companies')
    .insert({
      project_id: projectId,
      ...companyData,
      status: 'searching'
    })
    .select()
    .single()
  return { data, error }
}

// Message functions
export const getMessages = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(*),
      receiver:receiver_id(*)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const sendMessage = async (messageData: {
  receiver_id: string
  content: string
  tender_id?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      ...messageData,
      sender_id: user.id
    })
    .select()
    .single()
  return { data, error }
}

export const markMessageAsRead = async (messageId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)
    .select()
    .single()
  return { data, error }
}

// Application functions
export const applyToTender = async (tenderId: string, proposal: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      tender_id: tenderId,
      contractor_id: user.id,
      proposal,
      status: 'pending'
    })
    .select()
    .single()
  return { data, error }
}

export const getUserApplications = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    // Простой запрос без JOIN до создания всех связей
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('contractor_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error && error.code === 'PGRST116') {
      // Таблица не существует
      console.log('Applications table does not exist')
      return { data: [], error: null }
    }
    
    return { data, error }
  } catch (error) {
    console.error('Applications table might not exist:', error)
    return { data: [], error: null }
  }
}

// Обновление тендера
export const updateTender = async (id: string, tenderData: any) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('tenders')
    .update({
      title: tenderData.title,
      description: tenderData.description,
      category: tenderData.category,
      location: tenderData.location,
      budget_min: tenderData.budget_min,
      budget_max: tenderData.budget_max,
      deadline: tenderData.deadline,
      requirements: tenderData.requirements,
      status: tenderData.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('client_id', user.id) // Убеждаемся, что только владелец может обновить
    .select()
    .single()

  return { data, error }
}

// Удаление тендера
export const deleteTender = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { error } = await supabase
    .from('tenders')
    .delete()
    .eq('id', id)
    .eq('client_id', user.id) // Убеждаемся, что только владелец может удалить

  return { error }
}

// Обновление статуса заявки
export const updateApplicationStatus = async (applicationId: string, status: 'pending' | 'accepted' | 'rejected') => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    // Сначала получаем заявку
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (appError) return { data: null, error: appError }

    // Получаем тендер отдельно
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('client_id')
      .eq('id', application.tender_id)
      .single()

    if (tenderError || !tender || tender.client_id !== user.id) {
      return { data: null, error: new Error('Нет прав для изменения статуса этой заявки') }
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error updating application status:', error)
    return { data: null, error: error as Error }
  }
}

// Cart functions
export const addToCart = async (productId: string, quantity: number = 1) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  // Проверяем, есть ли товар уже в корзине
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  let result
  if (existingItem) {
    // Обновляем количество
    result = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single()
  } else {
    // Добавляем новый товар
    result = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity
      })
      .select()
      .single()
  }
  
  // Отправляем событие обновления корзины
  if (!result.error && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
  
  return result
}

export const getCartItems = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products:product_id(
        id, name, price, discount_price, images, stock_quantity, status,
        companies:company_id(name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  return { data, error }
}

export const updateCartQuantity = async (cartItemId: string, quantity: number) => {
  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  const result = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select()
    .single()
  
  // Отправляем событие обновления корзины
  if (!result.error && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
  
  return result
}

export const removeFromCart = async (cartItemId: string) => {
  const result = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
  
  // Отправляем событие обновления корзины
  if (!result.error && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
  
  return result
}

export const clearCart = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: new Error('Пользователь не авторизован') }
  }

  const result = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
  
  // Отправляем событие обновления корзины
  if (!result.error && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
  
  return result
}

// Product reviews functions
export const addProductReview = async (productId: string, rating: number, comment?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment
    })
    .select()
    .single()
  return { data, error }
}

export const getProductReviews = async (productId: string) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .select(`
      *,
      profiles:user_id(full_name, company_name)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateProductReview = async (reviewId: string, rating: number, comment?: string) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .update({ rating, comment })
    .eq('id', reviewId)
    .select()
    .single()
  return { data, error }
}

// Favorites functions
export const addToFavorites = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .insert({
      user_id: user.id,
      product_id: productId
    })
    .select()
    .single()
  return { data, error }
}

export const removeFromFavorites = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: new Error('Пользователь не авторизован') }
  }

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)
  return { error }
}

export const getUserFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      *,
      products:product_id(
        id, name, price, discount_price, images, 
        companies:company_id(name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Order functions
export const createOrder = async (orderData: {
  items: Array<{ product_id: string; quantity: number; price: number }>
  shipping_address: string
  shipping_method?: string
  payment_method?: string
  company_id?: string
  notes?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  // Рассчитываем общую сумму
  const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Создаем заказ
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: user.id,
      seller_id: orderData.items[0] ? await getProductSeller(orderData.items[0].product_id) : null,
      total_amount: totalAmount,
      shipping_address: orderData.shipping_address,
      shipping_method: orderData.shipping_method,
      payment_method: orderData.payment_method,
      company_id: orderData.company_id,
      notes: orderData.notes,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) {
    return { data: null, error: orderError }
  }

  // Добавляем товары в заказ
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    return { data: null, error: itemsError }
  }

  return { data: order, error: null }
}

const getProductSeller = async (productId: string) => {
  const { data } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single()
  return data?.seller_id
}

export const getUserOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        products:product_id(name, images)
      )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Получение заказов для поставщика
export const getSupplierOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      buyer_info,
      items
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Получение статистики корзины для поставщика
export const getSupplierCartStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  // Получаем товары пользователя
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('seller_id', user.id)

  if (!products || products.length === 0) {
    return { data: { total_in_carts: 0, unique_users: 0, items: [] }, error: null }
  }

  const productIds = products.map(p => p.id)

  // Получаем статистику корзин
  const { data: cartStats, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products:product_id(id, name, price),
      profiles:user_id(name_first, name_last, email)
    `)
    .in('product_id', productIds)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }

  // Группируем статистику
  const totalInCarts = cartStats?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const uniqueUsers = new Set(cartStats?.map(item => item.user_id)).size || 0

  return { 
    data: { 
      total_in_carts: totalInCarts, 
      unique_users: uniqueUsers, 
      items: cartStats || [] 
    }, 
    error: null 
  }
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()
  return { data, error }
}

// Product offer functions for projects
export const createProductOffer = async (offerData: {
  product_id: string
  project_id: string
  offered_to: string
  quantity: number
  offered_price?: number
  message?: string
  expires_at?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('product_project_offers')
    .insert({
      ...offerData,
      offered_by: user.id
    })
    .select()
    .single()
  return { data, error }
}

export const getProjectOffers = async (projectId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('product_project_offers')
    .select(`
      *,
      products:product_id(name, price, images),
      offered_by_profile:offered_by(full_name, company_name),
      companies:products(company_id(name))
    `)
    .eq('project_id', projectId)
    .eq('offered_to', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateOfferStatus = async (offerId: string, status: 'accepted' | 'rejected' | 'withdrawn') => {
  const { data, error } = await supabase
    .from('product_project_offers')
    .update({ status })
    .eq('id', offerId)
    .select()
    .single()
  return { data, error }
}

// Получение заявок для конкретного тендера
export const getTenderApplications = async (tenderId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  // Проверяем, что пользователь является владельцем тендера
  const { data: tender, error: tenderError } = await supabase
    .from('tenders')
    .select('client_id')
    .eq('id', tenderId)
    .single()

  if (tenderError) return { data: null, error: tenderError }
  if (tender.client_id !== user.id) {
    return { data: null, error: new Error('Нет прав для просмотра заявок этого тендера') }
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      profiles:contractor_id(*)
    `)
    .eq('tender_id', tenderId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Extended Company Functions
export const updateCompany = async (companyId: string, updates: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  // Убираем updated_at из обновлений, если оно есть (может вызывать ошибки)
  const { updated_at, ...cleanUpdates } = updates as any

  try {
    // Сначала пробуем прямой запрос с таймаутом
    const directQuery = supabase
      .from('companies')
      .update(cleanUpdates)
      .eq('id', companyId)
      .eq('owner_id', user.id)
      .select()
      .single()

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    try {
      const { data, error } = await Promise.race([directQuery, timeoutPromise]) as any
      
      if (error) {
        throw error
      }
      
      console.log('✅ Direct company update successful')
      return { data, error: null }
    } catch (directError) {
      console.log('⚠️ Direct company update failed, trying API route:', directError)
      
      // Fallback к API роуту
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        return { data: null, error: new Error('No session token') }
      }

      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanUpdates),
      })

      if (!response.ok) {
        console.error('API company update failed:', response.status)
        const errorData = await response.json()
        return { data: null, error: new Error(errorData.error || 'API request failed') }
      }

      const result = await response.json()
      console.log('✅ API company update successful:', result.data)
      return { data: result.data, error: null }
    }
  } catch (error) {
    console.error('Error updating company:', error)
    return { data: null, error: error as Error }
  }
}

// Company Portfolio Functions
export const addPortfolioItem = async (portfolioData: {
  company_id: string
  title: string
  description?: string
  category?: string
  client_name?: string
  project_value?: number
  start_date?: string
  end_date?: string
  location?: string
  images?: string[]
  tags?: string[]
  project_url?: string
  status?: string
  featured?: boolean
  tender_id?: string
  project_id?: string
}) => {
  const { data, error } = await supabase
    .from('company_portfolio')
    .insert([portfolioData])
    .select()
    .single()
  return { data, error }
}

export const getCompanyPortfolio = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_portfolio')
    .select('*')
    .eq('company_id', companyId)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updatePortfolioItem = async (portfolioId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('company_portfolio')
    .update(updates)
    .eq('id', portfolioId)
    .select()
    .single()
  return { data, error }
}

export const deletePortfolioItem = async (portfolioId: string) => {
  const { data, error } = await supabase
    .from('company_portfolio')
    .delete()
    .eq('id', portfolioId)
  return { data, error }
}

// Company Reviews Functions
export const addCompanyReview = async (reviewData: {
  company_id: string
  rating: number
  title?: string
  review_text?: string
  pros?: string
  cons?: string
  work_quality_rating?: number
  communication_rating?: number
  deadline_rating?: number
  price_rating?: number
  project_id?: string
  tender_id?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('company_reviews')
    .insert([
      {
        ...reviewData,
        reviewer_id: user.id
      }
    ])
    .select(`
      *,
      profiles!reviewer_id (
        full_name,
        avatar_url
      )
    `)
    .single()
  return { data, error }
}

export const getCompanyReviews = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_reviews')
    .select(`
      *,
      profiles!reviewer_id (
        full_name,
        avatar_url
      ),
      projects (
        name
      ),
      tenders (
        title
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const likeReview = async (reviewId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('review_likes')
    .insert([
      {
        review_id: reviewId,
        user_id: user.id
      }
    ])
    .select()
    .single()
  return { data, error }
}

export const unlikeReview = async (reviewId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('review_likes')
    .delete()
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
  return { data, error }
}

// Company Team Functions
export const addTeamMember = async (teamData: {
  company_id: string
  user_id?: string
  name: string
  position?: string
  bio?: string
  avatar_url?: string
  linkedin_url?: string
  email?: string
  phone?: string
  is_key_person?: boolean
  display_order?: number
  joined_date?: string
}) => {
  const { data, error } = await supabase
    .from('company_team')
    .insert([teamData])
    .select()
    .single()
  return { data, error }
}

export const getCompanyTeam = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_team')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('is_key_person', { ascending: false })
    .order('display_order', { ascending: true })
  return { data, error }
}

export const updateTeamMember = async (teamId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('company_team')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single()
  return { data, error }
}

export const removeTeamMember = async (teamId: string) => {
  const { data, error } = await supabase
    .from('company_team')
    .update({ is_active: false })
    .eq('id', teamId)
  return { data, error }
}

export const leaveTeam = async (companyId: string, userId: string) => {
  const { data, error } = await supabase
    .from('company_team')
    .update({ is_active: false })
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .eq('is_active', true)
  return { data, error }
}

export const getUserCompanies = async (userId: string) => {
  const { data, error } = await supabase
    .from('company_team')
    .select(`
      *,
      companies (
        id,
        name,
        logo_url,
        type,
        location,
        regions (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('joined_date', { ascending: false })
  return { data, error }
}

// Company Achievements Functions
export const addCompanyAchievement = async (achievementData: {
  company_id: string
  title: string
  description?: string
  category: string
  issuer?: string
  date_received?: string
  expiry_date?: string
  certificate_url?: string
  image_url?: string
  is_featured?: boolean
}) => {
  const { data, error } = await supabase
    .from('company_achievements')
    .insert([achievementData])
    .select()
    .single()
  return { data, error }
}

export const getCompanyAchievements = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_achievements')
    .select('*')
    .eq('company_id', companyId)
    .order('is_featured', { ascending: false })
    .order('date_received', { ascending: false })
  return { data, error }
}

// Company Followers Functions
export const followCompany = async (companyId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    // Сначала пробуем прямой запрос с таймаутом
    const directQuery = supabase
      .from('company_followers')
      .insert({
        company_id: companyId,
        user_id: user.id,
        followed_at: new Date().toISOString()
      })
      .select()
      .single()

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    try {
      const { data, error } = await Promise.race([directQuery, timeoutPromise]) as any
      
      if (error) {
        throw error
      }
      
      console.log('✅ Direct follow successful')
      return { data, error: null }
    } catch (directError) {
      console.log('⚠️ Direct follow failed, trying API route:', directError)
      
      // Fallback к API роуту
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        return { data: null, error: new Error('No session token') }
      }

      const response = await fetch('/api/company-followers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId }),
      })

      if (!response.ok) {
        console.error('API follow failed:', response.status)
        return { data: null, error: new Error('API request failed') }
      }

      const result = await response.json()
      console.log('✅ API follow successful:', result.data)
      return { data: result.data, error: null }
    }
  } catch (error) {
    console.error('Error following company:', error)
    return { data: null, error: error as Error }
  }
}

export const unfollowCompany = async (companyId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    // Сначала пробуем прямой запрос с таймаутом
    const directQuery = supabase
      .from('company_followers')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', user.id)

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    try {
      const { error } = await Promise.race([directQuery, timeoutPromise]) as any
      
      if (error) {
        throw error
      }
      
      console.log('✅ Direct unfollow successful')
      return { data: null, error: null }
    } catch (directError) {
      console.log('⚠️ Direct unfollow failed, trying API route:', directError)
      
      // Fallback к API роуту
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        return { data: null, error: new Error('No session token') }
      }

      const response = await fetch(`/api/company-followers?company_id=${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('API unfollow failed:', response.status)
        return { data: null, error: new Error('API request failed') }
      }

      console.log('✅ API unfollow successful')
      return { data: null, error: null }
    }
  } catch (error) {
    console.error('Error unfollowing company:', error)
    return { data: null, error: error as Error }
  }
}

export const getCompanyFollowers = async (companyId: string) => {
  // Временно отключено - таблица company_followers не существует
  return { data: [], error: null }
}

export const isFollowingCompany = async (companyId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: false, error: null }
  }

  try {
    // Сначала пробуем прямой запрос с таймаутом
    const directQuery = supabase
      .from('company_followers')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single()

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    try {
      const { data, error } = await Promise.race([directQuery, timeoutPromise]) as any
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      console.log('✅ Direct follow check successful')
      return { data: !!data, error: null }
    } catch (directError) {
      console.log('⚠️ Direct follow check failed, trying API route:', directError)
      
      // Fallback к API роуту
      const session = await supabase.auth.getSession()
      if (!session.data.session?.access_token) {
        return { data: false, error: new Error('No session token') }
      }

      const response = await fetch(`/api/company-followers?company_id=${companyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('API follow check failed:', response.status)
        return { data: false, error: new Error('API request failed') }
      }

      const result = await response.json()
      console.log('✅ API follow check successful:', result.isFollowing)
      return { data: result.isFollowing, error: null }
    }
  } catch (error) {
    console.error('Error in isFollowingCompany:', error)
    return { data: false, error: error as Error }
  }
}

// Company Updates Functions
export const addCompanyUpdate = async (updateData: {
  company_id: string
  title: string
  content: string
  images?: string[]
  update_type?: string
  tags?: string[]
  is_pinned?: boolean
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('company_updates')
    .insert([
      {
        ...updateData,
        author_id: user.id
      }
    ])
    .select(`
      *,
      profiles!author_id (
        full_name,
        avatar_url
      )
    `)
    .single()
  return { data, error }
}

export const getCompanyUpdates = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_updates')
    .select(`
      *,
      profiles!author_id (
        full_name,
        avatar_url
      )
    `)
    .eq('company_id', companyId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  return { data, error }
}

export const likeCompanyUpdate = async (updateId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('company_update_likes')
    .insert([
      {
        update_id: updateId,
        user_id: user.id
      }
    ])
    .select()
    .single()
  return { data, error }
}

export const unlikeCompanyUpdate = async (updateId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('company_update_likes')
    .delete()
    .eq('update_id', updateId)
    .eq('user_id', user.id)
  return { data, error }
}

export const addUpdateComment = async (commentData: {
  update_id: string
  content: string
  parent_id?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('company_update_comments')
    .insert([
      {
        ...commentData,
        user_id: user.id
      }
    ])
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .single()
  return { data, error }
}

export const getUpdateComments = async (updateId: string) => {
  const { data, error } = await supabase
    .from('company_update_comments')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('update_id', updateId)
    .order('created_at', { ascending: true })
  return { data, error }
}

// Global Search Functions
export const globalSearch = async (query: string, filters?: {
  type?: 'all' | 'tenders' | 'products' | 'companies'
  limit?: number
  offset?: number
}) => {

  const searchQuery = query.trim()
  if (!searchQuery) {
    return { data: { tenders: [], products: [], companies: [] }, error: null }
  }

  const { type = 'all', limit = 20, offset = 0 } = filters || {}

  try {
    const results = { tenders: [] as any[], products: [] as any[], companies: [] as any[] }

    // Расширенный поиск по тендерам и проектам
    if (type === 'all' || type === 'tenders') {
      try {
        // Поиск по тендерам
        const { data: tenders, error: tendersError } = await supabase
          .from('tenders')
          .select(`
            id,
            title,
            description,
            status,
            budget_min,
            budget_max,
            deadline,
            location,
            category,
            created_at
          `)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        // Поиск по проектам
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            description,
            status,
            budget,
            deadline,
            location,
            category,
            created_at
          `)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
          .in('status', ['planning', 'active'])
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        // Объединяем результаты тендеров и проектов
        const allTenders = []
        if (!tendersError && tenders) {
          allTenders.push(...tenders)
        }
        if (!projectsError && projects && Array.isArray(projects)) {
          // Добавляем метку для различения проектов от тендеров
          const projectsWithType = projects.map((project: any) => ({
            ...project,
            title: project.name, // маппим name в title для единообразия
            type: 'project',
            budget_min: project.budget || 0,
            budget_max: project.budget || 0
          }))
          allTenders.push(...projectsWithType)
        }

        results.tenders = allTenders

        if (tendersError) {
          console.error('Tenders search error:', tendersError)
        }
        if (projectsError) {
          console.error('Projects search error:', projectsError)
        }
      } catch (error) {
        console.error('Tenders/Projects search error:', error)
        results.tenders = []
      }
    }

    // Расширенный поиск по товарам
    if (type === 'all' || type === 'products') {
      try {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            category,
            unit,
            images,
            specifications,
            stock_quantity,
            status,
            created_at
          `)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .eq('status', 'active')
          .gt('stock_quantity', 0)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (!productsError) {
          results.products = products || []
          console.log('Products found:', products?.length || 0)
        } else {
          console.error('Products search error:', productsError)
          results.products = []
        }
      } catch (error) {
        console.error('Products search error:', error)
        results.products = []
      }
    }

    // Расширенный поиск по компаниям
    if (type === 'all' || type === 'companies') {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            description,
            type,
            website,
            logo_url,
            address,
            location,
            phone,
            email,
            created_at
          `)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (!companiesError) {
          results.companies = companies || []
        } else {
          console.error('Companies search error:', companiesError)
          results.companies = []
        }
      } catch (error) {
        console.error('Companies search error:', error)
        results.companies = []
      }
    }

    // Сортируем результаты по релевантности
    const sortByRelevance = (items: any[], searchTerm: string) => {
      return items.sort((a, b) => {
        const getRelevanceScore = (item: any) => {
          let score = 0
          const term = searchTerm.toLowerCase()
          
          // Проверяем точное совпадение в названии (высший приоритет)
          if (item.name?.toLowerCase() === term || item.title?.toLowerCase() === term) {
            score += 100
          }
          
          // Проверяем начало названия
          if (item.name?.toLowerCase().startsWith(term) || item.title?.toLowerCase().startsWith(term)) {
            score += 50
          }
          
          // Проверяем вхождение в название
          if (item.name?.toLowerCase().includes(term) || item.title?.toLowerCase().includes(term)) {
            score += 25
          }
          
          // Проверяем категорию/отрасль
          if (item.category?.toLowerCase().includes(term) || item.industry?.toLowerCase().includes(term)) {
            score += 15
          }
          
          // Проверяем описание
          if (item.description?.toLowerCase().includes(term)) {
            score += 10
          }
          
          // Бонус за рейтинг (для компаний)
          if (item.rating) {
            score += item.rating * 2
          }
          
          // Бонус за верификацию
          if (item.verified) {
            score += 5
          }
          
          return score
        }
        
        return getRelevanceScore(b) - getRelevanceScore(a)
      })
    }

    // Применяем сортировку по релевантности
    results.tenders = sortByRelevance(results.tenders, searchQuery)
    results.products = sortByRelevance(results.products, searchQuery)
    results.companies = sortByRelevance(results.companies, searchQuery)

    return { data: results, error: null }
  } catch (error) {
    console.error('Global search error:', error)
    return { data: null, error }
  }
}

export const getSearchSuggestions = async (query: string) => {
  const searchQuery = query.trim()
  if (!searchQuery || searchQuery.length < 2) {
    return { data: [], error: null }
  }

  try {
    const suggestions: string[] = []

    // Простые предложения на основе популярных строительных терминов
    const buildingTerms = [
      'строительство', 'ремонт', 'отделка', 'проектирование', 'архитектура',
      'кирпич', 'бетон', 'арматура', 'утеплитель', 'кровля', 'фундамент',
      'электрика', 'сантехника', 'отопление', 'вентиляция', 'кондиционирование',
      'дизайн интерьера', 'ландшафтный дизайн', 'благоустройство',
      'строительные материалы', 'металлоконструкции', 'отделочные работы',
      'строительство домов', 'ремонт квартир', 'коммерческое строительство'
    ]
    
    // Фильтруем термины, которые содержат поисковый запрос
    const matchingTerms = buildingTerms.filter(term => 
      term.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    suggestions.push(...matchingTerms.slice(0, 8))
    
    // Если нет точных совпадений, добавляем похожие термины
    if (suggestions.length < 5) {
      const similarTerms = buildingTerms.filter(term => {
        const words = searchQuery.toLowerCase().split(' ')
        return words.some(word => word.length > 2 && term.toLowerCase().includes(word))
      })
      
      suggestions.push(...similarTerms.slice(0, 5 - suggestions.length))
    }
    
    // Убираем дубликаты и ограничиваем количество
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8)
    
    return { data: uniqueSuggestions, error: null }
  } catch (error) {
    console.error('Search suggestions error:', error)
    return { data: [], error }
  }
}

export const getPopularSearches = async () => {

  try {
    // Для демонстрации возвращаем популярные категории и запросы
    const popularSearches = [
      'Строительные материалы',
      'Бетон',
      'Кирпич',
      'Металлоконструкции',
      'Отделочные работы',
      'Проектирование',
      'Ремонт квартир',
      'Строительство домов'
    ]

    return { data: popularSearches, error: null }
  } catch (error) {
    console.error('Popular searches error:', error)
    return { data: [], error }
  }
}

export const saveSearchHistory = async (query: string, resultType: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  try {
    await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        query,
        result_type: resultType,
        searched_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Save search history error:', error)
  }
}

export const getSearchHistory = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: new Error('Пользователь не авторизован') }
  }

  try {
    const { data } = await supabase
      .from('search_history')
      .select('query, result_type, searched_at')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(10)

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Get search history error:', error)
    return { data: [], error }
  }
}

export const checkProjectsTableStructure = async () => {
  console.log('=== ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦЫ PROJECTS ===')
  
  // Попробуем создать тестовый проект с минимальными данными
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Пользователь не авторизован')
    return
  }
  
  const testData = {
    name: 'Тестовый проект',
    description: 'Тест',
    category: 'Тест',
    location: 'Тест',
    status: 'planning',
    owner_id: user.id
  }
  
  console.log('Пробуем создать тестовый проект с минимальными данными:', testData)
  
  const { data, error } = await supabase
    .from('projects')
    .insert(testData)
    .select()
    .single()
    
  console.log('Результат создания тестового проекта:')
  console.log('data:', data)
  console.log('error:', error)
  
  if (error) {
    console.error('Ошибка при создании тестового проекта:', error)
    
    // Если ошибка связана с отсутствующими полями, попробуем еще более простой вариант
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('Пробуем создать проект только с обязательными полями...')
      
      const minimalData = {
        name: 'Минимальный тест',
        description: 'Тест',
        owner_id: user.id
      }
      
      const { data: data2, error: error2 } = await supabase
        .from('projects')
        .insert(minimalData)
        .select()
        .single()
        
      console.log('Результат создания минимального проекта:')
      console.log('data:', data2)
      console.log('error:', error2)
    }
  } else {
    console.log('✅ Тестовый проект создан успешно!')
    
    // Удаляем тестовый проект
    if (data?.id) {
      await supabase.from('projects').delete().eq('id', data.id)
      console.log('Тестовый проект удален')
    }
  }
}

export const getAllProjects = async () => {
  console.log('=== ФУНКЦИЯ getAllProjects ===')
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      budget,
      location,
      owner_id,
      created_at,
      profiles!projects_owner_id_fkey(
        email,
        first_name,
        last_name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    
  console.log('Все проекты в базе данных:')
  console.log('data:', data)
  console.log('error:', error)
  console.log('Количество проектов:', data?.length || 0)
  
  if (error) {
    console.error('Ошибка при получении проектов:', error)
    return { data: [], error }
  }
  
  // Нормализуем данные для соответствия интерфейсу Project
  const normalizedData = data?.map(project => ({
    id: project.id,
    title: project.name, // Преобразуем name в title
    description: project.description || '',
    budget: project.budget || 0,
    location: project.location || '',
    owner_name: project.profiles && project.profiles.length > 0 ? `${project.profiles[0].first_name || ''} ${project.profiles[0].last_name || ''}`.trim() : '',
    owner_email: project.profiles && project.profiles.length > 0 ? project.profiles[0].email || '' : ''
  })) || []
    
  return { data: normalizedData, error }
}

// Partnerships Functions
export const getFollowedCompanies = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('company_followers')
      .select(`
        company_id,
        followed_at,
        companies!inner(
          id,
          name,
          description,
          industry,
          type,
          location,
          email,
          website,
          logo_url,
          owner_id
        )
      `)
      .eq('user_id', userId)
      .order('followed_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching followed companies:', error)
      return { data: [], error }
    }
    
    // Получаем email владельцев компаний отдельным запросом
    const companies = data || []
    const companiesWithOwnerEmail = await Promise.all(
      companies.map(async (item: any) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', item.companies.owner_id)
          .single()
        
        return {
          ...item.companies,
          owner_email: profileData?.email || null
        }
      })
    )
    
    return { data: companiesWithOwnerEmail, error: null }
  } catch (error) {
    console.error('Error in getFollowedCompanies:', error)
    return { data: [], error: error as Error }
  }
}

export const getUserProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      name,
      description,
      budget,
      budget_min,
      budget_max,
      location,
      status,
      created_at
    `)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    
  // Нормализуем данные - используем title или name как заголовок
  const normalizedData = data?.map(project => ({
    ...project,
    title: project.title || project.name,
    budget: project.budget || project.budget_max || project.budget_min || 0
  }))
    
  return { data: normalizedData, error }
}

// Commercial Proposal Functions
export const getCommercialProposals = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error && error.code === 'PGRST116') {
      // Таблица не существует
      console.log('Commercial proposals table does not exist')
      return { data: [], error: null }
    }

    return { data: data || [], error }
  } catch (error) {
    console.error('Error fetching commercial proposals:', error)
    return { data: [], error: null }
  }
}

export const createCommercialProposal = async (proposalData: {
  title: string
  type: 'created' | 'uploaded'
  proposal_data?: any
  file_name?: string
  file_url?: string
  file_size?: number
  note?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .insert({
        ...proposalData,
        user_id: user.id
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error creating commercial proposal:', error)
    return { data: null, error: error as Error }
  }
}

export const updateCommercialProposal = async (id: string, updates: {
  title?: string
  proposal_data?: any
  note?: string
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error updating commercial proposal:', error)
    return { data: null, error: error as Error }
  }
}

export const deleteCommercialProposal = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: new Error('Пользователь не авторизован') }
  }

  try {
    const { error } = await supabase
      .from('commercial_proposals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    return { error }
  } catch (error) {
    console.error('Error deleting commercial proposal:', error)
    return { error: error as Error }
  }
}

export const uploadCommercialProposalFile = async (file: File) => {
  console.log('🚀 UPLOAD FUNCTION CALLED - NEW VERSION')
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('❌ No user found in getUser()')
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  console.log('✅ User found:', user.id, user.email)

  try {
    // Создаем уникальное имя файла
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `commercial-proposals/${user.id}/${fileName}`

    // Пытаемся загрузить файл напрямую в Supabase Storage
    console.log('🏗️ Trying Supabase Storage upload...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Supabase storage upload error:', uploadError)
      console.log('🔄 Fallback to API route...')
      
      // Если не удалось загрузить в Supabase Storage, используем API роут
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', filePath)

      // Получаем токен аутентификации
      console.log('🔍 Getting auth token...')
      const token = await getAuthToken()
      
      console.log('🔑 Token found:', !!token)
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'none')

      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('✅ Added Authorization header')
      } else {
        console.log('⚠️ No token available for Authorization header')
      }

      console.log('🌐 Making request to /api/upload/direct with headers:', headers)
      const response = await fetch('/api/upload/direct', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response OK:', response.ok)

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла')
      }

      const result = await response.json()
      return { 
        data: { 
          file_url: result.publicUrl, 
          file_name: file.name,
          file_size: file.size 
        }, 
        error: null 
      }
    }

    // Получаем публичный URL для успешно загруженного файла
    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    return { 
      data: { 
        file_url: publicUrl, 
        file_name: file.name,
        file_size: file.size 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Error uploading commercial proposal file:', error)
    
    // Fallback: сохраняем файл как Base64 в localStorage
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      const base64Data = await base64Promise
      const localFileName = `local_${Date.now()}_${file.name}`
      
      // Сохраняем в localStorage с ограничением размера
      if (file.size < 5 * 1024 * 1024) { // Ограничение 5MB для localStorage
        localStorage.setItem(`uploaded_file_${localFileName}`, base64Data)
        
        return { 
          data: { 
            file_url: `local://${localFileName}`, 
            file_name: file.name,
            file_size: file.size 
          }, 
          error: null 
        }
      } else {
        throw new Error('Файл слишком большой для локального сохранения')
      }
    } catch (fallbackError) {
      console.error('Fallback upload failed:', fallbackError)
      return { data: null, error: new Error('Не удалось загрузить файл. Попробуйте файл меньшего размера.') }
    }
  }
}

export const updateCommercialProposalNote = async (id: string, note: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  try {
    const { data, error } = await supabase
      .from('commercial_proposals')
      .update({ 
        note,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error updating proposal note:', error)
    return { data: null, error: error as Error }
  }
}

// Функция для получения токена аутентификации
const getAuthToken = async () => {
  // 1. Попробуем получить токен через Supabase getSession
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    console.log('🔑 Token from Supabase session')
    return session.access_token
  }

  // 2. Попробуем получить токен через getUser (может быть более актуальный)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Попробуем еще раз получить сессию
    const { data: { session: freshSession } } = await supabase.auth.getSession()
    if (freshSession?.access_token) {
      console.log('🔑 Token from fresh Supabase session')
      return freshSession.access_token
    }
  }

  // 3. Если мы в браузере, попробуем localStorage
  if (typeof window !== 'undefined') {
    // Попробуем разные варианты ключей localStorage
    const possibleKeys = [
      'sb-gcbwqqwmqjolxxrvfbzz-auth-token', // из логов
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
      'supabase.auth.token'
    ]
    
    for (const key of possibleKeys) {
      const localStorageData = localStorage.getItem(key)
      if (localStorageData) {
        try {
          const parsedData = JSON.parse(localStorageData)
                     const token = parsedData?.access_token || parsedData?.accessToken
           if (token) {
             console.log('🔑 Token found in localStorage with key:', key)
             return token
           }
         } catch (e) {
           console.log('🔑 Failed to parse localStorage token for key:', key)
         }
       }
     }

     // 4. Проверим все ключи в localStorage, которые содержат 'auth'
     try {
       for (let i = 0; i < localStorage.length; i++) {
         const key = localStorage.key(i)
         if (key && key.includes('auth')) {
           console.log('🔍 Found auth-related key:', key)
           const data = localStorage.getItem(key)
           if (data) {
             try {
               const parsed = JSON.parse(data)
               if (parsed.access_token && typeof parsed.access_token === 'string') {
                 console.log('🔑 Token found in', key)
                 return parsed.access_token
               }
             } catch (e) {
               // Skip invalid JSON
             }
           }
         }
       }
     } catch (e) {
       console.log('🔑 Error scanning localStorage:', e)
     }
   }

   console.log('⚠️ No authentication token found')
   return null
}
