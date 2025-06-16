const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testPortfolioTable() {
  console.log('=== ТЕСТИРОВАНИЕ ТАБЛИЦЫ COMPANY_PORTFOLIO ===');
  
  try {
    // Проверяем, что таблица существует
    const { data, error } = await supabase
      .from('company_portfolio')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Ошибка:', error.message);
      return;
    }
    
    console.log('✅ Таблица company_portfolio существует');
    console.log('Записей в таблице:', data?.length || 0);
    
    // Тестируем добавление записи
    const testData = {
      company_id: 'e62b0f2b-c92a-4594-8bd8-28cdea77658a',
      title: 'Тестовый проект портфолио',
      description: 'Описание тестового проекта для портфолио',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      location: 'Москва',
      category: 'Строительство',
      status: 'completed',
      featured: false
    };
    
    console.log('\n=== ТЕСТИРОВАНИЕ ДОБАВЛЕНИЯ ЗАПИСИ ===');
    const { data: insertData, error: insertError } = await supabase
      .from('company_portfolio')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('❌ Ошибка при добавлении:', insertError.message);
    } else {
      console.log('✅ Запись успешно добавлена:', insertData);
      
      // Удаляем тестовую запись
      if (insertData && insertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('company_portfolio')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.log('⚠️  Не удалось удалить тестовую запись:', deleteError.message);
        } else {
          console.log('✅ Тестовая запись удалена');
        }
      }
    }
    
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

testPortfolioTable(); 