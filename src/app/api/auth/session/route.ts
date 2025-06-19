import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()
    
    console.log('🔑 Setting server session for token:', access_token ? `${access_token.substring(0, 20)}...` : 'none')
    
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )

    // Устанавливаем сессию на сервере
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (error) {
      console.error('❌ Error setting server session:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ Server session set successfully for user:', data.user?.email)
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: data.user?.id, 
        email: data.user?.email 
      } 
    })

  } catch (error) {
    console.error('❌ Server session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 