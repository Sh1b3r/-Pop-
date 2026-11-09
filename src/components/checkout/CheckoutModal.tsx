import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { usePricing } from '../../context/PricingContext';
import { useAuth } from '../../context/AuthContext';
import { TransactionStatus } from '../../types';
import { sendOrderConfirmationEmail, SentEmailRecord } from '../../services/emailService';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Lock,
  Loader2,
  Smartphone,
  Mail,
  Eye,
  Send,
  ExternalLink
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, currency, getProductPrice } = usePricing();
  const { user } = useAuth();

  const [method, setMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Customer contact info
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Card Form State
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Sent email receipt preview modal state
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [sentEmailRecord, setSentEmailRecord] = useState<SentEmailRecord | null>(null);
  const [isPreviewEmailOpen, setIsPreviewEmailOpen] = useState(false);

  useEffect(() => {
    if (user) {
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerName) setCustomerName(user.name);
      if (!cardHolder) setCardHolder(user.name);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setExpiry(raw);
    }
  };

  const handleCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 3);
    setCvv(raw);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      setErrorMessage('Вкажіть дійсну адресу електронної пошти для отримання чека');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage("Вкажіть ваше ім'я");
      return;
    }
    if (!customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage('Вкажіть телефон і адресу доставки');
      return;
    }

    // 2. Card validation if card method selected
    if (method === 'card') {
      if (!cardHolder.trim()) {
        setErrorMessage("Вкажіть ім'я власника картки");
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setErrorMessage('Номер картки повинен містити 16 цифр');
        return;
      }
      if (expiry.length !== 5) {
        setErrorMessage('Вкажіть термін дії картки (ММ/РР)');
        return;
      }
      if (cvv.length !== 3) {
        setErrorMessage('CVV має містити 3 цифри');
        return;
      }
    }

    setErrorMessage('');
    setStatus('processing');

    const generatedOrderId = `POP-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedOrderNumber(generatedOrderId);

    // Save cart snapshot for email
    const cartSnapshot = [...items];
    const formattedTotal = formatPrice(subtotal, currency);

    // Simulate payment transaction
    setTimeout(async () => {
      try {
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            orderId: generatedOrderId,
            customer: { name: customerName.trim(), email: customerEmail.trim(), phone: customerPhone.trim(), address: customerAddress.trim() },
            currency,
            paymentMethod: method === 'card' ? 'Банківська картка' : method === 'apple_pay' ? 'Apple Pay' : 'Google Pay',
            items: cartSnapshot.map(({ product, quantity }) => ({
              id: product.id,
              title: product.title,
              quantity,
              unitPrice: getProductPrice(product).price
            }))
          })
        });
        const orderResult = await orderResponse.json();
        if (!orderResponse.ok) throw new Error(orderResult.error || 'Не вдалося передати замовлення менеджеру.');
        setCreatedOrderNumber(orderResult.orderId || generatedOrderId);

        // The email is a local preview; Telegram receives the actual order notification.
        const emailRecord = await sendOrderConfirmationEmail({
          orderId: generatedOrderId,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          items: cartSnapshot,
          totalFormatted: formattedTotal,
          currency,
          paymentMethod: method === 'card' ? 'Банківська картка' : method === 'apple_pay' ? 'Apple Pay' : 'Google Pay',
          createdAt: new Date().toISOString()
        });

        setSentEmailRecord(emailRecord);
        setStatus('success');
        clearCart();

        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#FF7A00', '#ffffff', '#22c55e']
        });
      } catch (err: any) {
        setStatus('error');
        setErrorMessage('Не вдалося обробити замовлення. Спробуйте ще раз.');
      }
    }, 1800);
  };

  return (
    <>
      <div className="modal-overlay">
        <div
          className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl relative animate-scaleUp max-h-[92vh] overflow-y-auto"
          style={{
            background: 'rgba(16, 22, 34, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(255, 107, 0, 0.2)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>

          {/* STATUS: SUCCESS WITH EMAIL NOTIFICATION */}
          {status === 'success' ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Замовлення передано менеджеру!</h3>
                <p className="text-xs text-[#FF6B00] font-mono font-bold mt-1">
                  Замовлення #{createdOrderNumber}
                </p>
              </div>

              {/* Email Sent Callout Banner */}
              <div className="glass-card p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
                <div className="flex items-center gap-2 text-green-400 font-bold text-xs">
                  <Mail className="w-4 h-4 text-[#FF6B00]" />
                  <span>Замовлення надіслано менеджеру в Telegram.</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Інформацію про замовлення сформовано для адреси:{' '}
                  <b className="text-white underline">{customerEmail}</b>.
                </p>

                {sentEmailRecord && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewEmailOpen(true)}
                    className="mt-2 text-xs font-bold text-[#FF6B00] hover:text-[#FF7A00] flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Переглянути лист / чек замовлення</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {sentEmailRecord && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewEmailOpen(true)}
                    className="btn-secondary py-3 text-xs font-bold flex-1"
                  >
                    Переглянути лист
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="btn-accent py-3 text-xs font-bold flex-1"
                >
                  Повернутися до магазину
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Modal Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Оформлення замовлення
                  </h2>
                </div>
                <p className="text-xs text-white/60">
                  Чек та підтвердження замовлення надійдуть на ваш Email
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-bold border transition-all ${
                    method === 'card'
                      ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#FF6B00]" />
                  <span>Картка</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('apple_pay')}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-bold border transition-all ${
                    method === 'apple_pay'
                      ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#FF6B00]" />
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('google_pay')}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs font-bold border transition-all ${
                    method === 'google_pay'
                      ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#FF6B00]" />
                  <span>Google Pay</span>
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {/* Contact Email & Name */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B00]">
                    <Mail className="w-4 h-4" />
                    <span>Куди надіслати чек та інформацію:</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1">
                      Ваша електронна пошта (Email) *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex@gmail.com"
                      className="glass-input w-full"
                      disabled={status === 'processing'}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1">
                      Прізвище та ім'я одержувача *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Олександр Петренко"
                      className="glass-input w-full"
                      disabled={status === 'processing'}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1">Телефон *</label>
                    <input type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+380..." className="glass-input w-full" disabled={status === 'processing'} />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1">Місто та адреса / відділення Нової пошти *</label>
                    <textarea required value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Місто, номер відділення або адреса" className="glass-input w-full min-h-20" disabled={status === 'processing'} />
                  </div>
                </div>

                {/* Card Fields */}
                {method === 'card' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-white/80 block mb-1">
                        Власник картки
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="ALEX PETRENKO"
                        className="glass-input w-full uppercase"
                        disabled={status === 'processing'}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-white/80 block mb-1">
                        Номер картки
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        className="glass-input w-full font-mono tabular-numbers"
                        disabled={status === 'processing'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-white/80 block mb-1">
                          Термін (ММ/РР)
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="12/28"
                          className="glass-input w-full font-mono tabular-numbers"
                          disabled={status === 'processing'}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-white/80 block mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          placeholder="•••"
                          className="glass-input w-full font-mono tabular-numbers"
                          maxLength={3}
                          disabled={status === 'processing'}
                        />
                      </div>
                    </div>
                  </>
                )}

                {(method === 'apple_pay' || method === 'google_pay') && (
                  <div className="p-6 rounded-2xl bg-black/30 border border-white/10 text-center space-y-2">
                    <Smartphone className="w-10 h-10 text-[#FF6B00] mx-auto animate-pulse" />
                    <h4 className="font-bold text-white text-sm">
                      {method === 'apple_pay' ? 'Оплата через Apple Pay' : 'Оплата через Google Pay'}
                    </h4>
                    <p className="text-xs text-white/60">
                      Після натискання кнопки чек буде автоматично сформовано та надіслано на вашу пошту.
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-white/60 block">Разом до сплати:</span>
                    <span className="text-2xl font-black text-[#FF6B00] tabular-numbers">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <Lock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>SSL 256-bit</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'processing' || items.length === 0}
                  className="btn-accent w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {status === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Оплата та надсилання листа...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Оплатити {formatPrice(subtotal, currency)} та надіслати чек</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <a
                    href="https://t.me/popshop_orders_ua_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#229ED9] hover:text-[#229ED9]/80 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Або замовте через Telegram-бота: <strong className="underline">@popshop_orders_ua_bot</strong></span>
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PREVIEW FOR SENT EMAIL RECEIPT */}
      {isPreviewEmailOpen && sentEmailRecord && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div
            className="glass-card w-full max-w-2xl p-6 rounded-3xl relative animate-scaleUp max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              color: '#111827',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="font-bold text-base text-gray-900">
                  Поштове сповіщення: {sentEmailRecord.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewEmailOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex justify-between">
              <span><b>Кому:</b> {sentEmailRecord.to}</span>
              <span><b>Час:</b> {new Date(sentEmailRecord.sentAt).toLocaleTimeString('uk-UA')}</span>
            </div>

            {/* Email HTML Body Render */}
            <div
              className="rounded-2xl border border-gray-200 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: sentEmailRecord.htmlContent }}
            />

            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setIsPreviewEmailOpen(false)}
                className="btn-accent text-xs py-2 px-5"
              >
                Зрозуміло, закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
