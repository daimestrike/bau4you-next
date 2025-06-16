import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  try {
    console.log('Checking company_portfolio table...');
    
    // Попробуем выполнить простой SELECT запрос
    const { data, error } = await supabase
      .from('company_portfolio')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error accessing company_portfolio table:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Table exists and accessible. Sample data:', data);
    }
    
    // Попробуем также проверить через RPC
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('exec_sql', { 
        sql_query: "SELECT table_name FROM information_schema.tables WHERE table_name = 'company_portfolio';" 
      });
    
    if (rpcError) {
      console.log('RPC not available or error:', rpcError.message);
    } else {
      console.log('RPC result:', rpcData);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkTable();