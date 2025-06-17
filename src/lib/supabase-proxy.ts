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
        
        const responseData = await response.json()
        
        if (responseData.access_token) {
          this.accessToken = responseData.access_token
          this.refreshToken = responseData.refresh_token
          
          // Сохраняем в localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-access-token', responseData.access_token)
            localStorage.setItem('sb-refresh-token', responseData.refresh_token)
            localStorage.setItem('sb-user', JSON.stringify(responseData.user))
          }
          
          // Возвращаем в формате Supabase
          return {
            access_token: responseData.access_token,
            refresh_token: responseData.refresh_token,
            user: responseData.user,
            error: null
          }
        } else if (responseData.error) {
          return {
            error: responseData.error
          }
        } else {
          return {
            error: { message: 'Неизвестная ошибка авторизации' }
          }
        }
      } catch (error) {
        console.error('❌ Sign in error:', error)
        return {
          error: { message: error instanceof Error ? error.message : 'Ошибка сети' }
        }
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
        
        const responseData = await response.json()
        console.log('📊 SignUp Response Data:', responseData)
        
        if (responseData.access_token) {
          this.accessToken = responseData.access_token
          this.refreshToken = responseData.refresh_token
          
          // Сохраняем в localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-access-token', responseData.access_token)
            localStorage.setItem('sb-refresh-token', responseData.refresh_token)
            localStorage.setItem('sb-user', JSON.stringify(responseData.user))
          }
          
          // Возвращаем в формате Supabase
          return {
            access_token: responseData.access_token,
            refresh_token: responseData.refresh_token,
            user: responseData.user,
            error: null
          }
        } else {
          // Возвращаем данные как есть, если нет токена (может быть требуется подтверждение email)
          return {
            user: responseData.user,
            error: responseData.error || null
          }
        }
      } catch (error) {
        console.error('❌ Sign up error:', error)
        return { 
          error: { message: error instanceof Error ? error.message : 'Ошибка сети' }
        }
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
    getUser: async (): Promise<{ user: any, error?: any }> => {
      try {
        if (!this.accessToken) {
          return { user: null, error: { message: 'No access token' } }
        }
        
        const response = await this.makeRequest('auth/v1/user', {
          method: 'GET'
        })
        
        const data = await response.json()
        return { user: data, error: response.ok ? null : data }
      } catch (error) {
        console.error('❌ Get user error:', error)
        return { user: null, error }
      }
    },

    // Получение сессии
    getSession: async (): Promise<{ session: any, error?: any }> => {
      try {
        if (!this.accessToken) {
          return { session: null, error: null }
        }
        
        // Проверяем валидность токена
        const userResponse = await this.auth.getUser()
        if (userResponse.error) {
          return { session: null, error: userResponse.error }
        }
        
        const session = {
          access_token: this.accessToken,
          refresh_token: this.refreshToken,
          user: userResponse.user,
          expires_at: null // TODO: можно добавить обработку истечения
        }
        
        return { session, error: null }
      } catch (error) {
        console.error('❌ Get session error:', error)
        return { session: null, error }
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
          const { session } = await this.auth.getSession()
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
  private insertValues: any
  private updateValues: any
  private operation: string = 'select'
  private selectColumns = '*'
  private isSingle: boolean = false
  private isMaybeSingle: boolean = false

  constructor(table: string, makeRequest: (path: string, options?: RequestInit, useServiceRole?: boolean) => Promise<Response>) {
    this.table = table
    this.makeRequest = makeRequest
    this.isSingle = false
    this.isMaybeSingle = false
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
    // Добавляем order по умолчанию, если не указан
    if (!this.queryParams.has('order')) {
      this.queryParams.set('order', 'id')
    }
    this.isSingle = true
    this.isMaybeSingle = false
    return this
  }

  maybeSingle() {
    this.queryParams.set('limit', '1')
    // Добавляем order по умолчанию, если не указан
    if (!this.queryParams.has('order')) {
      this.queryParams.set('order', 'id')
    }
    this.isSingle = true
    this.isMaybeSingle = true
    return this
  }

  // Автоматическое выполнение для совместимости
  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  async execute(): Promise<SupabaseResponse> {
    try {
      // Выполняем соответствующую операцию
      if (this.operation === 'insert') {
        return this.executeInsert()
      }
      if (this.operation === 'update') {
        return this.executeUpdate()
      }
      
      // Обычный SELECT запрос
      const path = `rest/v1/${this.table}?${this.queryParams.toString()}`
      const response = await this.makeRequest(path, { method: 'GET' })
      
      const data = await response.json()
      
      // Если используется single() или maybeSingle(), извлекаем первый элемент из массива
      let resultData = data
      if (this.isSingle && response.ok && Array.isArray(data)) {
        if (data.length === 0) {
          if (this.isMaybeSingle) {
            // maybeSingle() возвращает null, если записи не найдены
            resultData = null
          } else {
            // single() возвращает ошибку, если записи не найдены
            return {
              data: null,
              error: { message: 'No rows found', code: 'PGRST116' },
              status: 406,
              statusText: 'Not Acceptable'
            }
          }
        } else {
          resultData = data[0]
        }
      }
      
      return {
        data: response.ok ? resultData : null,
        error: response.ok ? null : data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      console.error('execute error:', error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'PROXY_ERROR', 
          details: error
        },
        status: 500,
        statusText: 'Internal Error'
      }
    }
  }

  // Методы для выполнения запросов
  insert(values: any | any[]) {
    this.insertValues = values
    this.operation = 'insert'
    return this
  }

  async executeInsert(): Promise<SupabaseResponse> {
    try {
      let path = `rest/v1/${this.table}`
      if (this.queryParams.has('select')) {
        path += `?${this.queryParams.toString()}`
      }
      
      const response = await this.makeRequest(path, {
        method: 'POST',
        body: JSON.stringify(this.insertValues)
      })
      
      // Обрабатываем ответ в зависимости от статуса
      let data = null
      if (response.status === 204) {
        // 204 No Content - успешная операция без возврата данных
        data = this.isSingle ? {} : []
      } else if (response.status === 201 || response.status === 200) {
        // 201 Created или 200 OK - читаем содержимое
        const text = await response.text()
        if (text) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            console.warn('Failed to parse response as JSON:', text)
            data = text
          }
        }
      } else {
        // Для ошибок пытаемся прочитать body
        const text = await response.text()
        if (text) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            console.warn('Failed to parse error response as JSON:', text)
            data = { message: text }
          }
        } else {
          data = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
      }
      
      // Если используется single() или maybeSingle(), извлекаем первый элемент из массива
      let resultData = data
      if (this.isSingle && response.ok && Array.isArray(data)) {
        if (data.length === 0) {
          if (this.isMaybeSingle) {
            resultData = null
          } else {
            return {
              data: null,
              error: { message: 'No rows found', code: 'PGRST116' },
              status: 406,
              statusText: 'Not Acceptable'
            }
          }
        } else {
          resultData = data[0]
        }
      }
      
      return {
        data: response.ok ? resultData : null,
        error: response.ok ? null : data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      console.error('executeInsert error:', error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'PROXY_ERROR',
          details: error
        },
        status: 500,
        statusText: 'Internal Error'
      }
    }
  }

  update(values: any) {
    this.updateValues = values
    this.operation = 'update'
    return this
  }

  async executeUpdate(): Promise<SupabaseResponse> {
    try {
      const path = `rest/v1/${this.table}?${this.queryParams.toString()}`
      const response = await this.makeRequest(path, {
        method: 'PATCH',
        body: JSON.stringify(this.updateValues)
      })
      
      // Обрабатываем ответ в зависимости от статуса
      let data = null
      if (response.status === 204) {
        // 204 No Content - успешное обновление без возврата данных
        // Возвращаем null для совместимости с Supabase клиентом
        data = null
      } else if (response.status !== 200) {
        // Для ошибок пытаемся прочитать body
        const text = await response.text()
        if (text) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            console.warn('Failed to parse error response as JSON:', text)
            data = { message: text }
          }
        } else {
          data = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
      } else {
        // 200 OK - читаем содержимое
        const text = await response.text()
        if (text) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            console.warn('Failed to parse response as JSON:', text)
            data = text
          }
        }
      }
      
      // Если используется single() или maybeSingle(), извлекаем первый элемент из массива
      let resultData = data
      if (this.isSingle && response.ok && Array.isArray(data)) {
        if (data.length === 0) {
          if (this.isMaybeSingle) {
            resultData = null
          } else {
            return {
              data: null,
              error: { message: 'No rows found', code: 'PGRST116' },
              status: 406,
              statusText: 'Not Acceptable'
            }
          }
        } else {
          resultData = data[0]
        }
      }
      
      return {
        data: response.ok ? resultData : null,
        error: response.ok ? null : data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      console.error('executeUpdate error:', error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'PROXY_ERROR',
          details: error
        },
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
      console.error('delete error:', error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'PROXY_ERROR',
          details: error
        },
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
        path: response.ok ? data.path : null,
        error: response.ok ? null : data
      }
    } catch (error) {
      return { path: null, error }
    }
  }

  async download(path: string) {
    try {
      const response = await this.makeRequest(`storage/v1/object/${this.bucket}/${path}`, {
        method: 'GET'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        return { blob, error: null }
      } else {
        const error = await response.json()
        return { blob: null, error }
      }
    } catch (error) {
      return { blob: null, error }
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