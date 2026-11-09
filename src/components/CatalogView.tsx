import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Layers } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  searchQuery?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  searchQuery = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'marvel' | 'disney'>('all');

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.popNumber.includes(q);

    return matchesCat && matchesSearch;
  });

  return (
    <main className="main-content">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Каталог фігурок
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 font-bold">
              {filteredProducts.length} позицій
            </span>
          </div>
          <p className="text-xs opacity-70 mt-1">
            Оригінальні ліцензійні вінілові фігурки Funko POP! у наявності
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          >
            Всі фігурки
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('marvel')}
            className={`filter-btn ${activeCategory === 'marvel' ? 'active' : ''}`}
          >
            Marvel Universe
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('disney')}
            className={`filter-btn ${activeCategory === 'disney' ? 'active' : ''}`}
          >
            Disney & Stitch
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="product-grid">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="product-card p-12 text-center rounded-2xl max-w-md mx-auto my-12 w-auto">
          <Layers className="w-12 h-12 text-[#FF6B00] mx-auto mb-3 opacity-70" />
          <h3 className="text-lg font-bold mb-1">Нічого не знайдено</h3>
          <p className="text-xs opacity-70">
            За запитом "{searchQuery}" немає відповідних товарів. Спробуйте змінити фільтр.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="btn-accent text-xs mt-4 py-2 px-5 mx-auto"
          >
            Скинути фільтри
          </button>
        </div>
      )}
    </main>
  );
};
