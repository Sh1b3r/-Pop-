import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedRegion, SupportedCurrency, Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockStore';
import { getAssetUrl } from '../config/media';

interface PricingContextType {
  region: SupportedRegion;
  currency: SupportedCurrency;
  setRegion: (region: SupportedRegion) => void;
  products: Product[];
  formatPrice: (amount: number, curr?: SupportedCurrency) => string;
  getProductPrice: (product: Product) => { price: number; currency: SupportedCurrency };
  updateProductRegionalPrice: (productId: string, region: SupportedRegion, newPrice: number) => void;
}

const REGION_CURRENCY_MAP: Record<SupportedRegion, SupportedCurrency> = {
  UA: 'UAH',
  EU: 'EUR',
  US: 'USD'
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<SupportedRegion>(() => {
    return (localStorage.getItem('pop_region') as SupportedRegion) || 'UA';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('pop_products');
      const loaded: Product[] = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
      return loaded.map(p => ({ ...p, image: getAssetUrl(p.image) }));
    } catch {
      return INITIAL_PRODUCTS.map(p => ({ ...p, image: getAssetUrl(p.image) }));
    }
  });

  const currency = REGION_CURRENCY_MAP[region];

  useEffect(() => {
    localStorage.setItem('pop_region', region);
  }, [region]);

  useEffect(() => {
    localStorage.setItem('pop_products', JSON.stringify(products));
  }, [products]);

  const setRegion = (newRegion: SupportedRegion) => {
    setRegionState(newRegion);
  };

  const formatPrice = (amount: number, customCurr?: SupportedCurrency): string => {
    const targetCurrency = customCurr || currency;
    switch (targetCurrency) {
      case 'UAH':
        return `${amount.toLocaleString('uk-UA')} ₴`;
      case 'EUR':
        return `€${amount.toFixed(2)}`;
      case 'USD':
      default:
        return `$${amount.toFixed(2)}`;
    }
  };

  const getProductPrice = (product: Product) => {
    const regional = product.regionalPricing?.[region];
    if (regional) {
      return { price: regional.price, currency: regional.currency };
    }
    return { price: product.basePriceUSD, currency: 'USD' as SupportedCurrency };
  };

  const updateProductRegionalPrice = (productId: string, targetRegion: SupportedRegion, newPrice: number) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const targetCurr = REGION_CURRENCY_MAP[targetRegion];
        return {
          ...prod,
          regionalPricing: {
            ...prod.regionalPricing,
            [targetRegion]: {
              currency: targetCurr,
              price: Math.max(0, newPrice)
            }
          }
        };
      })
    );
  };

  return (
    <PricingContext.Provider
      value={{
        region,
        currency,
        setRegion,
        products,
        formatPrice,
        getProductPrice,
        updateProductRegionalPrice
      }}
    >
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};

