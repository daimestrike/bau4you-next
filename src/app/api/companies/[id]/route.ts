import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

// PUT - обновить компанию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    console.log('🔍 API Companies PUT called for ID:', resolvedParams.id)
    
    const body = await request.json()
    console.log('📋 Company update data received:', body)

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

    // Убираем updated_at из обновлений, если оно есть (может вызывать ошибки)
    const { updated_at, ...cleanUpdates } = body

    console.log('📝 Update data prepared:', cleanUpdates)

    // Обновляем компанию через Supabase клиент с service role
    console.log('🔧 Обновляем компанию через Supabase клиент...')
    const { data, error } = await supabase
      .from('companies')
      .update(cleanUpdates)
      .eq('id', resolvedParams.id)
      .eq('owner_id', userId) // Проверяем, что пользователь - владелец компании
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error', details: error }, { status: 500 })
    }

    console.log('✅ Company updated successfully:', data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 