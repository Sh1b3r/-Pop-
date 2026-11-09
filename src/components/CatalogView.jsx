import React, { useState } from 'react';
import { ProductCard } from './ProductCard';

export const CatalogView = ({ products, onOpen3D, searchQuery = '' }) => {
  const [activeCategory, setActiveCategory] = useState('all');

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
    <main style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '30px'
        }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
          Каталог
        </h2>

        {/* Кнопки фільтрів як в оригіналі */}
        <div className="filter-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setActiveCategory('all')}
            data-cat="all"
            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          >
            Всі
          </button>
          <button
            onClick={() => setActiveCategory('disney')}
            data-cat="disney"
            className={`filter-btn ${activeCategory === 'disney' ? 'active' : ''}`}
          >
            Disney
          </button>
          <button
            onClick={() => setActiveCategory('marvel')}
            data-cat="marvel"
            className={`filter-btn ${activeCategory === 'marvel' ? 'active' : ''}`}
          >
            Marvel
          </button>
          <button
            onClick={() => setActiveCategory('dc')}
            data-cat="dc"
            className={`filter-btn ${activeCategory === 'dc' ? 'active' : ''}`}
          >
            DC Comics
          </button>
        </div>
      </div>

      {/* СЕТКА КАРТОЧЕК як в catalog.html */}
      <div className="product-grid">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} onOpen3D={onOpen3D} />
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', fontSize: '18px' }}>
            За вашим запитом нічого не знайдено.
          </div>
        )}
      </div>
    </main>
  );
};
