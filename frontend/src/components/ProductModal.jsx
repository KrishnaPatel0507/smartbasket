import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, TrendingDown, Star, ShoppingCart } from 'lucide-react';
import { fetchAffordableAlternatives } from '../services/api';

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  cartItem,
  onUpdateQuantity
}) {
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [alternativesData, setAlternativesData] = useState(null);

  useEffect(() => {
    if (product) {
      loadAlternatives(product);
    }
  }, [product]);

  const loadAlternatives = async (prod) => {
    setLoadingAlternatives(true);
    try {
      const res = await fetchAffordableAlternatives({ productId: prod.id, productName: prod.name });
      setAlternativesData(res.data);
    } catch (err) {
      console.error('Failed to load alternatives:', err);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header / Image */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block">
                  {product.category}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  <span className="w-2.5 h-2.5 border-2 border-emerald-400 rounded-xs flex items-center justify-center p-0.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                  </span>
                  100% Pure Veg
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{product.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-200">
                <span className="font-semibold">{product.unit}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {product.rating}
                </span>
                <span>•</span>
                <span className={product.stock > 0 ? 'text-emerald-300 font-medium' : 'text-rose-400 font-bold'}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Price & Primary CTA */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium">SmartBasket Best Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>
            </div>

            <div>
              {product.stock <= 0 ? (
                <span className="px-4 py-2 bg-slate-200 text-slate-500 rounded-xl font-semibold text-sm">
                  Out of Stock
                </span>
              ) : cartItem ? (
                <div className="flex items-center gap-3 bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-md">
                  <button
                    onClick={() => onUpdateQuantity(product.id, cartItem.quantity - 1)}
                    className="font-bold text-lg hover:text-emerald-200 px-1 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-base">{cartItem.quantity} in basket</span>
                  <button
                    onClick={() => onUpdateQuantity(product.id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= product.stock}
                    className="font-bold text-lg hover:text-emerald-200 px-1 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              )}
            </div>
          </div>

          {/* Description & Tags */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Affordable Alternatives Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-900 text-sm">
                  Gemini AI Affordable & Smart Alternatives
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                AI Budget Optimizer
              </span>
            </div>

            {loadingAlternatives ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Sparkles className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
                <span>Gemini is analyzing catalog alternatives...</span>
              </div>
            ) : alternativesData && alternativesData.alternatives?.length > 0 ? (
              <div className="space-y-3">
                {alternativesData.summaryTip && (
                  <p className="text-xs text-emerald-800 italic bg-white/60 p-2.5 rounded-xl border border-emerald-100">
                    💡 {alternativesData.summaryTip}
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  {alternativesData.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3.5 rounded-xl border border-emerald-100/80 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h5 className="font-bold text-slate-800 text-xs line-clamp-1">{alt.name}</h5>
                          <span className="font-black text-emerald-700 text-sm">₹{alt.price}</span>
                        </div>
                        {alt.savingsAmount > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mb-1">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>Save ₹{alt.savingsAmount} vs current</span>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 line-clamp-2">{alt.reason}</p>
                      </div>

                      {alt.productId && (
                        <button
                          onClick={() => {
                            onAddToCart({ id: alt.productId, name: alt.name, price: alt.price, unit: '1 unit' });
                            onClose();
                          }}
                          className="mt-3 w-full py-1.5 px-2 bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Add Alternative (₹{alt.price})
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                This item is already among the most cost-effective choices in its category.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
