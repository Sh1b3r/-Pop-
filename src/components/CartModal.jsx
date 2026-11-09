import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import confetti from 'canvas-confetti';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, Tag } from 'lucide-react';

export const CartModal = () => {
  const { items, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'POP2026' || promoCode.trim().toUpperCase() === 'DISCOUNT') {
      setDiscount(0.15); // 15% discount
      setPromoApplied(true);
    } else {
      alert('Невірний промокод! Спробуйте "POP2026"');
    }
  };

  const discountAmount = subtotal * discount;
  const delivery = subtotal > 150 ? 0 : 5.0; // бесплатная доставка от $150
  const finalTotal = Math.max(0, subtotal - discountAmount + (items.length > 0 ? delivery : 0));

  const handleCheckout = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setIsSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsSuccess(false);
      setIsCartOpen(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 text-white h-full flex flex-col justify-between shadow-2xl z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold">Кошик покупок</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
              <h3 className="text-2xl font-black text-white">Дякуємо за замовлення!</h3>
              <p className="text-sm text-slate-400">
                Ваші колекційні фігурки POP! вже пакуються та готуються до відправки.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <ShoppingBag className="w-16 h-16 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-300">Ваш кошик порожній</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Додайте фігурки Funko POP! з каталогу, щоб зібрати свою унікальну колекцію!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-950 p-1 flex-shrink-0 flex items-center justify-center">
                  <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate text-white">{item.title}</h4>
                  <span className="text-xs text-slate-400 block">POP! #{item.popNumber}</span>
                  <span className="text-sm font-extrabold text-red-400 mt-1 block">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Counter */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Видалити"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && !isSuccess && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/60 space-y-4">
            {/* Promo input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Промокод (POP2026)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="w-full py-2 pl-8 pr-3 text-xs uppercase font-bold rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={promoApplied}
                className="py-2 px-3 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {promoApplied ? 'Застосовано' : 'Застосувати'}
              </button>
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Вартість товарів:</span>
                <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-emerald-400">
                  <span>Знижка 15%:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Доставка:</span>
                <span className="font-semibold text-white">
                  {delivery === 0 ? 'Безкоштовно' : `$${delivery.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Разом:</span>
                <span className="text-red-400 text-lg">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Оформити замовлення</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

