// Адаптер для совместимости со старым API через прокси
import { supabaseProxy } from './supabase-proxy'

// Экспортируем прокси-клиент как supabase для совместимости
export const supabase = supabaseProxy

// Все существующие функции остаются без изменений,
// но теперь используют прокси-клиент

// Функция для очистки недействительных токенов
export const clearInvalidTokens = async () => {
  try {
    if (typeof window !== 'undefined') {
      // Очищаем все ключи Supabase из localStorage
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      // Принудительно выходим из системы
      await supabase.auth.signOut()
      
      console.log('Cleared invalid tokens and signed out')
    }
  } catch (error) {
    console.error('Error clearing tokens:', error)
  }
}

// Функция для проверки и исправления сессии
export const validateSession = async () => {
  try {
    const { session, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session validation error:', error)
      // Если ошибка связана с refresh token, очищаем токены
      if (error.message?.includes('Invalid Refresh Token') || 
          error.message?.includes('Refresh Token Not Found')) {
        await clearInvalidTokens()
      }
      return { session: null, error }
    }
    
    return { session, error: null }
  } catch (error) {
    console.error('Session validation failed:', error)
    await clearInvalidTokens()
    return { session: null, error }
  }
}

// Функции для работы с данными
export const getSearchSuggestions = async (query) => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('search_suggestions')
      .select('suggestion')
      .ilike('suggestion', `%${query}%`)
      .limit(5)
      .execute()
    
    if (response.error) throw response.error
    return { data: response.data?.map(item => item.suggestion) || [], error: null }
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return { data: [], error }
  }
}

export const getPopularSearches = async () => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('popular_searches')
      .select('query')
      .order('count', { ascending: false })
      .limit(10)
      .execute()
    
    if (response.error) {
      // Если таблица не существует, возвращаем популярные запросы по умолчанию
      if (response.error.code === '42P01') {
        console.log('Table popular_searches does not exist, using default searches')
        return { 
          data: [
            'кирпич',
            'цемент',
            'арматура',
            'плитка',
            'краска',
            'утеплитель',
            'гипсокартон',
            'ламинат'
          ], 
          error: null 
        }
      }
      throw response.error
    }
    return { data: response.data?.map(item => item.query) || [], error: null }
  } catch (error) {
    console.error('Error fetching popular searches:', error)
    // Возвращаем популярные запросы по умолчанию при любой ошибке
    return { 
      data: [
        'кирпич',
        'цемент',
        'арматура',
        'плитка',
        'краска',
        'утеплитель',
        'гипсокартон',
        'ламинат'
      ], 
      error: null 
    }
  }
}

export const globalSearch = async (query, options = {}) => {
  try {
    await validateSession()
    
    const { limit = 10 } = options
    
    // Поиск в тендерах
    const tendersResponse = await supabase
      .from('tenders')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)
      .execute()
    
    // Поиск в продуктах
    const productsResponse = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)
      .execute()
    
    // Поиск в компаниях
    const companiesResponse = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)
      .execute()
    
    return {
      data: {
        tenders: tendersResponse.data || [],
        products: productsResponse.data || [],
        companies: companiesResponse.data || []
      },
      error: null
    }
  } catch (error) {
    console.error('Error performing global search:', error)
    return { data: { tenders: [], products: [], companies: [] }, error }
  }
}

export const getLatestProducts = async (limit = 10) => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .execute()
    
    if (response.error) throw response.error
    return { data: response.data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest products:', error)
    return { data: [], error }
  }
}

export const getLatestTenders = async (limit = 10) => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .execute()
    
    if (response.error) throw response.error
    return { data: response.data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest tenders:', error)
    return { data: [], error }
  }
}

export const getLatestProjects = async (limit = 10) => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .execute()
    
    if (response.error) throw response.error
    return { data: response.data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest projects:', error)
    return { data: [], error }
  }
}

export const getLatestCompanies = async (limit = 10) => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .execute()
    
    if (response.error) throw response.error
    return { data: response.data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest companies:', error)
    return { data: [], error }
  }
}

export const createProduct = async (productData) => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()
    
    if (response.error) throw response.error
    return { data: response.data, error: null }
  } catch (error) {
    console.error('Error creating product:', error)
    return { data: null, error }
  }
}

export const getCurrentUser = async () => {
  try {
    const { user, error } = await supabase.auth.getUser()
    if (error) throw error
    return { data: user, error: null }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { data: null, error }
  }
}

export const isFollowingCompany = async (companyId) => {
  try {
    await validateSession()
    
    const { user } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const response = await supabase
      .from('company_followers')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single()
    
    return { data: !!response.data, error: null }
  } catch (error) {
    return { data: false, error }
  }
}

export const followCompany = async (companyId) => {
  try {
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const response = await supabase
      .from('company_followers')
      .insert({
        company_id: companyId,
        user_id: user.id
      })
    
    if (response.error) throw response.error
    return { data: response.data, error: null }
  } catch (error) {
    console.error('Error following company:', error)
    return { data: null, error }
  }
}

export const unfollowCompany = async (companyId) => {
  try {
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const response = await supabase
      .from('company_followers')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', user.id)
    
    if (response.error) throw response.error
    return { data: response.data, error: null }
  } catch (error) {
    console.error('Error unfollowing company:', error)
    return { data: null, error }
  }
}

export const getRegions = async () => {
  try {
    await validateSession()
    
    const response = await supabase
      .from('regions')
      .select('*')
      .order('name')
      .execute()
    
    if (response.error) {
      if (response.error.code === '42P01') {
        return { 
          data: [
            { id: 1, name: 'Москва' },
            { id: 2, name: 'Санкт-Петербург' },
            { id: 3, name: 'Новосибирск' },
            { id: 4, name: 'Екатеринбург' },
            { id: 5, name: 'Казань' }
          ], 
          error: null 
        }
      }
      throw response.error
    }
    return { data: response.data || [], error: null }
  } catch (error) {
    console.error('Error fetching regions:', error)
    return { 
      data: [
        { id: 1, name: 'Москва' },
        { id: 2, name: 'Санкт-Петербург' },
        { id: 3, name: 'Новосибирск' },
        { id: 4, name: 'Екатеринбург' },
        { id: 5, name: 'Казань' }
      ], 
      error: null 
    }
  }
}

export const getCartItems = async () => {
  try {
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const response = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', user.id)
      .execute()
    
    if (response.error) throw response.error
    return { data: response.data || [], error: null }
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return { data: [], error }
  }
}

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error signing in:', error)
    return { data: null, error }
  }
}

export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error signing up:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    // Очищаем localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
    }
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error }
  }
}

// Остальные функции можно добавить по аналогии...
// Для краткости приведу только основные

export const getCommercialProposals = async () => {
  try {
    console.log('🔍 Loading commercial proposals...')
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    console.log('✅ User authenticated for proposals:', user?.email)
    if (!user) throw new Error('Пользователь не авторизован')
    
    const response = await supabase
      .from('commercial_proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .execute()
    
    console.log('📥 Proposals response:', response)
    if (response.error) throw response.error
    console.log('✅ Proposals loaded successfully:', response.data?.length || 0)
    return { data: response.data || [], error: null }
  } catch (error) {
    console.error('❌ Error loading commercial proposals:', error)
    return { data: [], error }
  }
}

export const createCommercialProposal = async (proposalData) => {
  try {
    console.log('🔍 Creating commercial proposal:', proposalData)
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const dataToInsert = {
      ...proposalData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('📝 Data to insert:', dataToInsert)
    
    const response = await supabase
      .from('commercial_proposals')
      .insert(dataToInsert)
      .select()
      .single()
    
    console.log('📥 Insert response:', response)
    if (response.error) throw response.error
    console.log('✅ Commercial proposal created successfully')
    return { data: response.data, error: null }
  } catch (error) {
    console.error('❌ Error creating commercial proposal:', error)
    return { data: null, error }
  }
}

export const updateCommercialProposalNote = async (proposalId, note) => {
  try {
    console.log('🔍 Updating note for proposal:', proposalId, 'Note:', note)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('Пользователь не авторизован')
    }
    console.log('✅ User authenticated for note update:', user.email)
    
    const updateData = { 
      note: note,
      updated_at: new Date().toISOString()
    }
    console.log('📝 Update data:', updateData)
    
    console.log('🚀 Executing update query...')
    const response = await supabase
      .from('commercial_proposals')
      .update(updateData)
      .eq('id', proposalId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    console.log('📥 Update result:', response)
    if (response.error) throw response.error
    console.log('✅ Note updated successfully')
    return { data: response.data, error: null }
  } catch (error) {
    console.error('❌ Error updating commercial proposal note:', error)
    return { data: null, error }
  }
}

// Функция для загрузки файлов через новый прокси API
export const uploadCommercialProposalFile = async (file, title, note = null) => {
  try {
    console.log('🔍 Starting file upload via proxy:', file.name)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('Пользователь не авторизован')
    }
    console.log('✅ User authenticated:', user.email)
    
    // Получаем токен авторизации для прокси запроса
    const { session } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('Нет токена авторизации')
    }
    console.log('🔑 Access token obtained, length:', session.access_token.length)
    
    // Загружаем файл через новый прокси API
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)
    formData.append('folder', 'commercial-proposals')
    
    console.log('📤 Sending upload request via proxy with Authorization header')
    const uploadResponse = await fetch('http://109.73.195.246/api/upload/direct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    })
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('❌ Upload failed:', uploadResponse.status, errorText)
      throw new Error(`Ошибка загрузки файла: ${uploadResponse.status}`)
    }
    
    const uploadResult = await uploadResponse.json()
    console.log('✅ File uploaded successfully:', uploadResult.fileUrl)
    
    // Создаем запись в базе данных
    const proposalData = {
      title,
      file_url: uploadResult.fileUrl,
      file_name: file.name,
      file_size: file.size,
      note,
      user_id: user.id
    }
    
    console.log('📝 Creating database record:', proposalData)
    const { data, error } = await createCommercialProposal(proposalData)
    
    if (error) {
      console.error('❌ Database record creation failed:', error)
      throw error
    }
    
    console.log('✅ Commercial proposal created successfully with file')
    return { data, error: null }
  } catch (error) {
    console.error('❌ Error uploading commercial proposal file:', error)
    return { data: null, error }
  }
}