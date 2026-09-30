import React, { useState } from 'react';
import { Plus, Minus, Check, Volume2, ShieldCheck, Heart } from 'lucide-react';
import { AssistanceState, Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (product: Product, newQty: number) => void;
  assistanceState: AssistanceState;
  language: 'en' | 'hi' | 'kn' | 'ta';
  fontSize: 'normal' | 'large' | 'xlarge';
  onSpeakProduct: (product: Product) => void;
  isFocalHighAssistance?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  assistanceState,
  language,
  fontSize,
  onSpeakProduct,
  isFocalHighAssistance = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const isHighAssistance = assistanceState === 'HIGH_ASSISTANCE' || isFocalHighAssistance;
  const isGuided = assistanceState === 'GUIDED_ASSISTANCE';

  // Get local name if not English
  const displayName = language !== 'en' && product.localName[language] 
    ? product.localName[language] 
    : product.name;

  return (
    <article
      className={`relative rounded-2xl bg-white border transition-all overflow-hidden flex flex-col justify-between ${
        isHighAssistance
          ? 'border-2 border-emerald-600 shadow-lg p-6 ring-4 ring-amber-200'
          : isGuided
          ? 'border-emerald-300 shadow-md p-5 ring-2 ring-emerald-100'
          : 'border-stone-200 shadow-xs hover:shadow-md p-4'
      }`}
    >
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-4/3 w-full bg-stone-100 rounded-xl overflow-hidden mb-3.5 flex items-center justify-center">
          {imageError ? (
            <div className="flex flex-col items-center justify-center p-4 text-center text-stone-500 w-full h-full bg-stone-100">
              <span className="font-bold text-stone-800 text-sm">{product.name}</span>
              <span className="text-xs text-stone-400 mt-1">{product.packSize}</span>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          )}

          {/* Senior Tag / Daily Essential */}
          {product.isDailyEssential && (
            <div className="absolute top-2.5 left-2.5 bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
              Daily Essential
            </div>
          )}

          {/* Quick Voice Readout Button */}
          <button
            onClick={() => onSpeakProduct(product)}
            title="Read product details aloud"
            aria-label={`Read details aloud for ${product.name}`}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-stone-800 hover:text-emerald-800 shadow-sm flex items-center justify-center cursor-pointer transition-colors"
          >
            <Volume2 className="w-4 h-4 text-emerald-800" />
          </button>
        </div>

        {/* Brand & Pack metadata (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
          <span className="font-semibold text-stone-700">{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{product.packSize}</span>
        </div>

        {/* Product Title */}
        <h3 className={`font-bold text-stone-900 leading-snug mb-1.5 ${
          fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base'
        }`}>
          {displayName}
        </h3>

        {/* Nutritional & Elder suitability highlights */}
        {product.nutritionalHighlight && (
          <p className="text-xs text-emerald-800 font-medium mb-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{product.nutritionalHighlight}</span>
          </p>
        )}

        {/* Elder Benefit bullet points in Guided or High Assistance */}
        {(isGuided || isHighAssistance) && product.suitableForSenior && (
          <div className="mb-3 space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Elder-Friendly Perks:
            </span>
            {product.suitableForSenior.map((perk, i) => (
              <div key={i} className="text-xs text-stone-600 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price & Action Area */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        {/* Price display in Tabular Figures */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-extrabold text-stone-950 font-mono tabular-nums ${
              fontSize === 'xlarge' ? 'text-2xl' : 'text-xl'
            }`}>
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            10-minute delivery
          </span>
        </div>

        {/* Interactive Buy Control */}
        <div>
          {quantityInCart === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${product.name} to basket`}
              className={`rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                isHighAssistance
                  ? 'px-5 py-3 text-base bg-emerald-800 hover:bg-emerald-900 text-white min-h-[48px]'
                  : 'px-4 py-2 text-sm bg-emerald-800 hover:bg-emerald-900 text-white min-h-[40px]'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl p-1">
              <button
                onClick={() => onUpdateQuantity(product, quantityInCart - 1)}
                aria-label={`Decrease quantity of ${product.name}`}
                className="w-8 h-8 rounded-lg bg-white text-stone-900 hover:bg-stone-100 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-stone-900 text-sm px-1.5 font-mono tabular-nums">
                {quantityInCart}
              </span>
              <button
                onClick={() => onUpdateQuantity(product, quantityInCart + 1)}
                aria-label={`Increase quantity of ${product.name}`}
                className="w-8 h-8 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
