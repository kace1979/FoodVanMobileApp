
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Category, 
  Product, 
  CartItem, 
  SaleRecord, 
  StockLevel, 
  AppView 
} from './types';
import { INITIAL_PRODUCTS, MAX_UNIQUE_ITEMS, CURRENCY } from './constants';
import { getDailyInsights } from './services/geminiService';

// Component: Item Card
const ItemCard: React.FC<{ 
  product: Product; 
  onAdd: (p: Product) => void; 
  quantity: number;
  disabled: boolean;
}> = ({ product, onAdd, quantity, disabled }) => (
  <button
    onClick={() => onAdd(product)}
    disabled={disabled && quantity === 0}
    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 h-32 text-center
      ${product.color} 
      ${disabled && quantity === 0 ? 'opacity-40 grayscale pointer-events-none' : 'shadow-sm hover:shadow-md'}
    `}
  >
    <span className="font-bold text-lg leading-tight mb-1">{product.name}</span>
    <span className="text-sm font-medium opacity-70">{CURRENCY} {product.price}</span>
    {quantity > 0 && (
      <div className="absolute -top-2 -right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white animate-bounce">
        {quantity}
      </div>
    )}
  </button>
);

// Component: POS View
const POSView: React.FC<{
  cart: CartItem[];
  onAddToCart: (p: Product) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}> = ({ cart, onAddToCart, onClearCart, onCheckout }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.PASTRIES);
  
  const filteredProducts = INITIAL_PRODUCTS.filter(p => p.category === activeCategory);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const uniqueItemsCount = cart.length;
  const isCartFull = uniqueItemsCount >= MAX_UNIQUE_ITEMS;

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex gap-2 p-4 bg-white shadow-sm overflow-x-auto no-scrollbar">
        {Object.values(Category).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {isCartFull && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span className="text-xs font-semibold uppercase tracking-tight">Max 5 unique items reached</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(p => (
            <ItemCard 
              key={p.id} 
              product={p} 
              quantity={cart.find(ci => ci.id === p.id)?.quantity || 0}
              onAdd={onAddToCart}
              disabled={isCartFull}
            />
          ))}
        </div>
      </div>

      {/* Cart Summary (Floating Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
            <span className="text-3xl font-black text-indigo-700">{CURRENCY} {total}</span>
          </div>
          <button 
            onClick={onClearCart}
            className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 active:bg-red-100 active:text-red-500"
          >
            <i className="fas fa-trash-alt text-xl"></i>
          </button>
        </div>
        
        <button 
          onClick={onCheckout}
          disabled={cart.length === 0}
          className={`w-full py-5 rounded-2xl font-black text-xl shadow-lg transition-transform active:scale-95 ${
            cart.length > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 pointer-events-none'
          }`}
        >
          {cart.length > 0 ? `PAY ${CURRENCY} ${total}` : 'ADD ITEMS TO START'}
        </button>
      </div>
    </div>
  );
};

// Component: Inventory View
const InventoryView: React.FC<{ 
  onSave: (stock: StockLevel) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [stock, setStock] = useState<StockLevel>(() => {
    const saved = localStorage.getItem('van_stock');
    return saved ? JSON.parse(saved) : {};
  });

  const handleUpdate = (id: string, val: string) => {
    const num = parseInt(val) || 0;
    setStock(prev => ({ ...prev, [id]: num }));
  };

  const handleComplete = () => {
    localStorage.setItem('van_stock', JSON.stringify(stock));
    onSave(stock);
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Stock Entry</h2>
        <button onClick={onClose} className="text-slate-400 text-2xl"><i className="fas fa-times"></i></button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {INITIAL_PRODUCTS.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <span className="font-bold">{p.name}</span>
            <input 
              type="number" 
              inputMode="numeric"
              placeholder="0"
              value={stock[p.id] || ''}
              onChange={(e) => handleUpdate(p.id, e.target.value)}
              className="w-24 p-3 border-2 border-slate-200 rounded-xl text-center font-bold text-lg focus:border-indigo-500 outline-none"
            />
          </div>
        ))}
      </div>
      <button 
        onClick={handleComplete}
        className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg"
      >
        SAVE & START SELLING
      </button>
    </div>
  );
};

// Component: Summary View
const SummaryView: React.FC<{ 
  sales: SaleRecord[];
  onReset: () => void;
  onClose: () => void;
}> = ({ sales, onReset, onClose }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.total, 0), [sales]);
  const totalItems = useMemo(() => sales.reduce((acc, s) => acc + s.items.reduce((iacc, i) => iacc + i.quantity, 0), 0), [sales]);

  const generateInsights = async () => {
    if (sales.length === 0) return;
    setLoading(true);
    const data = await getDailyInsights(sales);
    setInsights(data);
    setLoading(false);
  };

  return (
    <div className="p-6 h-full bg-slate-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Daily Summary</h2>
        <button onClick={onClose} className="text-slate-400 text-2xl"><i className="fas fa-times"></i></button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase">Sales</span>
          <div className="text-2xl font-black text-slate-800">{sales.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase">Revenue</span>
          <div className="text-2xl font-black text-indigo-600">{CURRENCY} {totalRevenue}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black text-lg mb-2 flex items-center gap-2">
              <i className="fas fa-magic"></i> AI Sales Advisor
            </h3>
            {insights ? (
              <div className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{insights}</div>
            ) : (
              <p className="text-sm opacity-70 italic mb-4">Unlock expert insights based on today's sales patterns.</p>
            )}
            {!insights && (
              <button 
                onClick={generateInsights}
                disabled={loading || sales.length === 0}
                className="bg-white text-indigo-900 px-6 py-2 rounded-full font-black text-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'ANALYZING...' : 'GENERATE INSIGHTS'}
              </button>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Sales History</h3>
          {sales.length === 0 ? (
            <p className="text-slate-400 text-center py-10 italic">No sales yet today.</p>
          ) : (
            <div className="space-y-4">
              {sales.slice().reverse().map(sale => (
                <div key={sale.id} className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <div>
                    <div className="text-xs text-slate-400">{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="font-medium text-sm">
                      {sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>
                  <div className="font-bold text-indigo-600">{CURRENCY} {sale.total}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={onReset}
        className="mt-6 w-full text-red-500 font-bold py-2 active:bg-red-50 rounded-xl"
      >
        CLEAR ALL DATA & START NEW DAY
      </button>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppView>('POS');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('van_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [stock, setStock] = useState<StockLevel>(() => {
    const saved = localStorage.getItem('van_stock');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('van_sales', JSON.stringify(sales));
  }, [sales]);

  const handleAddToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (prev.length >= MAX_UNIQUE_ITEMS) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newSale: SaleRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      items: [...cart],
      total
    };
    setSales(prev => [...prev, newSale]);
    setCart([]);
    
    // Simple vibration feedback if available
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleResetData = () => {
    if (confirm("Reset everything for a new day?")) {
      setSales([]);
      setCart([]);
      localStorage.removeItem('van_sales');
      localStorage.removeItem('van_stock');
      setView('POS');
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 pt-6 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="fas fa-truck-pickup text-xl"></i>
          </div>
          <h1 className="font-black text-xl tracking-tight">FoodVan<span className="text-indigo-300">POS</span></h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('INVENTORY')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${view === 'INVENTORY' ? 'bg-white text-indigo-700' : 'hover:bg-white/10'}`}
          >
            <i className="fas fa-boxes-stacked"></i>
          </button>
          <button 
            onClick={() => setView('SUMMARY')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${view === 'SUMMARY' ? 'bg-white text-indigo-700' : 'hover:bg-white/10'}`}
          >
            <i className="fas fa-chart-line"></i>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-slate-100">
        <POSView 
          cart={cart}
          onAddToCart={handleAddToCart}
          onClearCart={() => setCart([])}
          onCheckout={handleCheckout}
        />

        {/* Overlays */}
        {view === 'INVENTORY' && (
          <div className="absolute inset-0 z-40 bg-white slide-up">
            <InventoryView onSave={(s) => { setStock(s); setView('POS'); }} onClose={() => setView('POS')} />
          </div>
        )}
        {view === 'SUMMARY' && (
          <div className="absolute inset-0 z-40 bg-white slide-up">
            <SummaryView sales={sales} onReset={handleResetData} onClose={() => setView('POS')} />
          </div>
        )}
      </main>

      {/* Animation Styles */}
      <style>{`
        .slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
