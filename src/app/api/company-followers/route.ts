import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Создаем клиент с anon key (временное решение)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// GET - проверить статус подписки
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Company Followers GET called')
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userId: string

    try {
      const decoded = jwt.decode(token) as any
      userId = decoded?.sub
      console.log('👤 User ID from token:', userId)
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    } catch (error) {
      console.error('❌ Token decode error:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Проверяем подписку
    const { data, error } = await supabase
      .from('company_followers')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const isFollowing = !!data
    console.log('✅ Follow status checked:', isFollowing)

    return NextResponse.json({ isFollowing })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - подписаться на компанию
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Company Followers POST called')
    
    const body = await request.json()
    const { company_id } = body
    
    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userId: string

    try {
      const decoded = jwt.decode(token) as any
      userId = decoded?.sub
      console.log('👤 User ID from token:', userId)
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    } catch (error) {
      console.error('❌ Token decode error:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Создаем подписку
    const { data, error } = await supabase
      .from('company_followers')
      .insert({
        company_id,
        user_id: userId,
        followed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ Company followed successfully:', data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - отписаться от компании
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 API Company Followers DELETE called')
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Получаем токен из заголовков
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userId: string

    try {
      const decoded = jwt.decode(token) as any
      userId = decoded?.sub
      console.log('👤 User ID from token:', userId)
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    } catch (error) {
      console.error('❌ Token decode error:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Удаляем подписку
    const { error } = await supabase
      .from('company_followers')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ Company unfollowed successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 