// Прокси-клиент для Supabase через VPS
const VPS_URL = 'https://api.bau4you.co'
const PROXY_BASE_URL = `${VPS_URL}/api/sb`

interface SupabaseAuthResponse {
  data?: {
    user?: any
    session?: any
  }
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
            data: {
              user: responseData.user,
              session: {
                access_token: responseData.access_token,
                refresh_token: responseData.refresh_token,
                expires_in: responseData.expires_in,
                token_type: responseData.token_type,
                user: responseData.user
              }
            },
            error: null
          }
        } else {
          // Возвращаем данные как есть, если нет токена (может быть требуется подтверждение email)
          return {
            data: responseData,
            error: responseData.error || null
          }
        }
      } catch (error) {
        console.error('❌ Sign up error:', error)
        return { 
          data: { user: null, session: null },
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
    getUser: async (): Promise<{ data: { user: any }, error?: any }> => {
      try {
        if (!this.accessToken) {
          return { data: { user: null }, error: { message: 'No access token' } }
        }
        
        const response = await this.makeRequest('auth/v1/user', {
          method: 'GET'
        })
        
        // Для UPDATE операций Supabase может возвращать 204 No Content без тела
      let data
      if (response.status === 204) {
        data = null
      } else {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      }
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
  private isSingle: boolean = false
  private isMaybeSingle: boolean = false
  public insertData: any = null
  public updateData: any = null
  public operation: string = 'select'

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

  in(column: string, values: any[]) {
    this.queryParams.set(column, `in.(${values.join(',')})`)
    return this
  }

  or(query: string) {
    this.queryParams.set('or', `(${query})`)
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
    this.isSingle = true
    this.isMaybeSingle = false
    return this
  }

  maybeSingle() {
    this.queryParams.set('limit', '1')
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
      // Если это операция insert, используем специальный метод
      if (this.operation === 'insert' && this.insertData) {
        return await this._executeInsert(this.insertData)
      }
      
      // Если это операция update, используем специальный метод
      if (this.operation === 'update' && this.updateData) {
        return await this._executeUpdate(this.updateData)
      }
      
      // Обычная операция select
      const path = `rest/v1/${this.table}?${this.queryParams.toString()}`
      const response = await this.makeRequest(path, { method: 'GET' })
      
      // Для UPDATE операций Supabase может возвращать 204 No Content без тела
      let data
      if (response.status === 204) {
        data = null
      } else {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      }
      
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
      return {
        data: null,
        error,
        status: 500,
        statusText: 'Internal Error'
      }
    }
  }

  // Методы для выполнения запросов
  insert(values: any | any[]) {
    // Создаем новый QueryBuilder для цепочки вызовов
    const builder = new SupabaseQueryBuilder(this.table, this.makeRequest)
    builder.insertData = values
    builder.operation = 'insert'
    return builder
  }

  async _executeInsert(values: any | any[]): Promise<SupabaseResponse> {
    try {
      let path = `rest/v1/${this.table}`
      
      // Если есть select параметры, добавляем их
      if (this.queryParams.has('select')) {
        path += `?${this.queryParams.toString()}`
      }
      
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      // Не используем заголовок Prefer, так как VPS прокси его не поддерживает
      // Вместо этого будем делать отдельный запрос для получения данных
      
      const response = await this.makeRequest(path, {
        method: 'POST',
        headers,
        body: JSON.stringify(values)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        return {
          data: null,
          error: errorData,
          status: response.status,
          statusText: response.statusText
        }
      }
      
      // Если нет select параметров, просто возвращаем успешный результат
      if (!this.queryParams.has('select')) {
        return {
          data: null,
          error: null,
          status: response.status,
          statusText: response.statusText
        }
      }
      
      // Если есть select параметры, делаем отдельный запрос для получения данных
      // Используем простую логику - возвращаем последнюю вставленную запись
      try {
        const selectPath = `rest/v1/${this.table}?${this.queryParams.toString()}&order=created_at.desc&limit=1`
        const selectResponse = await this.makeRequest(selectPath, { method: 'GET' })
        
        if (selectResponse.ok) {
          const selectData = await selectResponse.json()
          let resultData = selectData
          
          // Если используется single() или maybeSingle(), извлекаем первый элемент
          if (this.isSingle && Array.isArray(selectData)) {
            if (selectData.length === 0) {
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
              resultData = selectData[0]
            }
          }
          
          return {
            data: resultData,
            error: null,
            status: response.status,
            statusText: response.statusText
          }
        }
      } catch (selectError) {
        console.warn('Failed to fetch inserted data:', selectError)
      }
      
      // Если не удалось получить данные, возвращаем успешный результат без данных
      return {
        data: null,
        error: null,
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

  update(values: any) {
    // Создаем новый QueryBuilder для цепочки вызовов
    const builder = new SupabaseQueryBuilder(this.table, this.makeRequest)
    builder.updateData = values
    builder.operation = 'update'
    // Копируем существующие параметры запроса
    builder.queryParams = new URLSearchParams(this.queryParams)
    builder.selectColumns = this.selectColumns
    builder.isSingle = this.isSingle
    builder.isMaybeSingle = this.isMaybeSingle
    return builder
  }

  async _executeUpdate(values: any): Promise<SupabaseResponse> {
    try {
      // Для UPDATE операций создаем отдельные queryParams без limit
      const updateParams = new URLSearchParams()
      
      // Копируем все параметры кроме limit и select
      for (const [key, value] of this.queryParams.entries()) {
        if (key !== 'limit' && key !== 'select') {
          updateParams.set(key, value)
        }
      }
      
      // Добавляем select если он был указан
      if (this.queryParams.has('select')) {
        updateParams.set('select', this.queryParams.get('select')!)
      }
      
      const path = `rest/v1/${this.table}?${updateParams.toString()}`
      const response = await this.makeRequest(path, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      // Для UPDATE операций Supabase может возвращать 204 No Content без тела
      let data
      if (response.status === 204) {
        // Для статуса 204 (успешное обновление без возврата данных)
        // Если используется .select(), то это означает успешное обновление
        data = this.queryParams.has('select') ? [] : null
      } else {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      }
      
      // Если используется single() или maybeSingle(), извлекаем первый элемент из массива
      let resultData = data
      if (this.isSingle && response.ok && Array.isArray(data)) {
        if (data.length === 0) {
          if (this.isMaybeSingle) {
            resultData = null
          } else {
            // Для UPDATE операций со статусом 204 и .single() - это успех
            if (response.status === 204) {
              resultData = null // Успешное обновление, но данные не возвращены
            } else {
              return {
                data: null,
                error: { message: 'No rows found' },
                status: 404,
                statusText: 'Not Found'
              }
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