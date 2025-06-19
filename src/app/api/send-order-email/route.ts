import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Здесь должна быть интеграция с email сервисом (например, SendGrid, Resend, или Nodemailer)
    // Пока что просто логируем данные и возвращаем успех
    
    console.log('📧 Отправка email уведомления поставщику:', {
      to: orderData.seller.email,
      subject: `Новый заказ от ${orderData.buyer.name}`,
      orderData
    })

    // Формируем HTML письма
    const emailHTML = generateOrderEmailHTML(orderData)
    
    // TODO: Интеграция с email сервисом
    // Например, с Resend:
    // const { data, error } = await resend.emails.send({
    //   from: 'orders@bau4you.com',
    //   to: orderData.seller.email,
    //   subject: `Новый заказ от ${orderData.buyer.name}`,
    //   html: emailHTML,
    // })

    // Пока что возвращаем успех
    return NextResponse.json({ 
      success: true, 
      message: 'Email отправлен успешно',
      emailPreview: emailHTML 
    })

  } catch (error) {
    console.error('Ошибка отправки email:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка отправки email' },
      { status: 500 }
    )
  }
}

function generateOrderEmailHTML(orderData: any) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Новый заказ</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .order-item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        .total { font-weight: bold; font-size: 18px; color: #059669; }
        .contact-info { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Новый заказ на Bau4You</h1>
        </div>
        
        <div class="content">
          <h2>Здравствуйте, ${orderData.seller.name}!</h2>
          <p>Вы получили новый заказ от покупателя <strong>${orderData.buyer.name}</strong>.</p>
          
          <div class="contact-info">
            <h3>📞 Контактная информация покупателя:</h3>
            <p><strong>Имя:</strong> ${orderData.buyer.name}</p>
            <p><strong>Email:</strong> ${orderData.buyer.email}</p>
            <p><strong>Телефон:</strong> ${orderData.buyer.phone}</p>
            ${orderData.buyer.company ? `<p><strong>Компания:</strong> ${orderData.buyer.company}</p>` : ''}
            <p><strong>Предпочтительный способ связи:</strong> ${orderData.buyer.preferred_contact === 'email' ? 'Email' : 'Телефон'}</p>
          </div>

          <h3>📦 Заказанные товары:</h3>
          ${orderData.items.map((item: any) => `
            <div class="order-item">
              <strong>${item.name}</strong><br>
              Количество: ${item.quantity} шт.<br>
              Цена за единицу: ${formatPrice(item.price)}<br>
              Итого: ${formatPrice(item.total)}
            </div>
          `).join('')}
          
          <div class="order-item total">
            Общая сумма заказа: ${formatPrice(orderData.total_amount)}
          </div>

          <div class="contact-info">
            <h3>🚚 Адрес доставки:</h3>
            <p>${orderData.delivery_address}</p>
          </div>

          ${orderData.message ? `
            <div class="contact-info">
              <h3>💬 Комментарий к заказу:</h3>
              <p>${orderData.message}</p>
            </div>
          ` : ''}

          <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px;">
            <h3>⚡ Что делать дальше:</h3>
            <ol>
              <li>Свяжитесь с покупателем по указанным контактам</li>
              <li>Уточните детали заказа и доставки</li>
              <li>Согласуйте сроки и стоимость доставки</li>
              <li>Подтвердите заказ и приступайте к выполнению</li>
            </ol>
          </div>
        </div>

        <div class="footer">
          <p>Это автоматическое уведомление с платформы Bau4You</p>
          <p>Если у вас есть вопросы, обратитесь в службу поддержки</p>
        </div>
      </div>
    </body>
    </html>
  `
} 