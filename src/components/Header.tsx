import React from 'react';
import { ShoppingBag, Sparkles, Volume2, ShieldCheck, HeartHandshake, Eye, RotateCcw } from 'lucide-react';
import { AssistanceState, EvaluationSystemMode } from '../types';

interface HeaderProps {
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  assistanceState: AssistanceState;
  systemMode: EvaluationSystemMode;
  onOpenBenchmark: () => void;
  onOpenCaregiver: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onResetSession: () => void;
  onNavigateSection: (section: 'shop' | 'usuals' | 'caregiver' | 'benchmark') => void;
  onOpenDatasetInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  cartTotal,
  onOpenCart,
  assistanceState,
  systemMode,
  onOpenBenchmark,
  onOpenCaregiver,
  onResetSession,
  onNavigateSection,
  onOpenDatasetInspector,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* System Mode Notice Banner for MCA Capstone Demonstration */}
      <div className="bg-stone-900 text-stone-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400">RESEARCH EVALUATION MODE:</span>
          <span>
            {systemMode === 'SYSTEM_A_CONVENTIONAL' && 'System A — Conventional Quick-Commerce (No Adaptive AI)'}
            {systemMode === 'SYSTEM_B_NON_ADAPTIVE' && 'System B — Non-Adaptive Assistant (Fixed Strategy)'}
            {systemMode === 'SYSTEM_C_ADAPTIVE' && `System C — Proposed Adaptive Assistant [Active State: ${assistanceState.replace('_', ' ')}]`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenDatasetInspector && (
            <>
              <button 
                onClick={onOpenDatasetInspector}
                className="text-xs bg-emerald-950 text-emerald-300 hover:text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded-full font-bold cursor-pointer"
              >
                Model & Dataset (N=1,850)
              </button>
              <span className="text-stone-600">|</span>
            </>
          )}
          <button 
            onClick={onOpenBenchmark}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium underline cursor-pointer"
          >
            Review Capstone Benchmark & Signals
          </button>
          <span className="text-stone-600">|</span>
          <button
            onClick={onResetSession}
            title="Reset interaction signals and restart"
            className="flex items-center gap-1 text-xs text-stone-300 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset State</span>
          </button>
        </div>
      </div>

      {/* Main Header strictly adhering to 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigateSection('shop'); }}
            className="text-2xl font-bold tracking-tight text-emerald-950 font-serif"
          >
            SahayMart
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
          <button
            onClick={() => onNavigateSection('shop')}
            className="hover:text-emerald-800 transition-colors cursor-pointer py-1"
          >
            Shop Essentials
          </button>
          <button
            onClick={() => onNavigateSection('usuals')}
            className="hover:text-emerald-800 transition-colors cursor-pointer py-1 flex items-center gap-1"
          >
            <span>My Usuals</span>
          </button>
          <button
            onClick={onOpenCaregiver}
            className="hover:text-emerald-800 transition-colors cursor-pointer py-1 flex items-center gap-1"
          >
            <HeartHandshake className="w-4 h-4 text-emerald-700" />
            <span>Caregiver Connect</span>
          </button>
          <button
            onClick={onOpenBenchmark}
            className="hover:text-emerald-800 transition-colors cursor-pointer py-1 flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Evaluation Lab</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            aria-label={`Shopping Basket, ${cartItemCount} items, total ₹${cartTotal}`}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-medium transition-all shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-semibold">
              {cartItemCount > 0 ? `${cartItemCount} items · ₹${cartTotal}` : 'Basket (0)'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
