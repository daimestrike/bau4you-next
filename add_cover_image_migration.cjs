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
    console.log('Checking if cover_image field exists...')
    
    // Проверим, есть ли уже поле cover_image
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('cover_image')
      .limit(1)
    
    if (testError && testError.message.includes('column "cover_image" does not exist')) {
      console.log('❌ cover_image field does not exist')
      console.log('📋 Please run this SQL in your Supabase dashboard:')
      console.log('ALTER TABLE companies ADD COLUMN cover_image TEXT;')
      console.log('')
      console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql')
    } else if (testError) {
      console.error('❌ Error checking field:', testError)
    } else {
      console.log('✅ cover_image field already exists!')
      
      // Проверим, есть ли компании с обложками
      const { data: companiesWithCovers, error: coverError } = await supabase
        .from('companies')
        .select('id, name, cover_image')
        .not('cover_image', 'is', null)
        .limit(5)
      
      if (coverError) {
        console.error('Error checking companies with covers:', coverError)
      } else {
        console.log(`📊 Found ${companiesWithCovers.length} companies with cover images`)
        if (companiesWithCovers.length > 0) {
          console.log('Companies with covers:')
          companiesWithCovers.forEach(company => {
            console.log(`- ${company.name}: ${company.cover_image}`)
          })
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

addCoverImageField() 