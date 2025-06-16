const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcbwqqwmqjolxxrvfbzz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaHdxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxOTYzMTUsImV4cCI6MjA0Nzc3MjMxNX0.JKPe1VIVZd0l2CZPfnF_Z9g01dQC2JMyoLqnUE7vhNw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findRealUser() {
  try {
    console.log('🔍 Ищем реального пользователя...');
    
    // Пробуем найти в companies таблице существующих owner_id
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('owner_id')
      .limit(5);
    
    if (!companiesError && companies && companies.length > 0) {
      console.log('📋 Найдены существующие owner_id в companies:');
      companies.forEach((company, index) => {
        console.log(`  ${index + 1}. ${company.owner_id}`);
      });
      
      // Используем первый найденный owner_id
      const existingOwnerId = companies[0].owner_id;
      console.log(`✅ Будем использовать существующий owner_id: ${existingOwnerId}`);
      return existingOwnerId;
    }
    
    console.log('❌ Не удалось найти существующие компании');
    return null;
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
    return null;
  }
}

findRealUser().then(ownerId => {
  if (ownerId) {
    console.log(`\n🎯 Используйте этот owner_id в API: ${ownerId}`);
  }
}); 