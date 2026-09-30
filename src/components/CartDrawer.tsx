import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, MapPin, Clock, Banknote, HeartHandshake, CheckCircle2, RotateCcw, ShoppingBag } from 'lucide-react';
import { AssistanceState, CartItem, Product, UserProfile } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (product: Product, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  userProfile: UserProfile;
  assistanceState: AssistanceState;
  onPlaceOrder: (paymentMethod: 'COD' | 'CAREGIVER_BILL' | 'UPI') => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  undoAction: { message: string; onUndo: () => void } | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  userProfile,
  assistanceState,
  onPlaceOrder,
  fontSize,
  undoAction,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<'COD' | 'CAREGIVER_BILL' | 'UPI'>('COD');
  const [showHighAssistanceConfirmation, setShowHighAssistanceConfirmation] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 150 ? 0 : 25;
  const total = subtotal + deliveryFee;

  const isHighAssistance = assistanceState === 'HIGH_ASSISTANCE';
  const isGuided = assistanceState === 'GUIDED_ASSISTANCE';

  const handleCheckoutClick = () => {
    if (isHighAssistance) {
      setShowHighAssistanceConfirmation(true);
    } else {
      onPlaceOrder(selectedPayment);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <h2 className={`font-bold text-stone-900 ${
              fontSize === 'xlarge' ? 'text-2xl' : 'text-xl'
            }`}>
              Your Shopping Basket ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close basket"
            className="w-10 h-10 rounded-full hover:bg-stone-100 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Undo Toast Notification if an accidental action occurred */}
        {undoAction && (
          <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 shadow-sm animate-pulse">
            <div className="text-xs text-amber-950 font-medium">
              {undoAction.message}
            </div>
            <button
              onClick={undoAction.onUndo}
              className="px-3 py-1 bg-amber-800 text-white rounded-lg text-xs font-bold hover:bg-amber-900 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </div>
        )}

        {/* High Assistance Pre-Order Confirmation Screen */}
        {showHighAssistanceConfirmation ? (
          <div className="p-6 flex-1 flex flex-col justify-between bg-emerald-50/50">
            <div>
              <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2">
                Order Verification & Peace of Mind
              </h3>
              <p className="text-sm text-stone-600 mb-6">
                Please take a relaxed moment to verify the details below before we send the delivery partner.
              </p>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 mb-4 space-y-3">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Items you will receive:
                </div>
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm py-1 border-b border-stone-100 last:border-none">
                    <span className="font-semibold text-stone-900">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-stone-900">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2 text-sm text-stone-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Delivering to:</strong> {userProfile.address}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <strong>Pay:</strong> Cash on Delivery (₹{total})
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <button
                onClick={() => {
                  setShowHighAssistanceConfirmation(false);
                  onPlaceOrder(selectedPayment);
                }}
                className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white text-lg font-bold rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>Yes, Place My Order (₹{total})</span>
              </button>
              <button
                onClick={() => setShowHighAssistanceConfirmation(false)}
                className="w-full py-3 bg-white border border-stone-300 text-stone-700 font-semibold rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Go Back and Review Items
              </button>
            </div>
          </div>
        ) : (
          /* Normal / Guided Cart View */
          <div className="p-5 flex-1 flex flex-col justify-between">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">
                  Your basket is currently empty
                </h3>
                <p className="text-sm text-stone-500 max-w-xs mb-6">
                  Tap the microphone above and say &ldquo;Buy 1 litre milk&rdquo; or click Add on any item.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-semibold hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  Browse Essentials
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Delivery Location Preview */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-stone-700 flex-1">
                    <span className="font-semibold text-stone-900 block">
                      Delivering in 10 mins to:
                    </span>
                    <span className="text-stone-600 block line-clamp-1">{userProfile.address}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 divide-y divide-stone-100">
                  {items.map((item) => (
                    <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-stone-900 text-sm truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-xs text-stone-500 font-mono">
                            {item.product.packSize} · ₹{item.product.price} each
                          </span>
                        </div>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}
                          aria-label={`Reduce quantity of ${item.product.name}`}
                          className="w-8 h-8 rounded-lg bg-white text-stone-800 hover:bg-stone-200 font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm font-mono tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.product.name}`}
                          className="w-8 h-8 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Mode Selector */}
                <div className="pt-4 border-t border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Choose How You Want to Pay:
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {/* Cash on Delivery (Senior Favorite) */}
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      selectedPayment === 'COD' 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-200' 
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'COD'}
                        onChange={() => setSelectedPayment('COD')}
                        className="w-4 h-4 text-emerald-800"
                      />
                      <Banknote className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div className="text-xs">
                        <strong className="block text-stone-900 font-bold text-sm">
                          Cash on Delivery (Pay at Doorstep)
                        </strong>
                        <span className="text-stone-500">
                          Hand ₹{total} in cash to the delivery partner when your items arrive.
                        </span>
                      </div>
                    </label>

                    {/* Caregiver Pay Link */}
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      selectedPayment === 'CAREGIVER_BILL' 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-200' 
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'CAREGIVER_BILL'}
                        onChange={() => setSelectedPayment('CAREGIVER_BILL')}
                        className="w-4 h-4 text-emerald-800"
                      />
                      <HeartHandshake className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div className="text-xs">
                        <strong className="block text-stone-900 font-bold text-sm">
                          Send Bill to Daughter ({userProfile.caregiverName})
                        </strong>
                        <span className="text-stone-500">
                          An SMS payment link will be sent to your daughter to pay securely.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono tabular-nums">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Partner Fee (10 mins):</span>
                    <span className="font-mono tabular-nums text-emerald-700 font-semibold">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                    <span>Total Amount to Pay:</span>
                    <span className="font-mono tabular-nums text-xl">₹{total}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-base shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>Place Order (₹{total})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
