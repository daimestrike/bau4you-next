/**
 * Форматирует цену товара с поддержкой "По запросу" для цены 0
 * @param price - цена товара
 * @param unit - единица измерения (опционально)
 * @returns отформатированная строка цены
 */
export function formatPrice(price: number, unit?: string): string {
  if (price === 0) {
    return 'По запросу'
  }
  
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(price)
  
  if (unit) {
    return `${formattedPrice} за ${unit}`
  }
  
  return formattedPrice
}

/**
 * Форматирует цену товара без валюты с поддержкой "По запросу" для цены 0
 * @param price - цена товара
 * @returns отформатированная строка цены
 */
export function formatPriceSimple(price: number): string {
  if (price === 0) {
    return 'По запросу'
  }
  
  return `${price.toLocaleString('ru-RU')} ₽`
} 