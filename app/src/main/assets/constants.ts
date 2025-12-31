
import { Category, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Fish Bun', price: 100, category: Category.PASTRIES, color: 'bg-amber-100 border-amber-400' },
  { id: 'p2', name: 'Roasted Bread', price: 90, category: Category.PASTRIES, color: 'bg-orange-100 border-orange-400' },
  { id: 'p3', name: 'Fish Roll', price: 100, category: Category.PASTRIES, color: 'bg-yellow-100 border-yellow-400' },
  { id: 'p4', name: 'Egg Bun', price: 120, category: Category.PASTRIES, color: 'bg-orange-50 border-orange-300' },
  { id: 'd1', name: 'Passion Fruit', price: 450, category: Category.DRINKS, color: 'bg-purple-100 border-purple-400' },
  { id: 'd2', name: 'Amberella', price: 450, category: Category.DRINKS, color: 'bg-green-100 border-green-400' },
  { id: 'd3', name: 'Mixed Fruit', price: 500, category: Category.DRINKS, color: 'bg-red-100 border-red-400' },
  { id: 's1', name: 'Cassava Chips', price: 150, category: Category.SNACKS, color: 'bg-slate-100 border-slate-400' },
];

export const MAX_UNIQUE_ITEMS = 5;
export const CURRENCY = 'LKR';
