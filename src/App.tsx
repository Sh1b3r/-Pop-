import React, { useState } from 'react';
import { usePricing } from './context/PricingContext';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { Product } from './types';

// Components
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { DragScrollContainer } from './components/DragScrollContainer';
import { CatalogView } from './components/CatalogView';
import { CartView } from './components/CartView';
import { Product3DModal } from './components/Product3DModal';
import { AuthModal } from './components/auth/AuthModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ShieldCheck, Truck, RotateCw, Send } from 'lucide-react';

export function App() {
  const { products } = usePricing();
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'catalog' | 'cart' | 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const marvelProducts = products.filter((p) => p.category === 'marvel');
  const stitchProducts = products.filter((p) => p.category === 'disney');

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#FF6B00] selection:text-white">
      <div>
        {/* 1. Original Replica Glassmorphic Header */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* 2. Routing Controller */}
        {currentView === 'admin' ? (
          <AdminDashboard onBackToStore={() => setCurrentView('home')} />
        ) : currentView === 'catalog' ? (
          <CatalogView
            products={products}
            onOpen3D={(p) => setModalProduct(p)}
            searchQuery={searchQuery}
          />
        ) : currentView === 'cart' ? (
          <CartView
            onGoToCatalog={() => setCurrentView('catalog')}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        ) : (
          /* 3. Original Home Page Layout */
          <main className="main-content">
            {/* Promo Carousel with Momentum Drag */}
            <DragScrollContainer className="carousel-container" id="carousel-scroll">
              {/* Slide 1 */}
              <div className="carousel-section glass-card" id="c-section-1">
                <h2>
                  Новорічний розпродаж<br />
                  Знижки до 80% на всі вінілові колекції Funko POP!
                </h2>
                <div className="carousel-image-wrapper">
                  <img
                    src="/christmas.png"
                    alt="Новорічний розпродаж"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Slide 2 */}
              <div className="carousel-section glass-card" id="c-section-2">
                <h2>
                  Знижки на Five Nights at Freddy's
                </h2>
                <div className="carousel-image-wrapper">
                  <img
                    src="/freddy.png"
                    alt="Freddy FNAF"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Slide 3 */}
              <div className="carousel-section glass-card" id="c-section-3">
                <h2>
                  Фігурки з серіалу Дивні дива
                </h2>
                <div className="carousel-image-wrapper">
                  <img
                    src="/stranger things.png"
                    alt="Stranger Things"
                    draggable={false}
                  />
                </div>
              </div>
            </DragScrollContainer>

            {/* Products Section 1: Marvel Universe */}
            <div className="products-section">
              <div className="franchise-and-title">
                <h2>Акції тижня</h2>
                <div className="franchise" id="franchise1">
                  <img
                    src="/Marvel_Logo.svg.png"
                    alt="Marvel"
                    draggable={false}
                  />
                </div>
              </div>
              <DragScrollContainer className="products" id="marvel-track">
                {marvelProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onOpen3D={(p) => setModalProduct(p)}
                  />
                ))}
              </DragScrollContainer>
            </div>

            {/* Products Section 2: Disney Stitch */}
            <div className="products-section">
              <div className="franchise-and-title">
                <h2>Купуй двох і отримай третього у подарунок!</h2>
                <div className="franchise" id="franchise2">
                  <img
                    src="/Disney_Stitch_logo.png"
                    alt="Disney Stitch"
                    draggable={false}
                  />
                </div>
              </div>
              <DragScrollContainer className="products" id="stitch-track">
                {stitchProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onOpen3D={(p) => setModalProduct(p)}
                  />
                ))}
              </DragScrollContainer>
            </div>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-black/10 dark:border-white/10 py-10 px-4">
        {/* Telegram Order CTA Banner */}

        {/* 4 Feature / Trust Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="product-card glass-card p-4 flex flex-row items-center gap-3.5 w-auto">
            <div className="p-2.5 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">100% Оригінал</h4>
              <p className="text-xs opacity-70">Офіційна ліцензійна продукція Funko POP!</p>
            </div>
          </div>
          <div className="product-card glass-card p-4 flex flex-row items-center gap-3.5 w-auto">
            <div className="p-2.5 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Швидка доставка</h4>
              <p className="text-xs opacity-70">По Україні та країнам Європейського Союзу</p>
            </div>
          </div>
          <div className="product-card glass-card p-4 flex flex-row items-center gap-3.5 w-auto">
            <div className="p-2.5 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00]">
              <RotateCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">3D Showroom</h4>
              <p className="text-xs opacity-70">Інтерактивний огляд кожної фігурки на 360°</p>
            </div>
          </div>
          <a
            href="https://t.me/popshop_orders_ua_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="product-card glass-card p-4 flex flex-row items-center gap-3.5 w-auto group hover:border-[#229ED9] transition-all cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-[#229ED9]/20 border border-[#229ED9]/40 text-[#229ED9] group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm">Telegram Бот</h4>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#229ED9] text-white">BOT</span>
              </div>
              <p className="text-xs text-[#FF6B00] font-bold group-hover:underline">@popshop_orders_ua_bot</p>
            </div>
          </a>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs opacity-70 border-t border-black/10 dark:border-white/10 pt-6 gap-4">
          <div className="flex items-center gap-3">
            <img src="/pop-logo.png" alt="Logo" className="w-12 h-12 object-contain filter drop-shadow" />
            <span className="font-bold text-sm">POP! Shop © 2026</span>
          </div>
          <a
            href="https://t.me/popshop_orders_ua_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-[#FF6B00] transition-colors font-medium"
          >
            <Send className="w-4 h-4 text-[#229ED9]" />
            <span>Замовлення в Telegram: <strong className="text-[#FF6B00]">@popshop_orders_ua_bot</strong></span>
          </a>
          <div className="text-[#FF6B00] font-semibold">
            Glassmorphic Polish & Energetic Orange Accent
          </div>
        </div>
      </footer>

      {/* Floating Telegram Order Button */}
      <a
        href="https://t.me/popshop_orders_ua_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#229ED9] text-white shadow-xl hover:scale-105 active:scale-95 transition-all group font-bold text-xs"
        title="Замовити фігурку через Telegram бота"
      >
        <Send className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Замовити в Telegram</span>
        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono">@popshop_orders_ua_bot</span>
      </a>

      {/* 3D Model Inspection Modal */}
      {modalProduct && (
        <Product3DModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
