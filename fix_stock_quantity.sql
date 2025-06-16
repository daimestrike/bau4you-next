-- Исправление проблемы с отображением наличия товаров
-- Этот скрипт обновляет товары, у которых stock_quantity равно NULL или 0,
-- устанавливая им значение по умолчанию

-- Обновляем товары с NULL stock_quantity
UPDATE products 
SET stock_quantity = 1 
WHERE stock_quantity IS NULL;

-- Для демонстрации: обновляем товары с 0 stock_quantity на 1
-- (только если они должны быть в наличии)
UPDATE products 
SET stock_quantity = 1 
WHERE stock_quantity = 0 AND status = 'active';

-- Проверяем результат
SELECT id, name, stock_quantity, status 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;