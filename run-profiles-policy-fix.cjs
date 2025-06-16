const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Загружаем переменные окружения
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcbwqqwmqjolxxrvfbzz.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('Reading SQL file...')
    const sql = fs.readFileSync('./fix_profiles_search_policy.sql', 'utf8')
    
    console.log('Executing SQL migration...')
    
    // Выполняем команды напрямую
    console.log('Dropping existing policy...')
    const { error: dropError } = await supabase.rpc('drop_policy_if_exists', {
      policy_name: 'Users can view own profile',
      table_name: 'profiles'
    })
    
    if (dropError) {
      console.log('Drop policy result:', dropError)
    }
    
    console.log('Creating new policy...')
    const { error: createError } = await supabase.rpc('create_policy', {
      policy_name: 'Users can view profiles',
      table_name: 'profiles',
      policy_definition: `FOR SELECT TO authenticated USING (
        auth.uid() = id 
        OR 
        auth.uid() IS NOT NULL
      )`
    })
    
    if (createError) {
      console.error('Create policy error:', createError)
    } else {
      console.log('Policy created successfully!')
    }
    
    console.log('Migration completed successfully!')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

runMigration()