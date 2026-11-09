import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
const paymentProviderToken = process.env.TELEGRAM_PAYMENT_PROVIDER_TOKEN;
const api = `https://api.telegram.org/bot${token}`;
const products = JSON.parse(await readFile(resolve(root, 'catalog.json'), 'utf8'));
const sessions = new Map();
const ordersFile = resolve(root, 'orders.jsonl');

if (!token) throw new Error('Укажите TELEGRAM_BOT_TOKEN в .env (токен от @BotFather).');
if (!adminChatId) throw new Error('Укажите TELEGRAM_ADMIN_CHAT_ID в .env, чтобы получать новые заказы.');

const rubrics = { marvel: 'Marvel', disney: 'Disney' };
const money = (amount, currency = 'UAH') => new Intl.NumberFormat('uk-UA', { style: 'currency', currency }).format(amount);
const sessionFor = (id) => {
  if (!sessions.has(id)) sessions.set(id, { cart: {}, step: null });
  return sessions.get(id);
};

async function telegram(method, body) {
  const response = await fetch(`${api}/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
  });
  const result = await response.json();
  if (!result.ok) throw new Error(`Telegram ${method}: ${result.description}`);
  return result.result;
}

const send = (chatId, text, options = {}) => telegram('sendMessage', { chat_id: chatId, text, ...options });
async function sendProductPhoto(chatId, product, caption, options = {}) {
  if (/^https?:\/\//i.test(product.image)) {
    return telegram('sendPhoto', { chat_id: chatId, photo: product.image, caption, ...options });
  }
  const publicRoot = resolve(root, '..', 'public');
  const imagePath = resolve(publicRoot, String(product.image || '').replace(/^[/\\]+/, ''));
  if (!imagePath.startsWith(`${publicRoot}${sep}`)) throw new Error('Путь к фото товара выходит за каталог public.');

  const image = await readFile(imagePath);
  const form = new FormData();
  form.append('chat_id', String(chatId));
  form.append('photo', new Blob([image]), basename(imagePath));
  form.append('caption', caption);
  if (options.reply_markup) form.append('reply_markup', JSON.stringify(options.reply_markup));
  const response = await fetch(`${api}/sendPhoto`, { method: 'POST', body: form });
  const result = await response.json();
  if (!result.ok) throw new Error(`Telegram sendPhoto: ${result.description}`);
  return result.result;
}
const keyboard = (rows) => ({ inline_keyboard: rows });
const homeKeyboard = keyboard([
  [{ text: '🛍 Каталог', callback_data: 'catalog:0' }, { text: '🧺 Корзина', callback_data: 'cart' }],
  [{ text: 'ℹ️ О магазине', callback_data: 'about' }]
]);

const ORDER_STATUSES = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  packing: 'Собирается',
  shipped: 'Отправлен',
  completed: 'Завершён',
  cancelled: 'Отменён'
};

async function readOrders() {
  try {
    return (await readFile(ordersFile, 'utf8')).split(/\r?\n/).filter(Boolean)
      .map((line) => ({ status: 'new', ...JSON.parse(line) }));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeOrders(orders) {
  await mkdir(dirname(ordersFile), { recursive: true });
  await writeFile(ordersFile, `${orders.map((item) => JSON.stringify(item)).join('\n')}\n`, 'utf8');
}

function orderLines(order) {
  return order.items.map((item) => `• ${item.title} × ${item.quantity} — ${money((item.unitPrice ?? item.unitPriceUAH) * item.quantity, order.currency || 'UAH')}`).join('\n');
}

function paymentLabel(order) {
  if (order.paymentStatus === 'paid') return 'Оплачено онлайн';
  if (order.paymentStatus === 'pending' && order.source === 'website') return `${order.paymentMethod || 'Оплата на сайте'} · не подтверждена`;
  if (order.paymentStatus === 'pending') return 'Ожидает онлайн-оплаты';
  return 'Наложенный платёж';
}

async function notifyManager(order) {
  const customer = `${order.customer.name}${order.customer.phone ? `, ${order.customer.phone}` : ''}`;
  return send(adminChatId, `🛎 Новый заказ ${order.id}\n\n${orderLines(order)}\n\nИтого: ${money(order.totalAmount ?? order.totalUAH, order.currency || 'UAH')}\nОплата: ${paymentLabel(order)}\nПокупатель: ${customer}${order.customer.email ? ` · ${order.customer.email}` : ''}\nДоставка: ${order.customer.address}${order.chatId ? `\nTelegram chat ID: ${order.chatId}` : ''}`, {
    reply_markup: keyboard([
      [{ text: '📂 Открыть заказ', callback_data: `order:${order.id}` }],
      [{ text: '🛠 Панель менеджера', callback_data: 'manager' }]
    ])
  });
}

const isManager = (chatId) => String(chatId) === String(adminChatId);

async function showManagerMenu(chatId) {
  if (!isManager(chatId)) return send(chatId, 'Доступ к панели менеджера закрыт.');
  const orders = await readOrders();
  const newCount = orders.filter((order) => (order.status || 'new') === 'new').length;
  return send(chatId, `🛠 Панель менеджера POP! Shop\nЗаказов: ${orders.length} · новых: ${newCount}`, {
    reply_markup: keyboard([
      [{ text: `📋 Все заказы (${orders.length})`, callback_data: 'orders' }],
      [{ text: `🆕 Новые (${newCount})`, callback_data: 'orders:new' }]
    ])
  });
}

async function showOrders(chatId, filter = 'all') {
  if (!isManager(chatId)) return send(chatId, 'Доступ к заказам закрыт.');
  const allOrders = await readOrders();
  const orders = allOrders.filter((order) => filter === 'all' || (order.status || 'new') === filter).slice(-10).reverse();
  if (!orders.length) return send(chatId, 'Заказов в этом списке пока нет.', {
    reply_markup: keyboard([[{ text: '🛠 Панель менеджера', callback_data: 'manager' }]])
  });
  const rows = orders.map((order) => [{
    text: `${order.id} · ${order.customer?.name || 'Покупатель'} · ${ORDER_STATUSES[order.status || 'new'] || 'Новый'}`,
    callback_data: `order:${order.id}`
  }]);
  rows.push([{ text: '🛠 Панель менеджера', callback_data: 'manager' }]);
  return send(chatId, `${filter === 'new' ? 'Новые заказы' : 'Последние заказы'} (до 10):`, { reply_markup: keyboard(rows) });
}

async function showOrder(chatId, orderId) {
  if (!isManager(chatId)) return send(chatId, 'Доступ к заказу закрыт.');
  const order = (await readOrders()).find((item) => item.id === orderId);
  if (!order) return send(chatId, 'Заказ не найден. Обновите список заказов.');
  const lines = orderLines(order);
  const date = new Date(order.createdAt).toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
  return send(chatId, `🧾 ${order.id}\nСтатус: ${ORDER_STATUSES[order.status || 'new'] || 'Новый'}\nОплата: ${paymentLabel(order)}\nДата: ${date}\n\n${lines}\n\nСума: ${money(order.totalAmount ?? order.totalUAH, order.currency || 'UAH')}\nПокупатель: ${order.customer.name}${order.customer.phone ? ` · ${order.customer.phone}` : ''}${order.customer.email ? ` · ${order.customer.email}` : ''}\nДоставка: ${order.customer.address}${order.chatId ? `\nTelegram ID покупателя: ${order.chatId}` : ''}`, {
    reply_markup: keyboard([
      [{ text: '✅ Подтвердить', callback_data: `status:${order.id}:confirmed` }, { text: '📦 В сборке', callback_data: `status:${order.id}:packing` }],
      [{ text: '🚚 Отправлен', callback_data: `status:${order.id}:shipped` }, { text: '🏁 Завершён', callback_data: `status:${order.id}:completed` }],
      [{ text: '❌ Отменён', callback_data: `status:${order.id}:cancelled` }],
      [{ text: '← Заказы', callback_data: 'orders' }, { text: '🛠 Панель', callback_data: 'manager' }]
    ])
  });
}

async function changeOrderStatus(managerChatId, orderId, nextStatus) {
  if (!isManager(managerChatId)) return send(managerChatId, 'Доступ к заказам закрыт.');
  if (!ORDER_STATUSES[nextStatus]) return send(managerChatId, 'Неизвестный статус заказа.');
  const orders = await readOrders();
  const order = orders.find((item) => item.id === orderId);
  if (!order) return send(managerChatId, 'Заказ не найден.');
  order.status = nextStatus;
  await writeFile(ordersFile, `${orders.map((item) => JSON.stringify(item)).join('\n')}\n`, 'utf8');
  if (order.chatId) await send(order.chatId, `Статус заказа ${order.id}: ${ORDER_STATUSES[nextStatus]}.`).catch((error) => {
    console.warn(`Не удалось уведомить покупателя по заказу ${order.id}:`, error.message);
  });
  return showOrder(managerChatId, orderId);
}

async function showCatalog(chatId, page = 0) {
  const pageSize = 5;
  const visible = products.slice(page * pageSize, page * pageSize + pageSize);
  const rows = visible.map((product) => [{
    text: `${product.title} · ${money(product.regionalPricing.UA.price)}`,
    callback_data: `product:${product.id}`
  }]);
  const nav = [];
  if (page > 0) nav.push({ text: '← Назад', callback_data: `catalog:${page - 1}` });
  if ((page + 1) * pageSize < products.length) nav.push({ text: 'Далее →', callback_data: `catalog:${page + 1}` });
  if (nav.length) rows.push(nav);
  rows.push([{ text: '🧺 Корзина', callback_data: 'cart' }, { text: '🏠 Меню', callback_data: 'home' }]);
  await send(chatId, 'Выберите фигурку из каталога POP! Shop:', { reply_markup: keyboard(rows) });
}

async function showProduct(chatId, id) {
  const product = products.find((item) => item.id === id);
  if (!product) return send(chatId, 'Не нашёл этот товар. Откройте каталог ещё раз.');
  await sendProductPhoto(chatId, product,
    `✨ ${product.title} — Funko POP! ${product.popNumber}\n${product.description}\nЦена: ${money(product.regionalPricing.UA.price)}`,
    { reply_markup: keyboard([
      [{ text: '➕ Добавить в корзину', callback_data: `add:${product.id}` }],
      [{ text: '🛍 К каталогу', callback_data: 'catalog:0' }, { text: '🧺 Корзина', callback_data: 'cart' }]
    ]) });
}

function cartSummary(session) {
  const lines = products.filter((item) => session.cart[item.id]).map((item) => {
    const quantity = session.cart[item.id];
    return `• ${item.title} × ${quantity} — ${money(item.regionalPricing.UA.price * quantity)}`;
  });
  const total = products.reduce((sum, item) => sum + (item.regionalPricing.UA.price * (session.cart[item.id] || 0)), 0);
  return { lines, total };
}

async function showCart(chatId, session) {
  const { lines, total } = cartSummary(session);
  if (!lines.length) return send(chatId, 'Корзина пока пустая. Загляните в каталог! 🛍', { reply_markup: homeKeyboard });
  await send(chatId, `Ваша корзина:\n\n${lines.join('\n')}\n\nИтого: ${money(total)}`, {
    reply_markup: keyboard([
      [{ text: '✅ Оформить заказ', callback_data: 'checkout' }],
      [{ text: '🛍 Продолжить покупки', callback_data: 'catalog:0' }, { text: '🗑 Очистить', callback_data: 'clear' }]
    ])
  });
}

async function handleCallback(query) {
  const chatId = query.message.chat.id;
  const session = sessionFor(chatId);
  const [action, value, extra] = (query.data || '').split(':');
  await telegram('answerCallbackQuery', { callback_query_id: query.id });
  if (action === 'manager') return showManagerMenu(chatId);
  if (action === 'orders') return showOrders(chatId, value === 'new' ? 'new' : 'all');
  if (action === 'order') return showOrder(chatId, value);
  if (action === 'status') return changeOrderStatus(chatId, value, extra);
  if (action === 'home') return send(chatId, 'Чем помочь? Выберите действие:', { reply_markup: homeKeyboard });
  if (action === 'catalog') return showCatalog(chatId, Number(value) || 0);
  if (action === 'product') return showProduct(chatId, value);
  if (action === 'add') {
    session.cart[value] = (session.cart[value] || 0) + 1;
    const product = products.find((item) => item.id === value);
    return send(chatId, `${product.title} добавлен в корзину 🧡`, { reply_markup: keyboard([
      [{ text: '🧺 Перейти в корзину', callback_data: 'cart' }, { text: '🛍 К каталогу', callback_data: 'catalog:0' }]
    ]) });
  }
  if (action === 'cart') return showCart(chatId, session);
  if (action === 'clear') { session.cart = {}; return showCart(chatId, session); }
  if (action === 'about') return send(chatId, 'POP! Shop — магазин коллекционных Funko POP! 🧡\nВыберите товары в каталоге и оформите заказ прямо здесь.', { reply_markup: homeKeyboard });
  if (action === 'cancel') {
    session.step = null;
    session.customer = null;
    return send(chatId, 'Оформление отменено, корзина сохранена.', { reply_markup: homeKeyboard });
  }
  if (action === 'checkout') {
    if (!Object.keys(session.cart).length) return showCart(chatId, session);
    session.step = 'contact';
    return send(chatId, 'Как к вам обращаться? Напишите имя и номер телефона одним сообщением или нажмите кнопку, чтобы поделиться номером.', {
      reply_markup: { keyboard: [[{ text: '📱 Поделиться номером телефона', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true }
    });
  }
  if (action === 'confirm') return placeOrder(chatId, session);
  if (action === 'pay_online') return createOnlineOrder(chatId, session);
  if (action === 'pay_cod') return placeOrder(chatId, session, 'cod');
}

function buildOrder(chatId, session, paymentStatus) {
  if (!session.cart || !Object.keys(session.cart).length) return send(chatId, 'Корзина пуста. Откройте каталог, чтобы выбрать товары.', { reply_markup: homeKeyboard });
  const { total } = cartSummary(session);
  return {
    id: `POP-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(), chatId,
    status: 'new',
    paymentStatus,
    customer: session.customer,
    items: products.filter((item) => session.cart[item.id]).map((item) => ({ id: item.id, title: item.title, quantity: session.cart[item.id], unitPriceUAH: item.regionalPricing.UA.price })),
    totalUAH: total
  };
}

async function clearCheckout(chatId, session, message) {
  session.cart = {};
  session.step = null;
  session.customer = null;
  return send(chatId, message, {
    reply_markup: { remove_keyboard: true }
  }).then(() => send(chatId, 'Что будем искать дальше?', { reply_markup: homeKeyboard }));
}

async function placeOrder(chatId, session, method = 'cod') {
  if (!session.customer || !Object.keys(session.cart || {}).length) return send(chatId, 'Сначала заполните данные заказа через корзину.');
  const order = buildOrder(chatId, session, method === 'cod' ? 'cod' : 'paid');
  await appendFile(ordersFile, `${JSON.stringify(order)}\n`, 'utf8');
  await notifyManager(order);
  return clearCheckout(chatId, session, `Спасибо! Заказ ${order.id} принят 🧡\nОплата при получении. Менеджер POP! Shop свяжется с вами для подтверждения.`);
}

async function createOnlineOrder(chatId, session) {
  if (!paymentProviderToken) return send(chatId, 'Онлайн-оплата пока не подключена. Выберите оплату при получении или напишите менеджеру.', {
    reply_markup: keyboard([[{ text: '💵 Оплата при получении', callback_data: 'pay_cod' }], [{ text: '🛠 Связаться с магазином', callback_data: 'about' }]])
  });
  if (!session.customer || !Object.keys(session.cart || {}).length) return send(chatId, 'Сначала заполните данные заказа через корзину.');
  const order = buildOrder(chatId, session, 'pending');
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
  try {
    await telegram('sendInvoice', {
      chat_id: chatId,
      title: `Заказ POP! Shop ${order.id}`,
      description: order.items.map((item) => `${item.title} × ${item.quantity}`).join(', ').slice(0, 255),
      payload: order.id,
      provider_token: paymentProviderToken,
      currency: 'UAH',
      prices: order.items.map((item) => ({ label: `${item.title} × ${item.quantity}`, amount: Math.round(item.unitPriceUAH * item.quantity * 100) })),
      start_parameter: order.id.toLowerCase()
    });
    session.cart = {};
    session.step = null;
    session.customer = null;
  } catch (error) {
    await writeOrders(orders.filter((item) => item.id !== order.id));
    throw error;
  }
}

async function handlePreCheckout(query) {
  const order = (await readOrders()).find((item) => item.id === query.invoice_payload);
  const valid = order && String(order.chatId) === String(query.from.id) && order.paymentStatus === 'pending'
    && query.currency === 'UAH' && query.total_amount === Math.round(order.totalUAH * 100);
  return telegram('answerPreCheckoutQuery', {
    pre_checkout_query_id: query.id,
    ok: Boolean(valid),
    ...(!valid ? { error_message: 'Заказ не найден или сумма изменилась. Оформите его заново.' } : {})
  });
}

async function handleSuccessfulPayment(message) {
  const payment = message.successful_payment;
  const orders = await readOrders();
  const order = orders.find((item) => item.id === payment.invoice_payload && String(item.chatId) === String(message.chat.id));
  if (!order) return send(message.chat.id, 'Платёж получен, но заказ не найден. Напишите менеджеру, указав ваш Telegram ID.');
  if (order.paymentStatus !== 'paid') {
    if (payment.currency !== 'UAH' || payment.total_amount !== Math.round(order.totalUAH * 100)) return send(message.chat.id, 'Сумма платежа не совпала с заказом. Напишите менеджеру.');
    order.paymentStatus = 'paid';
    order.telegramPaymentChargeId = payment.telegram_payment_charge_id;
    order.providerPaymentChargeId = payment.provider_payment_charge_id;
    await writeOrders(orders);
    await notifyManager(order);
  }
  return send(message.chat.id, `Оплата получена 🧡 Заказ ${order.id} передан менеджеру POP! Shop.`);
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const session = sessionFor(chatId);
  const text = (message.text || '').trim();
  if (text === '/manager' || text === '/admin') return showManagerMenu(chatId);
  if (text === '/orders') return showOrders(chatId);
  if (text === '/start' || text === '/menu') {
    session.step = null;
    return send(chatId, 'Привет! Это POP! Shop 🧡\nПомогу выбрать фигурку и оформить заказ.', { reply_markup: homeKeyboard });
  }
  if (text === '/cancel') {
    session.step = null;
    session.customer = null;
    return send(chatId, 'Оформление заказа отменено.', { reply_markup: { remove_keyboard: true } }).then(() => send(chatId, 'Выберите действие:', { reply_markup: homeKeyboard }));
  }
  if (session.step === 'contact') {
    const contact = message.contact;
    session.customer = { name: contact?.first_name || text.slice(0, 100), phone: contact?.phone_number || '' };
    session.step = 'address';
    return send(chatId, 'Укажите город и адрес или номер отделения/почтомата Новой Почты.', { reply_markup: { remove_keyboard: true } });
  }
  if (session.step === 'address') {
    if (!text || text.length < 4) return send(chatId, 'Напишите город и адрес доставки, пожалуйста.');
    session.customer.address = text.slice(0, 300);
    session.step = 'confirm';
    const { lines, total } = cartSummary(session);
    return send(chatId, `Проверьте заказ:\n\n${lines.join('\n')}\n\nИтого: ${money(total)}\nПолучатель: ${session.customer.name}${session.customer.phone ? `, ${session.customer.phone}` : ''}\nДоставка: ${session.customer.address}`, {
      reply_markup: keyboard([
        [{ text: '💳 Оплатить онлайн', callback_data: 'pay_online' }],
        [{ text: '📦 Оплата при получении', callback_data: 'pay_cod' }],
        [{ text: '❌ Отменить', callback_data: 'cancel' }]
      ])
    });
  }
  if (text) return send(chatId, 'Нажмите кнопку меню — помогу найти фигурку или оформить заказ.', { reply_markup: homeKeyboard });
}

let offset = 0;
console.log('POP! Shop bot запущен.');
while (true) {
  try {
    const updates = await telegram('getUpdates', { offset, timeout: 50, allowed_updates: ['message', 'callback_query', 'pre_checkout_query'] });
    for (const update of updates) {
      offset = update.update_id + 1;
      try {
        if (update.pre_checkout_query) await handlePreCheckout(update.pre_checkout_query);
        else if (update.message?.successful_payment) await handleSuccessfulPayment(update.message);
        else if (update.callback_query) await handleCallback(update.callback_query);
        else if (update.message) await handleMessage(update.message);
      } catch (error) {
        console.error('Не удалось обработать сообщение:', error);
        const chatId = update.callback_query?.message?.chat.id || update.message?.chat.id || update.pre_checkout_query?.from.id;
        if (chatId) await send(chatId, 'Не получилось обработать запрос. Попробуйте ещё раз или напишите /start.').catch(() => {});
      }
    }
  } catch (error) {
    console.error(error);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
