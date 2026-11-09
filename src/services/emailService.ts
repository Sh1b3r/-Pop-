import { CartItem, SupportedCurrency } from '../types';

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: CartItem[];
  totalFormatted: string;
  currency: SupportedCurrency;
  paymentMethod: string;
  createdAt: string;
}

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  orderId: string;
  sentAt: string;
  htmlContent: string;
  status: 'delivered' | 'simulated';
}

/**
 * Service to handle sending order confirmation emails
 */
export async function sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<SentEmailRecord> {
  const itemsHtml = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <strong>${item.product.title}</strong> (${item.product.subtitle})
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity} шт.
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
          ${item.product.regionalPricing?.[orderData.currency === 'UAH' ? 'UA' : orderData.currency === 'EUR' ? 'EU' : 'US']?.price || item.product.basePriceUSD} ${orderData.currency}
        </td>
      </tr>
    `
    )
    .join('');

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eaeaea; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #182030 0%, #0d121c 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 0.05em;">
          POP! <span style="color: #FF6B00;">SHOP</span>
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.7;">
          Підтвердження замовлення #${orderData.orderId}
        </p>
      </div>

      <div style="padding: 28px 24px; color: #333333;">
        <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #111111;">
          Вітаємо, ${orderData.customerName}! 🎉
        </h2>
        <p style="font-size: 14px; line-height: 1.5; color: #555555; margin: 0 0 20px 0;">
          Дякуємо за покупку в POP! Shop. Ваше замовлення успішно оплачено та передано на склад для комплектації та доставки.
        </p>

        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
          <table style="width: 100%; font-size: 13px; line-height: 1.6;">
            <tr>
              <td style="color: #64748b;">Номер замовлення:</td>
              <td style="text-align: right; font-weight: bold; color: #FF6B00; font-family: monospace;">#${orderData.orderId}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Дата оформлення:</td>
              <td style="text-align: right; font-weight: bold;">${new Date(orderData.createdAt).toLocaleString('uk-UA')}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Спосіб оплати:</td>
              <td style="text-align: right; font-weight: bold;">${orderData.paymentMethod} (Оплачено)</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Email клієнта:</td>
              <td style="text-align: right; font-weight: bold;">${orderData.customerEmail}</td>
            </tr>
          </table>
        </div>

        <h3 style="font-size: 15px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
          Склад замовлення:
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="color: #94a3b8; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding-bottom: 8px;">Товар</th>
              <th style="padding-bottom: 8px; text-align: center;">К-ть</th>
              <th style="padding-bottom: 8px; text-align: right;">Сума</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 16px;">
            <tr>
              <td style="font-weight: 900; color: #111111;">Разом до сплати:</td>
              <td style="text-align: right; font-weight: 900; color: #FF6B00; font-size: 20px;">
                ${orderData.totalFormatted}
              </td>
            </tr>
          </table>
        </div>

        <div style="background: #fff7ed; border-left: 4px solid #FF6B00; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #9a3412;">
          📦 <strong>Швидка доставка:</strong> Ми надішлемо номер ТТН для відстеження посилки одразу після відправки.
        </div>
      </div>

      <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        POP! Shop © 2026 — Ліцензійні вінілові колекції Funko POP!<br>
        Якщо у вас виникли запитання, напишіть нам на support@popshop.com
      </div>
    </div>
  `;

  // Try real webhook dispatch (Web3Forms/Formspree) if online, otherwise fallback gracefully
  let dispatchStatus: 'delivered' | 'simulated' = 'simulated';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        access_key: 'b9ec8b78-0056-4c28-89c0-6d42e05cb025', // Public notification relay key
        subject: `[POP! SHOP] Чек замовлення #${orderData.orderId}`,
        from_name: 'POP! Shop Gateway',
        to_email: orderData.customerEmail,
        message: `Нове замовлення #${orderData.orderId} від ${orderData.customerName} (${orderData.customerEmail}) на суму ${orderData.totalFormatted}`,
        order_details_html: emailHtml
      })
    });

    if (response.ok) {
      dispatchStatus = 'delivered';
    }
  } catch (err) {
    // Graceful offline/mock fallback
    dispatchStatus = 'simulated';
  }

  const record: SentEmailRecord = {
    id: `email_${Date.now()}`,
    to: orderData.customerEmail,
    subject: `Підтвердження замовлення #${orderData.orderId} від POP! Shop`,
    orderId: orderData.orderId,
    sentAt: new Date().toISOString(),
    htmlContent: emailHtml,
    status: dispatchStatus
  };

  // Save to persistent sent emails store
  try {
    const existing = JSON.parse(localStorage.getItem('pop_shop_sent_emails') || '[]');
    existing.unshift(record);
    localStorage.setItem('pop_shop_sent_emails', JSON.stringify(existing.slice(0, 30)));
  } catch (e) {
    console.error('Failed to store sent email', e);
  }

  return record;
}

