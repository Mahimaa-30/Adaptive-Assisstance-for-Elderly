import React, { useState } from 'react';
import { X, HeartHandshake, Phone, Share2, Check, ShieldCheck, UserCheck } from 'lucide-react';
import { CartItem, UserProfile } from '../types';

interface CaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  cart: CartItem[];
  cartTotal: number;
}

export const CaregiverModal: React.FC<CaregiverModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  cart,
  cartTotal,
}) => {
  const [copied, setCopied] = useState(false);
  const [calling, setCalling] = useState(false);

  if (!isOpen) return null;

  const handleShareWhatsApp = () => {
    const itemsList = cart.map(i => `${i.quantity}x ${i.product.name} (₹${i.product.price * i.quantity})`).join('\n');
    const text = `Namaskara Ananya,\nI am shopping on SahayMart. Here is my current basket:\n\n${itemsList || 'No items yet'}\n\nTotal: ₹${cartTotal}\nDelivery to: ${userProfile.address}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulateCall = () => {
    setCalling(true);
    setTimeout(() => {
      setCalling(false);
      alert(`Simulated Caregiver Call: Connected to ${userProfile.caregiverName} (${userProfile.caregiverPhone}).`);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Family & Caregiver Support
              </span>
              <h2 className="text-xl font-bold text-stone-950 font-serif">
                Caregiver Helper Link
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Linked Caregiver Card */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Registered Caregiver Contact</span>
            </span>
            <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-900 font-semibold rounded-md text-[11px]">
              Verified
            </span>
          </div>

          <div className="pt-1">
            <h4 className="text-base font-bold text-stone-900">{userProfile.caregiverName}</h4>
            <p className="text-xs text-stone-600 font-mono mt-0.5">{userProfile.caregiverPhone}</p>
          </div>

          <p className="text-xs text-stone-600 pt-1">
            If you ever feel confused or need help completing an order, you can call or send your basket with one tap.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Basket Copied to Clipboard!' : 'Share Basket with Daughter (WhatsApp)'}</span>
          </button>

          <button
            onClick={handleSimulateCall}
            disabled={calling}
            className="w-full py-3 px-4 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>{calling ? 'Connecting call...' : `Call ${userProfile.caregiverName}`}</span>
          </button>
        </div>

        {/* Safeguard Note */}
        <div className="mt-5 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>Senior Safeguard:</strong> All orders are double-checked for duplicate items and accidental large quantities before payment.
          </span>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
