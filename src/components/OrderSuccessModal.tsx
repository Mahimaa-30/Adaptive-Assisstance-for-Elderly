import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, Volume2, Share2, PackageCheck, Bike, Home, Sparkles } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onReadOrderAloud: (order: Order) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onReadOrderAloud,
  fontSize,
}) => {
  if (!order) return null;

  const [deliveryStep, setDeliveryStep] = useState<number>(1);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Simulate delivery partner progress for the 10-minute quick commerce order
  useEffect(() => {
    const timer1 = setTimeout(() => setDeliveryStep(2), 5000);
    const timer2 = setTimeout(() => setDeliveryStep(3), 12000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [order]);

  const handleShareWithCaregiver = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
            Order Confirmed & Secured
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-950 font-serif">
            Arriving in 10 Minutes!
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Your fresh essentials are being packed at Malleshwaram QuickHub.
          </p>
        </div>

        {/* Live 4-Stage Delivery Progress Stepper */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Simulated ETA: 8-10 Mins</span>
            </span>
            <span className="text-emerald-800 font-semibold">
              Rider: Ramesh (EV Scooter)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-medium">
            <div className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              deliveryStep >= 1 ? 'bg-emerald-800 text-white font-bold' : 'bg-white text-stone-400'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>Placed</span>
            </div>
            <div className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              deliveryStep >= 2 ? 'bg-emerald-800 text-white font-bold' : 'bg-white text-stone-400'
            }`}>
              <PackageCheck className="w-4 h-4" />
              <span>Packed</span>
            </div>
            <div className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              deliveryStep >= 3 ? 'bg-emerald-800 text-white font-bold' : 'bg-white text-stone-400'
            }`}>
              <Bike className="w-4 h-4" />
              <span>On Way</span>
            </div>
            <div className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              deliveryStep >= 4 ? 'bg-emerald-800 text-white font-bold' : 'bg-white text-stone-400'
            }`}>
              <Home className="w-4 h-4" />
              <span>Delivered</span>
            </div>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 mb-6 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200 text-xs text-stone-500 font-mono">
            <span>Order #{order.id.slice(-6).toUpperCase()}</span>
            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="divide-y divide-stone-100 my-2">
            {order.items.map(item => (
              <div key={item.product.id} className="py-1.5 flex justify-between items-center text-xs sm:text-sm">
                <span className="font-semibold text-stone-900">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-mono tabular-nums font-bold text-stone-800">
                  ₹{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-base text-stone-950">
            <span>Total to pay ({order.paymentMethod}):</span>
            <span className="font-mono tabular-nums text-emerald-800 text-lg">₹{order.total}</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Delivering to: {order.deliveryAddress}
          </p>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Read Receipt Aloud */}
            <button
              onClick={() => onReadOrderAloud(order)}
              className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>Read Receipt Aloud</span>
            </button>

            {/* Share with Caregiver */}
            <button
              onClick={handleShareWithCaregiver}
              className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>{shareSuccess ? 'Receipt Sent to Caregiver!' : 'Notify Daughter (Ananya)'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-base shadow-sm transition-colors cursor-pointer"
          >
            Done · Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
