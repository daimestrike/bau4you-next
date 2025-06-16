import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Улучшенная обработка ошибок
    onAuthStateChange: (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        // Очищаем localStorage при выходе
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token')
        }
      }
    }
  }
})

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
    
    const { data, error } = await supabase
      .from('search_suggestions')
      .select('suggestion')
      .ilike('suggestion', `%${query}%`)
      .limit(5)
    
    if (error) throw error
    return { data: data?.map(item => item.suggestion) || [], error: null }
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
    console.error('Error getting current user:', error)
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
    return { data: null, error }
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
      .eq('user_id', user.id)
    
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