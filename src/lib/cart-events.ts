// Утилиты для работы с событиями корзины

// Отправляет событие обновления корзины
export const emitCartUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
}

// Отправляет событие добавления товара в корзину
export const emitCartItemAdded = (productId: string, quantity: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartItemAdded', {
      detail: { productId, quantity }
    }))
  }
}

// Отправляет событие удаления товара из корзины
export const emitCartItemRemoved = (productId: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartItemRemoved', {
      detail: { productId }
    }))
  }
}

// Отправляет событие очистки корзины
export const emitCartCleared = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartCleared'))
  }
} 