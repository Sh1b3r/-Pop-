import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

function telegramOrdersPlugin(env) {
  const ordersFile = resolve('bot/orders.jsonl');
  const telegramApi = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

  return {
    name: 'pop-shop-telegram-orders',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/api/orders') return next();
        if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) {
          res.statusCode = 503;
          res.end(JSON.stringify({ error: 'Telegram bot is not configured.' }));
          return;
        }

        try {
          let raw = '';
          for await (const chunk of req) {
            raw += chunk;
            if (raw.length > 64_000) throw new Error('Order payload is too large.');
          }
          const input = JSON.parse(raw);
          const customerName = String(input.customer?.name || '').trim().slice(0, 120);
          const customerEmail = String(input.customer?.email || '').trim().slice(0, 200);
          const customerPhone = String(input.customer?.phone || '').trim().slice(0, 60);
          const customerAddress = String(input.customer?.address || '').trim().slice(0, 300);
          const currency = ['UAH', 'EUR', 'USD'].includes(input.currency) ? input.currency : 'UAH';
          const items = Array.isArray(input.items) ? input.items.slice(0, 30).map((item) => ({
            id: String(item.id || '').slice(0, 100),
            title: String(item.title || '').slice(0, 160),
            quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1))),
            unitPrice: Number(item.unitPrice)
          })) : [];
          if (!input.orderId || !customerName || !customerPhone || !customerAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || !items.length
            || items.some((item) => !item.id || !item.title || !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid order details.' }));
            return;
          }

          const orders = await readFile(ordersFile, 'utf8').catch((error) => error.code === 'ENOENT' ? '' : Promise.reject(error));
          const allOrders = orders.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
          let order = allOrders.find((entry) => entry.clientOrderId === input.orderId);
          if (!order) {
            order = {
              id: `WEB-${String(input.orderId).replace(/[^a-zA-Z0-9-]/g, '').slice(-24)}`,
              clientOrderId: String(input.orderId).slice(0, 80),
              source: 'website', createdAt: new Date().toISOString(), chatId: null, status: 'new',
              paymentStatus: 'pending', paymentMethod: String(input.paymentMethod || 'Website checkout').slice(0, 80),
              currency, customer: { name: customerName, email: customerEmail, phone: customerPhone, address: customerAddress },
              items, totalUAH: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            };
            await mkdir(dirname(ordersFile), { recursive: true });
            await appendFile(ordersFile, `${JSON.stringify(order)}\n`, 'utf8');
          }

          const money = (amount) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency }).format(amount);
          const itemLines = order.items.map((item) => `• ${item.title} × ${item.quantity} — ${money(item.unitPrice * item.quantity)}`).join('\n');
          const message = `🌐 Замовлення із сайту ${order.id}\nОплата: ${order.paymentMethod} (сайт не підтвердив транзакцію)\n\n${itemLines}\n\nРазом: ${money(order.totalUAH)}\nПокупець: ${order.customer.name}\nТелефон: ${order.customer.phone}\nEmail: ${order.customer.email}\nДоставка: ${order.customer.address}`;
          const telegramResponse = await fetch(`${telegramApi}/sendMessage`, {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ chat_id: env.TELEGRAM_ADMIN_CHAT_ID, text: message, reply_markup: { inline_keyboard: [[{ text: '📂 Открыть заказ', callback_data: `order:${order.id}` }], [{ text: '🛠 Панель менеджера', callback_data: 'manager' }]] } })
          });
          const telegramResult = await telegramResponse.json();
          if (!telegramResult.ok) throw new Error(telegramResult.description || 'Telegram notification failed.');

          res.statusCode = 201;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true, orderId: order.id }));
        } catch (error) {
          console.error('Website order delivery failed:', error);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'Не удалось передать заказ в Telegram. Попробуйте ещё раз.' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react(), telegramOrdersPlugin(env)],
  server: {
    port: 3000,
    open: true
  }
  };
});

