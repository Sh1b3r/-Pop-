import React, { useState } from 'react';
import { usePricing } from '../../context/PricingContext';
import { SupportedRegion } from '../../types';
import { Save, Check } from 'lucide-react';

export const PricingManager: React.FC = () => {
  const { products, updateProductPrice, formatPrice, region: currentRegion } = usePricing();
  const [targetRegion, setTargetRegion] = useState<SupportedRegion>('UA');
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handlePriceChange = (productId: string, val: string) => {
    const num = parseFloat(val);
    setEditedPrices((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : num
    }));
  };

  const handleSavePrice = (productId: string) => {
    const newPrice = editedPrices[productId];
    if (newPrice !== undefined && newPrice > 0) {
      updateProductPrice(productId, targetRegion, newPrice);
      setSaveSuccess(productId);
      setTimeout(() => setSaveSuccess(null), 2000);
    }
  };

  const currencySymbols = {
    UA: 'UAH (₴)',
    EU: 'EUR (€)',
    US: 'USD ($)'
  };

  return (
    <div className="glass-card p-6 rounded-3xl space-y-6">
      {/* Top Controller */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black">Регіональний прайсинг-менеджер</h2>
          <p className="text-xs opacity-60">
            Змінюйте ціни для кожного регіону окремо. Зміни миттєво синхронізуються у вітрині.
          </p>
        </div>

        {/* Region Switcher */}
        <div className="flex items-center gap-2 bg-black/5 dark:bg-black/40 p-1 rounded-2xl border border-black/10 dark:border-white/10">
          {(['UA', 'EU', 'US'] as SupportedRegion[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setTargetRegion(r);
                setEditedPrices({});
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                targetRegion === r
                  ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {currencySymbols[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Фігурка</th>
              <th>Категорія</th>
              <th>Базова (USD)</th>
              <th>Поточна ({targetRegion})</th>
              <th>Нова ціна</th>
              <th className="text-right">Дія</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const currentRegional = p.regionalPricing?.[targetRegion]?.price || p.basePriceUSD;
              const inputVal = editedPrices[p.id] !== undefined ? editedPrices[p.id] : currentRegional;
              const isSaved = saveSuccess === p.id;

              return (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 p-1 flex items-center justify-center flex-shrink-0">
                        <img src={p.image} alt={p.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <span className="font-bold block">{p.title}</span>
                        <span className="text-[11px] opacity-60 font-mono">#{p.popNumber}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="uppercase font-mono text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 opacity-80">
                      {p.category}
                    </span>
                  </td>

                  <td className="font-mono tabular-numbers text-xs opacity-60">
                    ${p.basePriceUSD}.00
                  </td>

                  <td className="font-mono tabular-numbers font-bold text-sm text-[#FF6B00]">
                    {currentRegional}
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputVal}
                        onChange={(e) => handlePriceChange(p.id, e.target.value)}
                        className="glass-input w-24 py-1 px-2 text-xs font-mono tabular-numbers font-bold"
                        min="1"
                        step="1"
                      />
                    </div>
                  </td>

                  <td className="text-right">
                    <button
                      onClick={() => handleSavePrice(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                        isSaved
                          ? 'bg-green-500 text-white'
                          : 'btn-accent py-1.5 px-3'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Збережено</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Зберегти</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
