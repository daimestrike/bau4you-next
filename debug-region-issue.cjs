const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcbwqqwmqjolxxrvfbzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA2OTUsImV4cCI6MjA2NDQ1NjY5NX0.l4MmmUaF6YmNRRcorzdx_YdgQZerqqoS86N_T3TX7io';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRegionIssue() {
  try {
    console.log('🔍 Отладка проблемы с region_id...');
    
    // 1. Проверяем все регионы
    console.log('\n1. Проверяем все регионы:');
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('*');
    
    if (regionsError) {
      console.error('Ошибка получения регионов:', regionsError);
      return;
    }
    
    console.log(`Найдено регионов: ${regions?.length || 0}`);
    if (regions && regions.length > 0) {
      console.log('Первые 5 регионов:');
      regions.slice(0, 5).forEach(region => {
        console.log(`  - ID: ${region.id}, Название: ${region.name}`);
      });
    }
    
    // 2. Проверяем существующие компании с region_id
    console.log('\n2. Проверяем существующие компании с region_id:');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, region_id')
      .not('region_id', 'is', null)
      .limit(5);
    
    if (companiesError) {
      console.error('Ошибка получения компаний:', companiesError);
    } else {
      console.log(`Найдено компаний с region_id: ${companies?.length || 0}`);
      if (companies && companies.length > 0) {
        companies.forEach(company => {
          console.log(`  - Компания: ${company.name}, region_id: ${company.region_id}`);
        });
      }
    }
    
    // 3. Тестируем создание компании с валидным region_id
    console.log('\n3. Тестируем создание компании с валидным region_id:');
    if (regions && regions.length > 0) {
      const testRegionId = regions[0].id;
      console.log(`Используем region_id: ${testRegionId}`);
      
      const testCompanyData = {
        name: 'Тестовая компания для отладки',
        description: 'Тестовое описание',
        type: 'contractor',
        region_id: testRegionId,
        owner_id: 'c40c0f54-d956-417f-9b1e-ace247cb4ddc' // известный user_id
      };
      
      console.log('Данные для тестовой компании:', testCompanyData);
      
      const { data: testResult, error: testError } = await supabase
        .from('companies')
        .insert([testCompanyData])
        .select();
      
      if (testError) {
        console.error('❌ Ошибка при создании тестовой компании:', testError);
        console.error('Код ошибки:', testError.code);
        console.error('Детали:', testError.details);
        console.error('Подсказка:', testError.hint);
      } else {
        console.log('✅ Тестовая компания успешно создана:', testResult);
        
        // Удаляем тестовую компанию
        if (testResult && testResult.length > 0) {
          const { error: deleteError } = await supabase
            .from('companies')
            .delete()
            .eq('id', testResult[0].id);
          
          if (deleteError) {
            console.error('Ошибка удаления тестовой компании:', deleteError);
          } else {
            console.log('✅ Тестовая компания удалена');
          }
        }
      }
    }
    
    // 4. Проверяем схему таблицы companies
    console.log('\n4. Проверяем схему таблицы companies:');
    const { data: schema, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'companies' })
      .single();
    
    if (schemaError) {
      console.log('Не удалось получить схему через RPC, пробуем другой способ...');
      
      // Альтернативный способ - проверяем через информационную схему
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'companies')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.log('Не удалось получить информацию о колонках');
      } else {
        console.log('Колонки таблицы companies:');
        columns?.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    } else {
      console.log('Схема таблицы:', schema);
    }
    
  } catch (err) {
    console.error('Критическая ошибка:', err);
  }
}

debugRegionIssue();