import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, MapPin, Phone, User, Mail, CreditCard, Banknote, Sparkles } from 'lucide-react';
import { placeOrder } from '../services/api';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  billSummary,
  onOrderSuccess
}) {
  const [formData, setFormData] = useState({
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    address: '402, Green Meadows Heights, Sector 14, Gurugram, Haryana - 122001',
    paymentMethod: 'UPI'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        customer: formData,
        items: cart.map(i => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          unit: i.unit
        })),
        discount: billSummary.discount || 0
      };

      const result = await placeOrder(payload);

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }

      onOrderSuccess(result.order, result.lowStockAlerts);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to confirm order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
            <div>
              <h3 className="font-extrabold text-lg">Instant Automated Checkout</h3>
              <p className="text-xs text-emerald-200">Direct stock deduction & instant GST invoice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Customer details fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile Number
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address (for invoice)
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Address
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
            />
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: Sparkles },
                { id: 'Credit Card', label: 'Card / Net', icon: CreditCard },
                { id: 'Cash on Delivery', label: 'Pay on Delivery', icon: Banknote }
              ].map(method => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    formData.paymentMethod === method.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <method.icon className="w-4 h-4 text-emerald-600" />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Final Order Review Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>₹{billSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5%)</span>
              <span>₹{billSummary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charges</span>
              <span>{billSummary.deliveryFee === 0 ? 'FREE' : `₹${billSummary.deliveryFee}`}</span>
            </div>
            {billSummary.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount</span>
                <span>-₹{billSummary.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Payable Total:</span>
              <span className="text-emerald-700 text-base">₹{billSummary.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span>Processing Order & Updating Stock...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Order & Generate Invoice (₹{billSummary.grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            🔒 256-Bit SSL Encrypted • Order confirmation immediately locks stock and issues printable GST invoice.
          </p>

        </form>

      </div>
    </div>
  );
}
