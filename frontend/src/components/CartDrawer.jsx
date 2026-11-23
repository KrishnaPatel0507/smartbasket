import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { fetchCartRecommendations } from '../services/api';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
  onAddToCart
}) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMsg, setDiscountMsg] = useState('');
  const [aiRecs, setAiRecs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Automated Bill Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = Number((subtotal * 0.05).toFixed(2)); // 5% GST
  const freeDeliveryThreshold = 499;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const grandTotal = Math.max(0, Number((subtotal + gst + deliveryFee - appliedDiscount).toFixed(2)));

  // Load AI cart recommendations when cart changes
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      loadCartRecommendations();
    }
  }, [isOpen, cart.length]);

  const loadCartRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetchCartRecommendations(cart);
      if (res.data?.recommendations) {
        setAiRecs(res.data.recommendations);
      }
    } catch (err) {
      console.error('Failed to get cart recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'SMART10') {
      const disc = Math.round(subtotal * 0.10);
      setAppliedDiscount(disc);
      setDiscountMsg(`🎉 Promo applied! You saved ₹${disc} (10% off)`);
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(deliveryFee);
      setDiscountMsg(`🎉 Free delivery promo applied!`);
    } else if (code === 'SAVE50' && subtotal >= 500) {
      setAppliedDiscount(50);
      setDiscountMsg(`🎉 Flat ₹50 discount applied!`);
    } else {
      setDiscountMsg('❌ Invalid promo code. Try SMART10 or SAVE50');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-emerald-200" />
              <h2 className="font-extrabold text-lg">Your Grocery Basket</h2>
              <span className="bg-emerald-800 text-emerald-200 text-xs px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery progress bar */}
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs">
            {subtotal >= freeDeliveryThreshold ? (
              <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                🎉 Congratulations! You unlocked <strong>FREE Express Delivery</strong>.
              </span>
            ) : (
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Add <strong>₹{(freeDeliveryThreshold - subtotal).toFixed(0)}</strong> more for FREE delivery</span>
                  <span className="text-emerald-700 font-bold">{Math.round((subtotal / freeDeliveryThreshold) * 100)}%</span>
                </div>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-700 text-base">Your basket is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Explore fresh vegetables, dairy, pulses, or use our AI Budget Planner to assemble a full basket in 1 click!
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-emerald-200 transition-all flex items-center gap-3"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.unit}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-extrabold text-sm text-slate-900">₹{item.price * item.quantity}</span>
                      <span className="text-[10px] text-slate-400">(₹{item.price} each)</span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock && item.quantity >= item.stock}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            {/* AI Complementary Recommendations Widget */}
            {cart.length > 0 && aiRecs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Gemini AI Recommends for Your Basket:
                  </span>
                </div>

                <div className="space-y-2">
                  {aiRecs.map((rec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{rec.name}</p>
                        <p className="text-[10px] text-emerald-800 truncate">{rec.reason}</p>
                      </div>
                      <button
                        onClick={() => onAddToCart({ id: rec.productId, name: rec.name, price: rec.price, unit: '1 unit' })}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
                      >
                        + ₹{rec.price}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer: Automated Bill Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter coupon (e.g. SMART10)"
                    className="w-full pl-8 pr-3 py-2 bg-white rounded-xl text-xs border border-slate-200 uppercase font-semibold focus:outline-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </form>
              {discountMsg && (
                <p className="text-[11px] font-semibold text-emerald-700">{discountMsg}</p>
              )}

              {/* Bill Details Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5% automated)</span>
                  <span className="font-semibold text-slate-800">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'font-semibold text-slate-800'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Savings</span>
                    <span>-₹{appliedDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-emerald-700 text-base">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Trigger Button */}
              <button
                onClick={() => {
                  onProceedCheckout({ subtotal, tax: gst, deliveryFee, discount: appliedDiscount, grandTotal });
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
