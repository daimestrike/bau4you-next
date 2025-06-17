import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('🔍 API Products GET called')
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ Products fetched successfully:', data?.length || 0)
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 API Products POST called')
  
  try {
    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader) {
      console.log('🔑 Authorization header found')
      try {
        const token = authHeader.replace('Bearer ', '')
        
        // Создаем таймаут для getUser
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 10000)
        })
        
        const authPromise = supabase.auth.getUser(token)
        const { data: { user }, error: authError } = await Promise.race([
          authPromise,
          timeoutPromise
        ]) as any
        
        if (authError) {
          console.log('⚠️ Auth error:', authError.message)
        } else if (user) {
          userId = user.id
          console.log('✅ User authenticated:', userId)
        }
      } catch (authError) {
        console.log('⚠️ Auth timeout or error:', authError)
      }
    } else {
      console.log('❌ No authorization header found')
    }
    
    // Если аутентификация не удалась, возвращаем ошибку
    if (!userId) {
      console.log('❌ User not authenticated')
      return NextResponse.json({ error: 'Необходима авторизация для создания товара' }, { status: 401 })
    }
    
    // Получаем данные товара из тела запроса
    const productData = await request.json()
    console.log('📋 Product data received:', productData)
    
    // Подготавливаем данные для вставки
    const insertData = {
      name: productData.name,
      description: productData.description || '',
      price: productData.price || 0,
      category: productData.category,
      status: 'active',
      seller_id: userId,
      stock_quantity: productData.stock_quantity || 0,
      unit: productData.unit || 'шт',
      images: productData.images || [],
      specifications: productData.specifications || null
    }
    
    console.log('📝 Insert data prepared:', insertData)
    
    // Создаем товар через Supabase клиент
    console.log('🔧 Создаем товар через Supabase клиент...')
    console.log('🚀 Выполняем insert...')
    
    const { data, error } = await supabase
      .from('products')
      .insert([insertData])
      .select()
    
    console.log('📊 Insert result:', { data, error })
    
    if (error) {
      console.error('❌ Error creating product:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ Product created successfully:', data)
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}