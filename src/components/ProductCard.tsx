import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { sounds } from '../three/audioEffects';
import { ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { getProductPrice, formatPrice, currency } = usePricing();
  const [isAdded, setIsAdded] = useState(false);

  const { price } = getProductPrice(product);

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    sounds.playAddToCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <div className="product-card glass-card">
      {/* 1. Header with Title & Franchise */}
      <div className="card-header" id="cardheader">
        <div className="title-and-franchise">
          <h3 className="product-title" title={product.title}>
            {product.title}
          </h3>
          <div className="product-franchise">
            {product.category === 'marvel' && (
              <img src="/Marvel_Logo.svg.png" alt="Marvel logo" draggable={false} />
            )}
            {product.category === 'disney' && (
              <img src="/Disney_Stitch_logo.png" alt="Disney Stitch logo" draggable={false} />
            )}
          </div>
        </div>
        <h4>{product.subtitle}</h4>
      </div>

      {/* 2. Figure Image Container */}
      <div className="card-image-container">
        <img
          src={product.image}
          alt={product.title}
          className="product-image"
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* 3. Description Caption */}
      <div className="card-caption">
        <p className="product-description">{product.description}</p>
      </div>

      {/* 4. Action Buttons (Price CTA & Cart) */}
      <div className="card-actions">
        <div className="price-and-cart">
          <button
            type="button"
            onClick={handleBuy}
            className="price-button"
            title="Купити"
          >
            {isAdded ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-white" />
                <span>Додано!</span>
              </span>
            ) : (
              <span className="price-text tabular-numbers">
                Купити | {formatPrice(price, currency)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuy}
            className="cart-button"
            aria-label="Додати в кошик"
            title="Додати в кошик"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
