import React from 'react';
import { Printer, X, CheckCircle2, ShoppingBasket, Download, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PrintableInvoice({
  order,
  onClose,
  onContinueShopping
}) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.orderDate).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Order Placed & Invoice Generated</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white text-slate-800">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <ShoppingBasket className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">SmartBasket</h1>
                <p className="text-xs text-slate-500">AI-Powered Smart Grocery & Automation</p>
                <p className="text-[11px] text-slate-400 mt-0.5">GSTIN: 07AAACG0123Q1Z2 • FSSAI Lic: 10019011000123</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider mb-1">
                Tax Invoice
              </div>
              <p className="text-sm font-black text-slate-900">{order.id}</p>
              <p className="text-xs text-slate-500">Date: {formattedDate}</p>
              <p className="text-xs text-emerald-700 font-semibold">Status: {order.status}</p>
            </div>
          </div>

          {/* Billed To / Shipping Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Customer Details</h4>
              <p className="font-bold text-slate-900 text-sm">{order.customer?.name}</p>
              <p className="text-slate-600">{order.customer?.phone}</p>
              <p className="text-slate-600">{order.customer?.email}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Delivery Address & Payment</h4>
              <p className="text-slate-700 leading-relaxed">{order.customer?.address}</p>
              <p className="text-slate-600 mt-1">Payment Method: <span className="font-semibold text-slate-900">{order.customer?.paymentMethod}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Unit</th>
                  <th className="py-2 text-right">Price (₹)</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 text-center text-slate-500">{item.unit || 'unit'}</td>
                    <td className="py-2.5 text-right text-slate-700">₹{item.price}</td>
                    <td className="py-2.5 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2.5 text-right font-extrabold text-slate-900">₹{item.total || item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t border-slate-300 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%):</span>
                <span>₹{(order.tax / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%):</span>
                <span>₹{(order.tax / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span className={order.deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="text-emerald-700 text-base">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Disclaimer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
            <p>Thank you for choosing SmartBasket! For order support, contact support@smartbasket.local or +91 1800-SMART-GROCERY</p>
            <p>This is a computer-generated tax invoice. No physical signature required.</p>
          </div>

        </div>

        {/* Modal Bottom Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            A confirmation email with the invoice has been dispatched.
          </p>
          <button
            onClick={() => {
              onClose();
              if (onContinueShopping) onContinueShopping();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
