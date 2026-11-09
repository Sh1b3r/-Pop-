import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck, Truck, RotateCw, Heart } from 'lucide-react';

export const Footer = () => {
  const { isDark } = useTheme();
  const logoSrc = isDark ? '/photo_5357473601977782586_y.png' : '/photo_5312278550180203579_y.png';

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/60 transition-colors">
      {/* Преимущества */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">100% Оригінал</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Тільки сертифіковані вінілові фігурки Funko POP! у коробках.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Швидка доставка</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Безкоштовна доставка Новою Поштою при замовленні від 6000 грн.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <RotateCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">3D Showroom</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Оглядайте кожну фігурку на 360° у 3D перед покупкою.
            </p>
          </div>
        </div>
      </div>

      {/* Копирайт */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="POP! Logo" className="w-7 h-7 rounded-full object-cover" />
          <span className="font-bold text-slate-700 dark:text-slate-300">POP! Shop 2026</span>
          <span>• Офіційний фан-магазин Funko</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Створено з</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          <span>на React & Three.js</span>
        </div>
      </div>
    </footer>
  );
};

