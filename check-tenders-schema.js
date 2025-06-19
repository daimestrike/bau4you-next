import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTendersSchema() {
  console.log('Checking tenders table schema...')
  
  try {
    // Try to fetch one tender to see what fields exist
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error fetching tenders:', error.message)
      return
    }
    
    if (data && data.length > 0) {
      console.log('Available columns in tenders table:')
      console.log(Object.keys(data[0]))
    } else {
      console.log('No tenders found in table')
      
      // Try to create a minimal tender to see what fields are required
      console.log('Attempting to create a test tender...')
      const { data: insertData, error: insertError } = await supabase
        .from('tenders')
        .insert({
          title: 'Test Tender',
          description: 'Test Description'
        })
        .select()
      
      if (insertError) {
        console.error('Insert error:', insertError.message)
        console.log('This helps us understand what fields are missing or incorrect')
      } else {
        console.log('Test tender created successfully')
        console.log('Available columns:', Object.keys(insertData[0]))
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkTendersSchema()