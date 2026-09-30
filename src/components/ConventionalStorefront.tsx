import React from 'react';
import { ShoppingCart, Search, Zap, Percent, Clock, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface ConventionalStorefrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const ConventionalStorefront: React.FC<ConventionalStorefrontProps> = ({
  products,
  onAddToCart,
  onOpenCart,
  cartCount,
}) => {
  return (
    <div className="bg-stone-100 min-h-screen pb-16 font-sans text-xs">
      {/* Dense Commercial Header */}
      <div className="bg-yellow-400 text-stone-900 px-4 py-2 flex items-center justify-between text-[11px] font-bold">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 fill-stone-900" />
          <span>SUPER FAST 8 MINUTE DELIVERY — FLASH SALE LIVE NOW</span>
        </div>
        <span className="underline cursor-pointer">USE CODE: QUICK50</span>
      </div>

      <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tighter text-emerald-700">
            RAPIDMART
          </span>
          <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
            Zone 4B
          </span>
        </div>

        <div className="flex-1 max-w-sm relative">
          <input
            type="text"
            placeholder="Search across 10,000+ groceries and essentials..."
            className="w-full bg-stone-100 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
        </div>

        <button
          onClick={onOpenCart}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Cart ({cartCount})</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Busy Promotional Banners (Simulating cognitive overload for elderly) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider bg-white/20 px-1 rounded">Daily Mega Deal</span>
              <div className="font-bold text-sm mt-0.5">Flat 40% OFF Staples</div>
            </div>
            <Percent className="w-6 h-6 opacity-60" />
          </div>
          <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider bg-white/20 px-1 rounded">Dairy Rush</span>
              <div className="font-bold text-sm mt-0.5">Buy Milk Get Bread Free</div>
            </div>
            <Clock className="w-6 h-6 opacity-60" />
          </div>
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider bg-white/20 px-1 rounded">Express Pass</span>
              <div className="font-bold text-sm mt-0.5">Free Delivery on ₹99+</div>
            </div>
            <Zap className="w-6 h-6 opacity-60" />
          </div>
        </div>

        {/* Dense Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] whitespace-nowrap">
          {['All Products', 'Dairy, Bread & Eggs', 'Atta, Rice & Dal', 'Oils & Ghee', 'Masala & Spices', 'Snacks & Munchies', 'Beverages', 'Instant Food', 'Cleaning'].map((cat, i) => (
            <button
              key={i}
              className={`px-2.5 py-1 rounded-full border ${
                i === 0 ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Small, Dense Product Cards (Standard 4-5 column layout with tiny text) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-stone-900 text-sm">Popular Groceries in Your Area</h3>
            <span className="text-[11px] text-emerald-700 font-semibold cursor-pointer flex items-center">
              See All (142) <ChevronRight className="w-3 h-3 inline" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-stone-200 p-2.5 flex flex-col justify-between hover:shadow-sm"
              >
                <div>
                  <div className="aspect-square bg-stone-50 rounded mb-2 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">{product.brand}</span>
                  <h4 className="font-semibold text-stone-800 text-[11px] line-clamp-2 leading-tight mt-0.5">
                    {product.name}
                  </h4>
                  <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">{product.packSize}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-bold text-stone-950 text-xs font-mono tabular-nums">
                    ₹{product.price}
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-2 py-1 bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-[11px] font-bold rounded"
                  >
                    ADD
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
