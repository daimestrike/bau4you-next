const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addCoverImageField() {
  try {
    console.log('Adding cover_image field to companies table...')
    
    // Выполняем SQL запрос для добавления поля
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_image TEXT;'
    })
    
    if (error) {
      console.error('Error adding cover_image field:', error)
      
      // Попробуем альтернативный способ - через обновление существующей записи
      console.log('Trying alternative approach...')
      
      // Сначала проверим, есть ли уже поле cover_image
      const { data: testData, error: testError } = await supabase
        .from('companies')
        .select('cover_image')
        .limit(1)
      
      if (testError && testError.message.includes('column "cover_image" does not exist')) {
        console.log('cover_image field does not exist, need to add it manually')
        console.log('Please run this SQL in your Supabase dashboard:')
        console.log('ALTER TABLE companies ADD COLUMN cover_image TEXT;')
      } else {
        console.log('cover_image field already exists or accessible')
      }
    } else {
      console.log('Successfully added cover_image field')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addCoverImageField() 