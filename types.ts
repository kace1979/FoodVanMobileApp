
export enum Category {
  PASTRIES = 'Pastries',
  DRINKS = 'Drinks',
  SNACKS = 'Snacks'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  color: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleRecord {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
}

export interface StockLevel {
  [productId: string]: number;
}

export type AppView = 'INVENTORY' | 'POS' | 'SUMMARY';
