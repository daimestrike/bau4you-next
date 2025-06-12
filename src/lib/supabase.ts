import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export const signUp = async (email: string, password: string, userData: Record<string, unknown>) => {
  try {
    // Сначала пытаемся зарегистрировать пользователя
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Метаданные для создания профиля
      }
    })
    
    if (signUpError) {
      return { data: null, error: signUpError }
    }
    
    // Если пользователь создан, создаем профиль вручную (на случай если триггер не сработал)
    if (signUpData.user) {
      const profileData = {
        id: signUpData.user.id,
        email: signUpData.user.email || email,
        name_first: (userData.name_first as string) || (userData.full_name as string)?.split(' ')[0] || '',
        name_last: (userData.name_last as string) || (userData.full_name as string)?.split(' ').slice(1).join(' ') || '',
        company_name: userData.company_name as string || '',
        phone: userData.phone as string || '',
        role: userData.role as string || 'client'
      }
      
      // Пытаемся создать профиль (игнорируем ошибку если уже существует)
      await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
    }
    
    // Если регистрация успешна, сразу входим (обходим подтверждение email)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data: signInData, error: signInError }
  } catch (error) {
    console.error('Ошибка при регистрации:', error)
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
      error: error?.message 
    })
    
    if (error) {
      console.error('Ошибка Supabase signIn:', error)
      return { data: null, error }
    }
    
    if (!data.user) {
      console.error('Пользователь не найден в ответе')
      return { data: null, error: new Error('Пользователь не найден') }
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
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
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
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
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
export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      profiles:owner_id(*)
    `)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getCompany = async (id: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      profiles:owner_id(*)
    `)
    .eq('id', id)
    .single()
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

export const createProduct = async (productData: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  // Получаем компанию пользователя типа supplier
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .eq('type', 'supplier')
    .or('type.eq.both')
    .single()

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      seller_id: user.id,
      company_id: company?.id || null
    })
    .select()
    .single()
  return { data, error }
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
          category,
          profiles:seller_id(*)
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
          location,
          profiles:owner_id(*)
        )
      )
    `)
    .eq('id', id)
    .single()
  return { data, error }
}

export const createProject = async (projectData: Record<string, unknown>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      owner_id: user.id
    })
    .select()
    .single()
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

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      tenders(*)
    `)
    .eq('contractor_id', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
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

  // Сначала проверяем, что пользователь является владельцем тендера
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select(`
      *,
      tenders!inner(client_id)
    `)
    .eq('id', applicationId)
    .single()

  if (appError) return { data: null, error: appError }
  if (application.tenders.client_id !== user.id) {
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

  if (existingItem) {
    // Обновляем количество
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single()
    return { data, error }
  } else {
    // Добавляем новый товар
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity
      })
      .select()
      .single()
    return { data, error }
  }
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

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select()
    .single()
  return { data, error }
}

export const removeFromCart = async (cartItemId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
  return { error }
}

export const clearCart = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: new Error('Пользователь не авторизован') }
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
  return { error }
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

  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .eq('owner_id', user.id)
    .select()
    .single()
  return { data, error }
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

  const { data, error } = await supabase
    .from('company_followers')
    .insert([
      {
        company_id: companyId,
        user_id: user.id
      }
    ])
    .select()
    .single()
  return { data, error }
}

export const unfollowCompany = async (companyId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const { data, error } = await supabase
    .from('company_followers')
    .delete()
    .eq('company_id', companyId)
    .eq('user_id', user.id)
  return { data, error }
}

export const getCompanyFollowers = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_followers')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const isFollowingCompany = async (companyId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: false, error: null }
  }

  const { data, error } = await supabase
    .from('company_followers')
    .select('id')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  return { data: !!data && !error, error }
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: new Error('Пользователь не авторизован') }
  }

  const searchQuery = query.trim()
  if (!searchQuery) {
    return { data: { tenders: [], products: [], companies: [] }, error: null }
  }

  const { type = 'all', limit = 20, offset = 0 } = filters || {}

  try {
    const results = { tenders: [] as any[], products: [] as any[], companies: [] as any[] }

    // Поиск по тендерам
    if (type === 'all' || type === 'tenders') {
      const { data: tenders } = await supabase
        .from('tenders')
        .select(`
          id,
          title,
          description,
          status,
          budget_min,
          budget_max,
          deadline,
          city,
          created_at,
          companies!inner(name, logo_url)
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      results.tenders = tenders || []
    }

    // Поиск по товарам
    if (type === 'all' || type === 'products') {
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          category,
          in_stock,
          created_at,
          companies!inner(name, logo_url)
        `)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      results.products = products || []
    }

    // Поиск по компаниям
    if (type === 'all' || type === 'companies') {
      const { data: companies } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          description,
          industry,
          city,
          logo_url,
          cover_image,
          verified,
          rating,
          reviews_count,
          type,
          created_at
        `)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`)
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1)

      results.companies = companies || []
    }

    return { data: results, error: null }
  } catch (error) {
    console.error('Global search error:', error)
    return { data: null, error }
  }
}

export const getSearchSuggestions = async (query: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: new Error('Пользователь не авторизован') }
  }

  const searchQuery = query.trim()
  if (!searchQuery || searchQuery.length < 2) {
    return { data: [], error: null }
  }

  try {
    const suggestions: string[] = []

    // Получаем популярные запросы из тендеров
    const { data: tenderSuggestions } = await supabase
      .from('tenders')
      .select('title')
      .ilike('title', `%${searchQuery}%`)
      .eq('status', 'published')
      .limit(5)

    // Получаем популярные запросы из товаров
    const { data: productSuggestions } = await supabase
      .from('products')
      .select('name')
      .ilike('name', `%${searchQuery}%`)
      .eq('in_stock', true)
      .limit(5)

    // Получаем популярные запросы из компаний
    const { data: companySuggestions } = await supabase
      .from('companies')
      .select('name')
      .ilike('name', `%${searchQuery}%`)
      .limit(5)

    // Формируем уникальные предложения
    if (tenderSuggestions) {
      tenderSuggestions.forEach(item => {
        if (!suggestions.includes(item.title)) {
          suggestions.push(item.title)
        }
      })
    }

    if (productSuggestions) {
      productSuggestions.forEach(item => {
        if (!suggestions.includes(item.name)) {
          suggestions.push(item.name)
        }
      })
    }

    if (companySuggestions) {
      companySuggestions.forEach(item => {
        if (!suggestions.includes(item.name)) {
          suggestions.push(item.name)
        }
      })
    }

    return { data: suggestions.slice(0, 8), error: null }
  } catch (error) {
    console.error('Search suggestions error:', error)
    return { data: [], error }
  }
}

export const getPopularSearches = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: new Error('Пользователь не авторизован') }
  }

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