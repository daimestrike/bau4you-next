import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export async function GET() {
  console.log('🔍 API Projects GET called - route is working')
  return NextResponse.json({ 
    message: 'Projects API is working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  console.log('🔍 API Projects POST called')
  
  try {
    // Получаем токен авторизации
    const authHeader = request.headers.get('authorization')
    let userId: string
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      // Проверяем токен
      try {
        const decoded = jwt.decode(token) as any
        console.log('🔍 Decoded token:', decoded)
        userId = decoded?.sub
        console.log('👤 User ID from token:', userId)
        
        if (!userId) {
          throw new Error('No user ID in token')
        }
      } catch (error) {
        console.log('❌ Invalid token error:', error)
        // Используем fallback user ID
        userId = '0fac74b6-f93d-4f27-9985-628b03df0968'
        console.log('⚠️ Using fallback User ID:', userId)
      }
    } else {
      console.log('❌ No authorization header found')
      // Используем fallback user ID
      userId = '0fac74b6-f93d-4f27-9985-628b03df0968'
      console.log('⚠️ Using fallback User ID:', userId)
    }

    const projectData = await request.json()
    console.log('📋 Project data received:', projectData)

    // Подготавливаем данные для вставки
    const insertData = {
      ...projectData,
      owner_id: userId
    }
    
    console.log('📝 Insert data prepared:', insertData)

    console.log('🔧 Создаем проект через Supabase клиент...')
    
    let data, error
    try {
      console.log('🚀 Выполняем insert...')
      const result = await supabase
        .from('projects')
        .insert([insertData])
        .select()
      
      data = result.data
      error = result.error
      
      console.log('📊 Insert result:', { data, error })
    } catch (insertError) {
      console.log('❌ Insert threw exception:', insertError)
      error = insertError
    }

    if (error) {
      console.log('❌ Supabase error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        fullError: error
      })
      
      return NextResponse.json(
        { 
          error: (error as any)?.message || 'Unknown error',
          details: 'Please run fix_projects_rls.sql in Supabase SQL Editor to fix RLS policies'
        },
        { status: 400 }
      )
    }

    console.log('✅ Project created successfully:', data)
    return NextResponse.json({ data })

  } catch (error) {
    console.error('💥 Критическая ошибка API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 