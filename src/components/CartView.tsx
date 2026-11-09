import React from 'react';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

interface CartViewProps {
  onGoToCatalog: () => void;
  onOpenCheckout: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ onGoToCatalog, onOpenCheckout }) => {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { formatPrice, currency, getProductPrice } = usePricing();

  return (
    <main className="main-content max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToCatalog}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Назад до каталогу"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Ваш Кошик
            </h1>
            <span className="text-xs opacity-60">
              {items.length} {items.length === 1 ? 'товар' : 'товарів'}
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистити кошик</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="product-card p-12 text-center rounded-2xl max-w-md mx-auto my-12 w-auto">
          <ShoppingBag className="w-16 h-16 text-[#FF6B00] mx-auto mb-4 opacity-70" />
          <h3 className="text-xl font-bold mb-2">Ваш кошик зараз порожній</h3>
          <p className="text-xs opacity-70 mb-6">
            Оберіть ексклюзивні фігурки Funko POP! у нашому каталозі та повертайтеся для швидкого оформлення.
          </p>
          <button onClick={onGoToCatalog} className="btn-accent text-xs py-2.5 px-6 mx-auto">
            Перейти до каталогу
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Items list */}
          <div className="space-y-3">
            {items.map(({ product, quantity }) => {
              const { price } = getProductPrice(product);
              const lineTotal = price * quantity;

              return (
                <div
                  key={product.id}
                  className="product-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 w-auto"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-20 h-20 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 p-2 flex items-center justify-center flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain filter drop-shadow"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base leading-snug">
                        {product.title}
                      </h4>
                      <span className="text-xs opacity-60 block font-mono">
                        {product.subtitle}
                      </span>
                      <span className="text-[11px] text-[#FF6B00] font-bold mt-1 block tabular-numbers">
                        {formatPrice(price, currency)} / шт.
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-black/10 dark:border-white/10 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-black/30 p-1 rounded-xl border border-black/10 dark:border-white/10">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Зменшити кількість"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="tabular-numbers font-mono font-bold text-sm w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Збільшити кількість"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="tabular-numbers font-black text-lg min-w-[100px] text-right">
                      {formatPrice(lineTotal, currency)}
                    </span>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-2 rounded-xl opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Bar */}
          <div className="product-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 w-auto mt-6">
            <div>
              <span className="text-xs uppercase tracking-wider opacity-70 block font-bold mb-1">
                Загальна сума до сплати:
              </span>
              <div className="text-3xl font-black text-[#FF6B00] tabular-numbers tracking-tight">
                {formatPrice(subtotal, currency)}
              </div>
            </div>

            <button
              onClick={onOpenCheckout}
              className="price-button px-8 py-3.5 text-sm w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span>Оформити замовлення</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
