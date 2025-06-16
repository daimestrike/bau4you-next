const { createClient } = require('@supabase/supabase-js');

// Используем сервисный ключ для админских операций
const supabaseUrl = 'https://gcbwqqwmqjolxxrvfbzz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaHdxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjE5NjMxNSwiZXhwIjoyMDQ3NzcyMzE1fQ.lOVKM5WjEGr7YPMvGD9xTQYo8FT-g1rDnWMvpP3Lzxo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function findUser() {
  try {
    console.log('🔍 Ищем пользователя...');
    
    // Попробуем найти в таблице profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profilesError) {
      console.log('❌ Ошибка поиска в profiles:', profilesError.message);
    } else {
      console.log('👥 Найдено профилей:', profiles.length);
      profiles.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Email: ${profile.email || 'no email'}`);
      });
      
      // Ищем конкретного пользователя
      const targetUser = profiles.find(p => p.email === 'd.birykov164@mail.ru');
      if (targetUser) {
        console.log('✅ Найден пользователь:', targetUser.id);
        return targetUser.id;
      }
    }
    
    console.log('❌ Пользователь d.birykov164@mail.ru не найден');
    return null;
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

findUser(); 