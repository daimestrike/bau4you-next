// Прокси-клиент для Supabase через VPS
const VPS_URL = 'https://api.bau4you.co'
const PROXY_BASE_URL = `${VPS_URL}/api/sb`

interface SupabaseAuthResponse {
  access_token?: string
  refresh_token?: string
  user?: any
  error?: any
}

interface SupabaseResponse<T = any> {
  data: T
  error: any
  count?: number
  status: number
  statusText: string
}

class SupabaseProxyClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    // Восстанавливаем токены из localStorage при инициализации
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('sb-access-token')
      this.refreshToken = localStorage.getItem('sb-refresh-token')
    }
  }

  // Базовый метод для выполнения запросов
  private async makeRequest(
    path: string, 
    options: RequestInit = {},
    useServiceRole = false
  ): Promise<Response> {
    const url = `${PROXY_BASE_URL}/${path}`
    
    const headers = new Headers(options.headers)
    
    // Добавляем авторизацию если есть токен
    if (this.accessToken && !useServiceRole) {
      headers.set('authorization', `Bearer ${this.accessToken}`)
    }
    
    // Флаг для использования service role (для админских операций)
    if (useServiceRole) {
      headers.set('x-use-service-role', 'true')
    }
    
    // Устанавливаем Content-Type для JSON если не установлен
    if (options.body && !headers.get('content-type')) {
      headers.set('content-type', 'application/json')
    }
    
    console.log(`🔄 Proxy Request: ${options.method || 'GET'} ${path}`)
    
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    console.log(`📡 Proxy Response: ${response.status} ${response.statusText}`)
    
    return response
  }

  // Auth методы
  auth = {
    // Вход по email/password
    signInWithPassword: async (credentials: { email: string; password: string }): Promise<SupabaseAuthResponse> => {
      try {
        const response = await this.makeRequest('auth/v1/token?grant_type=password', {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        })
        
        const data = await response.json()
        
        if (data.access_token) {
          this.accessToken = data.access_token
          this.refreshToken = data.refresh_token
          
          // Сохраняем в localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-access-token', data.access_token)
            localStorage.setItem('sb-refresh-token', data.refresh_token)
            localStorage.setItem('sb-user', JSON.stringify(data.user))
          }
        }
        
        return data
      } catch (error) {
        console.error('❌ Sign in error:', error)
        return { error }
      }
    },

    // Регистрация
    signUp: async (credentials: { email: string; password: string; options?: any }): Promise<SupabaseAuthResponse> => {
      try {
        const response = await this.makeRequest('auth/v1/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            data: credentials.options?.data || {}
          })
        })
        
        return await response.json()
      } catch (error) {
        console.error('❌ Sign up error:', error)
        return { error }
      }
    },

    // Выход
    signOut: async (options?: { scope?: 'global' | 'local' }): Promise<{ error?: any }> => {
      try {
        // Если scope не 'local', отправляем запрос на сервер
        if (options?.scope !== 'local' && this.accessToken) {
          await this.makeRequest('auth/v1/logout', {
            method: 'POST'
          })
        }
        
        // Очищаем токены
        this.accessToken = null
        this.refreshToken = null
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-access-token')
          localStorage.removeItem('sb-refresh-token')
          localStorage.removeItem('sb-user')
        }
        
        return {}
      } catch (error) {
        console.error('❌ Sign out error:', error)
        return { error }
      }
    },

    // Получение текущего пользователя
    getUser: async (): Promise<{ data: { user: any }, error?: any }> => {
      try {
        if (!this.accessToken) {
          return { data: { user: null }, error: { message: 'No access token' } }
        }
        
        const response = await this.makeRequest('auth/v1/user', {
          method: 'GET'
        })
        
        const data = await response.json()
        return { data: { user: data }, error: response.ok ? null : data }
      } catch (error) {
        console.error('❌ Get user error:', error)
        return { data: { user: null }, error }
      }
    },

    // Получение сессии
    getSession: async (): Promise<{ data: { session: any }, error?: any }> => {
      try {
        if (!this.accessToken) {
          return { data: { session: null }, error: null }
        }
        
        // Проверяем валидность токена
        const userResponse = await this.auth.getUser()
        if (userResponse.error) {
          return { data: { session: null }, error: userResponse.error }
        }
        
        const session = {
          access_token: this.accessToken,
          refresh_token: this.refreshToken,
          user: userResponse.data.user,
          expires_at: null // TODO: можно добавить обработку истечения
        }
        
        return { data: { session }, error: null }
      } catch (error) {
        console.error('❌ Get session error:', error)
        return { data: { session: null }, error }
      }
    },

    // Обновление токена
    refreshSession: async (): Promise<SupabaseAuthResponse> => {
      try {
        if (!this.refreshToken) {
          throw new Error('No refresh token')
        }
        
        const response = await this.makeRequest('auth/v1/token?grant_type=refresh_token', {
          method: 'POST',
          body: JSON.stringify({
            refresh_token: this.refreshToken
          })
        })
        
        const data = await response.json()
        
        if (data.access_token) {
          this.accessToken = data.access_token
          this.refreshToken = data.refresh_token
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-access-token', data.access_token)
            localStorage.setItem('sb-refresh-token', data.refresh_token)
          }
        }
        
        return data
      } catch (error) {
        console.error('❌ Refresh session error:', error)
        return { error }
      }
    },

    // Подписка на изменения состояния аутентификации (заглушка для совместимости)
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Для совместимости возвращаем объект с методом unsubscribe
      // В реальной реализации здесь был бы WebSocket или EventSource
      console.log('🔔 onAuthStateChange called (proxy mode)')
      
      // Проверяем текущую сессию при подписке
      if (typeof window !== 'undefined') {
        setTimeout(async () => {
          const { data: { session } } = await this.auth.getSession()
          if (session) {
            callback('SIGNED_IN', session)
          } else {
            callback('SIGNED_OUT', null)
          }
        }, 100)
      }
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('🔕 Auth state change unsubscribed')
            }
          }
        }
      }
    }
  }

  // Database методы
  from = (table: string) => {
    return new SupabaseQueryBuilder(table, this.makeRequest.bind(this))
  }

  // Storage методы
  storage = {
    from: (bucket: string) => {
      return new SupabaseStorageClient(bucket, this.makeRequest.bind(this))
    }
  }
}

// Query Builder для работы с таблицами
class SupabaseQueryBuilder {
  private table: string
  private makeRequest: (path: string, options?: RequestInit, useServiceRole?: boolean) => Promise<Response>
  private queryParams: URLSearchParams = new URLSearchParams()
  private selectColumns = '*'

  constructor(table: string, makeRequest: (path: string, options?: RequestInit, useServiceRole?: boolean) => Promise<Response>) {
    this.table = table
    this.makeRequest = makeRequest
  }

  select(columns = '*') {
    this.selectColumns = columns
    this.queryParams.set('select', columns)
    return this
  }

  eq(column: string, value: any) {
    this.queryParams.set(column, `eq.${value}`)
    return this
  }

  neq(column: string, value: any) {
    this.queryParams.set(column, `neq.${value}`)
    return this
  }

  gt(column: string, value: any) {
    this.queryParams.set(column, `gt.${value}`)
    return this
  }

  gte(column: string, value: any) {
    this.queryParams.set(column, `gte.${value}`)
    return this
  }

  lt(column: string, value: any) {
    this.queryParams.set(column, `lt.${value}`)
    return this
  }

  lte(column: string, value: any) {
    this.queryParams.set(column, `lte.${value}`)
    return this
  }

  like(column: string, pattern: string) {
    this.queryParams.set(column, `like.${pattern}`)
    return this
  }

  ilike(column: string, pattern: string) {
    this.queryParams.set(column, `ilike.${pattern}`)
    return this
  }

  or(query: string) {
    this.queryParams.set('or', query)
    return this
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    const direction = options.ascending === false ? 'desc' : 'asc'
    this.queryParams.set('order', `${column}.${direction}`)
    return this
  }

  limit(count: number) {
    this.queryParams.set('limit', count.toString())
    return this
  }

  range(from: number, to: number) {
    this.queryParams.set('offset', from.toString())
    this.queryParams.set('limit', (to - from + 1).toString())
    return this
  }

  single() {
    this.queryParams.set('limit', '1')
    return this
  }

  // Автоматическое выполнение для совместимости
  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  async execute(): Promise<SupabaseResponse> {
    try {
      const path = `rest/v1/${this.table}?${this.queryParams.toString()}`
      const response = await this.makeRequest(path, { method: 'GET' })
      
      const data = await response.json()
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      return {
        data: null,
        error,
        status: 500,
        statusText: 'Internal Error'
      }
    }
  }

  // Методы для выполнения запросов
  async insert(values: any | any[]): Promise<SupabaseResponse> {
    try {
      const path = `rest/v1/${this.table}`
      const response = await this.makeRequest(path, {
        method: 'POST',
        body: JSON.stringify(values)
      })
      
      const data = await response.json()
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      return {
        data: null,
        error,
        status: 500,
        statusText: 'Internal Error'
      }
    }
  }

  async update(values: any): Promise<SupabaseResponse> {
    try {
      const path = `rest/v1/${this.table}?${this.queryParams.toString()}`
      const response = await this.makeRequest(path, {
        method: 'PATCH',
        body: JSON.stringify(values)
      })
      
      const data = await response.json()
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      return {
        data: null,
        error,
        status: 500,
        statusText: 'Internal Error'
      }
    }
  }

  async delete(): Promise<SupabaseResponse> {
    try {
      const path = `rest/v1/${this.table}?${this.queryParams.toString()}`
      const response = await this.makeRequest(path, { method: 'DELETE' })
      
      const data = response.status !== 204 ? await response.json() : null
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      return {
        data: null,
        error,
        status: 500,
        statusText: 'Internal Error'
      }
    }
  }
}

// Storage Client для работы с файлами
class SupabaseStorageClient {
  private bucket: string
  private makeRequest: (path: string, options?: RequestInit, useServiceRole?: boolean) => Promise<Response>

  constructor(bucket: string, makeRequest: (path: string, options?: RequestInit, useServiceRole?: boolean) => Promise<Response>) {
    this.bucket = bucket
    this.makeRequest = makeRequest
  }

  async upload(path: string, file: File | Blob, options: any = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await this.makeRequest(`storage/v1/object/${this.bucket}/${path}`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  async download(path: string) {
    try {
      const response = await this.makeRequest(`storage/v1/object/${this.bucket}/${path}`, {
        method: 'GET'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        return { data: blob, error: null }
      } else {
        const error = await response.json()
        return { data: null, error }
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  getPublicUrl(path: string) {
    return {
      data: {
        publicUrl: `${PROXY_BASE_URL}/storage/v1/object/public/${this.bucket}/${path}`
      }
    }
  }
}

// Создаем и экспортируем единственный экземпляр клиента
export const supabaseProxy = new SupabaseProxyClient()
export default supabaseProxy 