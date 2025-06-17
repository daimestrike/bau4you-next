// ПЕРЕХОД НА ПРОКСИ СИСТЕМУ
// Теперь все запросы идут через VPS прокси вместо прямых вызовов Supabase

import { supabaseProxy } from './supabase-proxy'

// Экспортируем прокси клиент как supabase для совместимости
export const supabase = supabaseProxy

// Заглушка для совместимости со старым кодом - больше не нужна
// Все конфигурации теперь обрабатываются в prоxy-клиенте

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
      await supabase.auth.signOut({ scope: 'local' })
      
      console.log('Cleared invalid tokens and signed out')
    }
  } catch (error) {
    console.error('Error clearing tokens:', error)
  }
}

// Функция для проверки и исправления сессии
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
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
    
    const { data, error } = await supabase
      .from('popular_searches')
      .select('query')
      .order('count', { ascending: false })
      .limit(10)
    
    if (error) {
      // Если таблица не существует, возвращаем популярные запросы по умолчанию
      if (error.code === '42P01') {
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
      throw error
    }
    return { data: data?.map(item => item.query) || [], error: null }
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
    const { data: tenders } = await supabase
      .from('tenders')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)
    
    // Поиск в продуктах
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)
    
    // Поиск в компаниях
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)
    
    return {
      data: {
        tenders: tenders || [],
        products: products || [],
        companies: companies || []
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
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest products:', error)
    return { data: [], error }
  }
}

export const getLatestTenders = async (limit = 10) => {
  try {
    await validateSession()
    
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest tenders:', error)
    return { data: [], error }
  }
}

export const getLatestProjects = async (limit = 10) => {
  try {
    await validateSession()
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest projects:', error)
    return { data: [], error }
  }
}

export const getLatestCompanies = async (limit = 10) => {
  try {
    await validateSession()
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching latest companies:', error)
    return { data: [], error }
  }
}

export const createProduct = async (productData) => {
  try {
    await validateSession()
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating product:', error)
    return { data: null, error }
  }
}

// Дополнительные функции для компаний
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    // Не логируем ошибку "Auth session missing" так как это нормальное состояние
    const errorMessage = error?.message || ''
    if (!errorMessage.includes('Auth session missing')) {
      console.error('Error getting current user:', error)
    }
    return { user: null, error }
  }
}

export const isFollowingCompany = async (companyId) => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: false, error: null }
    
    const { data, error } = await supabase
      .from('company_followers')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single()
    
    return { data: !!data, error: null }
  } catch (error) {
    console.error('Error checking follow status:', error)
    return { data: false, error }
  }
}

export const followCompany = async (companyId) => {
  try {
    const { user } = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('company_followers')
      .insert([{ company_id: companyId, user_id: user.id }])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error following company:', error)
    return { data: null, error }
  }
}

export const unfollowCompany = async (companyId) => {
  try {
    const { user } = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('company_followers')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', user.id)
    
    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    console.error('Error unfollowing company:', error)
    return { data: false, error }
  }
}

export const getRegions = async () => {
  try {
    // Возвращаем статический список регионов, если таблица не существует
    const regions = [
      { id: 1, name: 'Москва' },
      { id: 2, name: 'Санкт-Петербург' },
      { id: 3, name: 'Московская область' },
      { id: 4, name: 'Ленинградская область' },
      { id: 5, name: 'Краснодарский край' },
      { id: 6, name: 'Свердловская область' },
      { id: 7, name: 'Новосибирская область' },
      { id: 8, name: 'Татарстан' },
      { id: 9, name: 'Челябинская область' },
      { id: 10, name: 'Нижегородская область' }
    ]
    
    return { data: regions, error: null }
  } catch (error) {
    console.error('Error fetching regions:', error)
    return { data: [], error }
  }
}

// Функции для работы с корзиной и другими данными
export const getCartItems = async () => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: [], error: null }
    
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return { data: [], error }
  }
}

export const signIn = async (email, password) => {
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('[signIn] Proxy response:', response)
    
    if (response.error) {
      throw response.error
    }
    
    // Прокси возвращает данные напрямую, а не в формате {data, error}
    if (response.access_token && response.user) {
      return { 
        data: {
          user: response.user,
          session: {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            user: response.user
          }
        }, 
        error: null 
      }
    } else {
      throw new Error('Не удалось получить данные пользователя')
    }
  } catch (error) {
    console.error('Error signing in:', error)
    return { data: null, error }
  }
}

export const signUp = async (email, password, userData = {}) => {
  try {
    console.log('🔄 Начинаем регистрацию через прокси...')
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    console.log('📊 Результат регистрации:', response)
    
    if (response.error) {
      console.error('❌ Ошибка при регистрации:', response.error)
      return { data: null, error: response.error }
    }
    
    // Проверяем, есть ли токены после регистрации
    if (response.access_token && response.user) {
      console.log('✅ Сессия создана автоматически после регистрации')
      return { 
        data: {
          user: response.user,
          session: {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            user: response.user
          }
        }, 
        error: null 
      }
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
      return { data, error: null }
    }
    
    console.log('✅ Успешный вход после регистрации')
    return { data: signInData, error: null }
  } catch (error) {
    console.error('❌ Исключение при регистрации:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Очищаем localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error }
  }
}

// Дополнительные функции для работы с профилем
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }
}

export const updateProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    console.error('Full error details:', JSON.stringify(error, null, 2))
    return { data: null, error: error.message || error }
  }
}

// Функции для работы с корзиной
export const addToCart = async (productId, quantity = 1) => {
  try {
    const { user } = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    // Проверяем, есть ли уже товар в корзине
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()
    
    if (existingItem) {
      // Обновляем количество
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } else {
      // Добавляем новый товар
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: user.id, product_id: productId, quantity }])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { data: null, error }
  }
}

export const updateCartQuantity = async (cartItemId, quantity) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating cart quantity:', error)
    return { data: null, error }
  }
}

export const removeFromCart = async (cartItemId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error removing from cart:', error)
    return { error }
  }
}

export const clearCart = async () => {
  try {
    const { user } = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return { error }
  }
}

// Функции для работы с избранным
export const addToFavorites = async (productId) => {
  try {
    const { user } = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: user.id, product_id: productId }])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return { data: null, error }
  }
}

export const removeFromFavorites = async (productId) => {
  try {
    const { user } = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return { error }
  }
}

export const getUserFavorites = async () => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: [], error: null }
    
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*, products(*)')
      .eq('user_id', user.id)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching user favorites:', error)
    return { data: [], error }
  }
}

// Функции для работы с продуктами
export const getProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { data: null, error }
  }
}

export const updateProduct = async (productId, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating product:', error)
    return { data: null, error }
  }
}

export const getUserProducts = async () => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: [], error: null }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching user products:', error)
    return { data: [], error }
  }
}

export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { error }
  }
}

// Функция для совместимости
export const deleteProductFromDB = deleteProduct

// Функции для работы с сессией
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { data: session, error: null }
  } catch (error) {
    console.error('Error getting current session:', error)
    return { data: null, error }
  }
}

// Заглушки для остальных функций (возвращают пустые данные или ошибки)
export const createCompany = async (companyData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating company:', error)
    return { data: null, error }
  }
}

export const getCompany = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching company:', error)
    return { data: null, error }
  }
}

export const updateCompany = async (companyId, companyData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', companyId)
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating company:', error)
    return { data: null, error }
  }
}

export const getUserCompanies = async () => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: [], error: null }
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching user companies:', error)
    return { data: [], error }
  }
}

export const getFollowedCompanies = async () => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: [], error: null }
    
    const { data, error } = await supabase
      .from('company_followers')
      .select('*, companies(*)')
      .eq('user_id', user.id)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching followed companies:', error)
    return { data: [], error }
  }
}

// Функции для работы с проектами
export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching all projects:', error)
    return { data: [], error }
  }
}

export const createProject = async (projectData) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating project:', error)
    return { data: null, error }
  }
}

export const checkProjectsTableStructure = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error checking projects table structure:', error)
    return { data: [], error }
  }
}

// Функции для работы с тендерами
export const createTender = async (tenderData) => {
  try {
    const { data, error } = await supabase
      .from('tenders')
      .insert([tenderData])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating tender:', error)
    return { data: null, error }
  }
}

export const applyToTender = async (tenderId, applicationData) => {
  try {
    const { data, error } = await supabase
      .from('tender_applications')
      .insert([{ tender_id: tenderId, ...applicationData }])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error applying to tender:', error)
    return { data: null, error }
  }
}

// Функции для работы с поиском
export const saveSearchHistory = async (query) => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: null, error: null }
    
    const { data, error } = await supabase
      .from('search_history')
      .insert([{ user_id: user.id, query }])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error saving search history:', error)
    return { data: null, error }
  }
}

export const getSearchHistory = async () => {
  try {
    const { user } = await getCurrentUser()
    if (!user) return { data: [], error: null }
    
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching search history:', error)
    return { data: [], error }
  }
}

// Заглушки для остальных функций
export const getCompanyPortfolio = async (companyId) => {
  return { data: [], error: null }
}

export const addPortfolioItem = async (portfolioData) => {
  return { data: null, error: null }
}

export const updatePortfolioItem = async (itemId, portfolioData) => {
  return { data: null, error: null }
}

export const deletePortfolioItem = async (itemId) => {
  return { error: null }
}

export const getCompanyProducts = async (companyId) => {
  return { data: [], error: null }
}

export const getCompanyReviews = async (companyId) => {
  return { data: [], error: null }
}

export const getCompanyTeam = async (companyId) => {
  return { data: [], error: null }
}

export const getCompanyAchievements = async (companyId) => {
  return { data: [], error: null }
}

export const getCompanyUpdates = async (companyId) => {
  return { data: [], error: null }
}

export const addTeamMember = async (memberData) => {
  return { data: null, error: null }
}

export const getSupplierCartStats = async () => {
  return { data: { total_items: 0, total_value: 0 }, error: null }
}

export const getSupplierOrders = async () => {
  return { data: [], error: null }
}

// =================== КОММЕРЧЕСКИЕ ПРЕДЛОЖЕНИЯ ===================

// Получение сохраненных коммерческих предложений пользователя
export const getCommercialProposals = async () => {
  try {
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const { data, error } = await supabase
      .from('commercial_proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching commercial proposals:', error)
    return { data: [], error }
  }
}

// Создание нового коммерческого предложения
export const createCommercialProposal = async (proposalData) => {
  try {
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const newProposal = {
      user_id: user.id,
      title: proposalData.title,
      type: 'created', // 'created' или 'uploaded'
      proposal_data: proposalData.proposalData,
      file_name: proposalData.fileName || null,
      file_url: proposalData.fileUrl || null,
      file_size: proposalData.fileSize || null,
      note: proposalData.note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('commercial_proposals')
      .insert([newProposal])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating commercial proposal:', error)
    return { data: null, error }
  }
}

// Обновление коммерческого предложения
export const updateCommercialProposal = async (proposalId, proposalData) => {
  try {
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const updateData = {
      title: proposalData.title,
      proposal_data: proposalData.proposalData,
      note: proposalData.note || null,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('commercial_proposals')
      .update(updateData)
      .eq('id', proposalId)
      .eq('user_id', user.id) // Проверяем владельца
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating commercial proposal:', error)
    return { data: null, error }
  }
}

// Удаление коммерческого предложения
export const deleteCommercialProposal = async (proposalId) => {
  try {
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    
    const { error } = await supabase
      .from('commercial_proposals')
      .delete()
      .eq('id', proposalId)
      .eq('user_id', user.id) // Проверяем владельца
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting commercial proposal:', error)
    return { error }
  }
}

// Загрузка файла КП в S3 и сохранение в базу
export const uploadCommercialProposalFile = async (file, title, note = null) => {
  try {
    console.log('🔍 Starting file upload:', file.name)
    await validateSession()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')
    console.log('✅ User authenticated:', user.email)
    
    // Получаем токен авторизации
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('Нет токена авторизации')
    }
    console.log('🔑 Access token obtained, length:', session.access_token.length)
    
    // Загружаем файл через API
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)
    formData.append('folder', 'commercial-proposals')
    
    console.log('📤 Sending upload request to local API with Authorization header')
    const uploadResponse = await fetch('/api/upload/direct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    })
    
    console.log('📥 Upload response status:', uploadResponse.status)
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('❌ Upload failed:', errorText)
      throw new Error('Ошибка загрузки файла')
    }
    
    const uploadResult = await uploadResponse.json()
    
    // Сохраняем информацию о файле в базу
    const newProposal = {
      user_id: user.id,
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      type: 'uploaded',
      proposal_data: null,
      file_name: file.name,
      file_url: uploadResult.publicUrl,
      file_size: file.size,
      note: note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('commercial_proposals')
      .insert([newProposal])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error uploading commercial proposal file:', error)
    return { data: null, error }
  }
}

// Обновление заметки к предложению
export const updateCommercialProposalNote = async (proposalId, note) => {
  try {
    console.log('🔍 Updating note for proposal:', proposalId, 'Note:', note)
    
    // Упрощаем - проверяем пользователя напрямую
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('❌ User auth error:', userError)
      throw userError
    }
    if (!user) {
      console.error('❌ No user found')
      throw new Error('Пользователь не авторизован')
    }
    console.log('✅ User authenticated for note update:', user.email)
    
    const updateData = { 
      note: note,
      updated_at: new Date().toISOString()
    }
    console.log('📝 Update data:', updateData)
    
    console.log('🚀 Executing update query...')
    const { data, error } = await supabase
      .from('commercial_proposals')
      .update(updateData)
      .eq('id', proposalId)
      .eq('user_id', user.id) // Проверяем владельца
      .select()
      .single()
    
    console.log('📥 Update result:', { data, error })
    if (error) {
      console.error('❌ Database update error:', error)
      throw error
    }
    console.log('✅ Note updated successfully')
    return { data, error: null }
  } catch (error) {
    console.error('❌ Error updating commercial proposal note:', error)
    return { data: null, error }
  }
}