import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gcbwqqwmqjolxxrvfbzz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA2OTUsImV4cCI6MjA2NDQ1NjY5NX0.l4MmmUaF6YmNRRcorzdx_YdgQZerqqoS86N_T3TX7io'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('Checking tenders table structure...')
  
  try {
    // Test specific fields
    console.log('\nChecking specific fields:');
    
    const fieldsToCheck = ['id', 'title', 'description', 'location', 'deadline', 'budget', 'budget_min', 'budget_max', 'category', 'client_id', 'created_at', 'updated_at'];
    
    for (const field of fieldsToCheck) {
      try {
        const { data, error } = await supabase
          .from('tenders')
          .select(field)
          .limit(1);
        
        if (error) {
          console.log(`${field} field: NOT EXISTS (${error.message})`);
        } else {
          console.log(`${field} field: EXISTS`);
        }
      } catch (err) {
        console.log(`${field} field: NOT EXISTS (${err.message})`);
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkTableStructure()