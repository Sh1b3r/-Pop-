import React, { useState, useRef, useEffect } from 'react';
import { usePricing } from '../../context/PricingContext';
import { SupportedRegion } from '../../types';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const RegionCurrencySelector: React.FC = () => {
  const { region, setRegion, currency } = usePricing();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { region: SupportedRegion; label: string; currencyName: string; symbol: string; flag: string }[] = [
    { region: 'UA', label: 'Україна', currencyName: 'UAH', symbol: '₴', flag: '🇺🇦' },
    { region: 'EU', label: 'Європа (EU)', currencyName: 'EUR', symbol: '€', flag: '🇪🇺' },
    { region: 'US', label: 'США (USA)', currencyName: 'USD', symbol: '$', flag: '🇺🇸' }
  ];

  const currentOption = options.find((o) => o.region === region) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Вибір регіону та валюти"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200 border ${
          isOpen
            ? 'border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.4)]'
            : 'border-black/15 dark:border-white/20 hover:border-[#FF6B00]'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <span className="text-base select-none leading-none">{currentOption.flag}</span>
        <div className="flex items-center gap-1 font-mono text-xs font-bold tabular-numbers">
          <span>{currentOption.currencyName}</span>
          <span className="text-[#FF6B00]">({currentOption.symbol})</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#FF6B00] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Glassmorphic Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-52 py-2 z-50 rounded-2xl shadow-2xl border border-black/10 dark:border-white/20 animate-fadeIn"
          style={{
            background: 'var(--dropdown-bg, rgba(20, 26, 38, 0.95))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 107, 0, 0.15)'
          }}
        >
          <div className="px-3 pb-2 mb-1 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">
              Регіон & Валюта
            </span>
            <Globe className="w-3.5 h-3.5 text-[#FF6B00]" />
          </div>

          <div className="space-y-1 px-1.5">
            {options.map((opt) => {
              const isSelected = opt.region === region;
              return (
                <button
                  key={opt.region}
                  type="button"
                  onClick={() => {
                    setRegion(opt.region);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/40'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{opt.flag}</span>
                    <span className="font-medium">{opt.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono tabular-numbers text-[11px]">
                    <span className={isSelected ? 'text-white' : 'text-[#FF6B00] font-bold'}>
                      {opt.currencyName} ({opt.symbol})
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
