const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcbwqqwmqjolxxrvfbzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA2OTUsImV4cCI6MjA2NDQ1NjY5NX0.l4MmmUaF6YmNRRcorzdx_YdgQZerqqoS86N_T3TX7io';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRegions() {
  try {
    console.log('Проверяем таблицу regions...');
    
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Ошибка при получении регионов:', error);
      return;
    }
    
    console.log('Найдено регионов:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('Первые несколько регионов:');
      data.forEach((region, index) => {
        console.log(`${index + 1}. ID: ${region.id}, Название: ${region.name}`);
      });
    } else {
      console.log('Таблица regions пуста!');
      console.log('Нужно выполнить миграцию для добавления данных регионов.');
    }
    
  } catch (err) {
    console.error('Критическая ошибка:', err);
  }
}

checkRegions();