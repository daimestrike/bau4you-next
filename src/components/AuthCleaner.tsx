'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCleaner() {
  useEffect(() => {
    const clearInvalidTokens = async () => {
      try {
        // Проверяем текущую сессию
        const { error } = await supabase.auth.getSession();
        
        if (error && (
          error.message?.includes('Invalid Refresh Token') || 
          error.message?.includes('Refresh Token Not Found') ||
          error.message?.includes('refresh_token_not_found')
        )) {
          console.log('Detected invalid refresh token, clearing auth data...');
          
          // Очищаем все Supabase данные из localStorage
          if (typeof window !== 'undefined') {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.startsWith('sb-') || key.includes('supabase')) {
                localStorage.removeItem(key);
              }
            });
          }
          
          // Принудительно выходим из системы
          await supabase.auth.signOut({ scope: 'local' });
          
          console.log('Auth data cleared successfully');
        }
      } catch (error) {
        console.error('Error during auth validation:', error);
        
        // В случае критической ошибки также очищаем данные
        if (typeof window !== 'undefined') {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch (signOutError) {
          console.error('Error during signOut:', signOutError);
        }
      }
    };

    // Вызываем очистку при первой загрузке
    clearInvalidTokens();

    // Подписываемся на изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing local storage');
        if (typeof window !== 'undefined') {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null; // Этот компонент не рендерит ничего видимого
} 