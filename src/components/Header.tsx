import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RegionCurrencySelector } from './pricing/RegionCurrencySelector';
import { ThemeToggle } from './ThemeToggle';
import { Shield, LogOut, ShoppingBag, Search, Sparkles, Send } from 'lucide-react';
import { getAssetUrl } from '../config/media';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenAuth
}) => {
  const { totalCount } = useCart();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const isStaff = user && (user.role === 'SuperAdmin' || user.role === 'Manager');

  return (
    <div className="header-container">
      <header id="header2">
        {/* Left: Logo & Title */}
        <div
          className="headertext"
          id="headertext1"
          onClick={() => setCurrentView('home')}
        >
          <div className="logocontainer" id="logo">
            <img
              id="logoday"
              src={getAssetUrl('/pop-logo.png')}
              alt="POP! Shop Logo"
            />
          </div>
          <div className="title">
            <h1>POP! Shop</h1>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="nav-center" id="desktop-nav">
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
          >
            Головна
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className={`nav-link ${currentView === 'catalog' ? 'active' : ''}`}
          >
            Каталог
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('cart')}
            className={`nav-link ${currentView === 'cart' ? 'active' : ''}`}
          >
            <span>Кошик</span>
            {totalCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#FF6B00] text-white">
                {totalCount}
              </span>
            )}
          </button>
          <a
            href="https://t.me/popshop_orders_ua_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link flex items-center gap-1.5 text-[#229ED9] hover:text-[#229ED9]/80 font-bold"
            title="Замовити через Telegram @popshop_orders_ua_bot"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Telegram Бот</span>
          </a>
          {isStaff && (
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
            >
              <Shield className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right: Search, Theme Toggle, Currency, Auth */}
        <div className="header-right" id="desktop-controls">
          {/* Animated Search Form from original */}
          <form
            className="form"
            id="search-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="search">
              <input
                autoComplete="off"
                placeholder="Пошук..."
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'catalog') setCurrentView('catalog');
                }}
              />
              <div className="icon" role="button" id="search-button" aria-label="Пошук">
                <Search className="w-4 h-4 text-[#FF6B00]" />
              </div>
            </label>
          </form>

          {/* Theme switch from original */}
          <ThemeToggle />

          {/* Multi-Currency & Region Selector */}
          <RegionCurrencySelector />

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold block leading-tight">{user.name}</span>
                <span className="text-[10px] text-[#FF6B00] font-mono uppercase font-bold">{user.role}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Вийти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="price-button text-xs py-2 px-4 whitespace-nowrap"
            >
              Авторизація
            </button>
          )}
        </div>
      </header>
    </div>
  );
};
