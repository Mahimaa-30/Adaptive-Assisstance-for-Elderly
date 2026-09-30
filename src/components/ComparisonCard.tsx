import React from 'react';
import { Check, X, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ComparisonCardProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
  language: 'en' | 'hi' | 'kn' | 'ta';
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  products,
  onSelectProduct,
  onClose,
  language,
  fontSize,
}) => {
  if (products.length < 2) return null;

  const itemA = products[0];
  const itemB = products[1];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Side-by-Side Senior Comparison</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-950">
              Which option suits you better?
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              We simplified the difference so you can choose with peace of mind.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close comparison modal"
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pairwise Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A */}
          <div className="rounded-2xl border-2 border-stone-200 hover:border-emerald-600 bg-stone-50/60 p-5 flex flex-col justify-between transition-colors">
            <div>
              <div className="bg-white rounded-xl aspect-4/3 w-full overflow-hidden mb-4 border border-stone-200">
                <img
                  src={itemA.image}
                  alt={itemA.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Option A · Budget Value
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-1 mb-2">
                {itemA.name}
              </h3>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-extrabold text-stone-950 font-mono tabular-nums">
                  ₹{itemA.price}
                </span>
                <span className="text-xs text-stone-500 font-mono tabular-nums">
                  for {itemA.packSize}
                </span>
              </div>

              <div className="space-y-2 text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Highlight:</strong> {itemA.nutritionalHighlight || 'Daily Essential'}</span>
                </div>
                {itemA.suitableForSenior && itemA.suitableForSenior[0] && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Elder Perk:</strong> {itemA.suitableForSenior[0]}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectProduct(itemA);
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Choose {itemA.brand} (₹{itemA.price})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option B */}
          <div className="rounded-2xl border-2 border-emerald-300 hover:border-emerald-700 bg-emerald-50/40 p-5 flex flex-col justify-between transition-colors">
            <div>
              <div className="bg-white rounded-xl aspect-4/3 w-full overflow-hidden mb-4 border border-stone-200">
                <img
                  src={itemB.image}
                  alt={itemB.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Option B · Health & Heart Care
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-1 mb-2">
                {itemB.name}
              </h3>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-extrabold text-stone-950 font-mono tabular-nums">
                  ₹{itemB.price}
                </span>
                <span className="text-xs text-stone-500 font-mono tabular-nums">
                  for {itemB.packSize}
                </span>
              </div>

              <div className="space-y-2 text-xs text-stone-700 bg-white p-3 rounded-xl border border-emerald-100 mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Highlight:</strong> {itemB.nutritionalHighlight || 'Heart Health Blend'}</span>
                </div>
                {itemB.suitableForSenior && itemB.suitableForSenior[0] && (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Elder Perk:</strong> {itemB.suitableForSenior[0]}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectProduct(itemB);
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Choose {itemB.brand} (₹{itemB.price})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
