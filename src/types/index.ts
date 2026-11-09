export type Role = 'SuperAdmin' | 'Manager' | 'Customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
}

export type SupportedRegion = 'UA' | 'EU' | 'US';
export type SupportedCurrency = 'UAH' | 'EUR' | 'USD';

export interface RegionalPrice {
  currency: SupportedCurrency;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  popNumber: string;
  franchise: string;
  category: string;
  image: string;
  description: string;
  basePriceUSD: number;
  regionalPricing: Record<SupportedRegion, RegionalPrice>;
  tags?: string[];
  inStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedRegion: SupportedRegion;
}

export interface PaymentDetails {
  method: 'card' | 'apple_pay' | 'google_pay';
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
}

export type TransactionStatus = 'idle' | 'processing' | 'success' | 'error';

