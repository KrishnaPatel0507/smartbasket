import React from 'react';
import { Star, Plus, Minus, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetails,
  onFindAlternatives
}) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockLevel;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {discountPercent > 0 && (
          <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            ★ Popular
          </span>
        )}
      </div>

      {/* Stock status indicator */}
      <div className="absolute top-3 right-3 z-10">
        {isOutOfStock ? (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
            Only {product.stock} left!
          </span>
        ) : (
          <span className="bg-emerald-100/90 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
            In Stock
          </span>
        )}
      </div>

      {/* Product Image */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative h-48 w-full bg-slate-50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title with Indian Vegetarian Symbol */}
          <div className="flex items-start gap-1.5">
            <span
              className="mt-1 inline-flex items-center justify-center w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs p-0.5 shrink-0"
              title="100% Pure Vegetarian"
            >
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
            </span>
            <h3
              onClick={() => onOpenDetails(product)}
              className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-base line-clamp-1 cursor-pointer flex-1"
              title={product.name}
            >
              {product.name}
            </h3>
          </div>

          {/* Unit / Weight */}
          <p className="text-xs text-slate-500 font-medium mt-0.5 mb-2">
            Unit: <span className="text-slate-700">{product.unit}</span>
          </p>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* AI Alternatives button */}
            <button
              onClick={() => onFindAlternatives(product)}
              title="Find cheaper or healthier AI alternatives"
              className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Cart Button or Quantity Selector */}
            {isOutOfStock ? (
              <button
                disabled
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed text-center"
              >
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="flex-1 flex items-center justify-between bg-emerald-700 text-white rounded-xl px-2 py-1.5 shadow-sm">
                <button
                  onClick={() => onUpdateQuantity(product.id, cartItem.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm px-2">{cartItem.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= product.stock}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                    cartItem.quantity >= product.stock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-800 cursor-pointer'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white font-semibold text-xs shadow-xs hover:shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add to Cart
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
