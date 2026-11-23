import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import PrintableInvoice from './components/PrintableInvoice';
import AiBudgetPlanner from './components/AiBudgetPlanner';
import AiRecipeGenerator from './components/AiRecipeGenerator';
import AdminDashboard from './components/AdminDashboard';
import FloatingChatbot from './components/FloatingChatbot';
import AuthModal from './components/AuthModal';
import { fetchProducts, fetchAiStatus, fetchLowStockProducts } from './services/api';
import {
  Search, SlidersHorizontal, Sparkles, ChefHat, ArrowRight,
  ShieldCheck, Truck, RefreshCw, AlertTriangle, CheckCircle2,
  HeartHandshake, HelpCircle, ShieldAlert, Lock, Crown, User
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'assistant' | 'recipe' | 'admin'
  
  // User Authentication State (Customer vs Admin)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartbasket_user');
      return saved ? JSON.parse(saved) : {
        id: 'user-customer',
        name: 'Rahul Sharma',
        email: 'user@smartbasket.com',
        role: 'customer'
      };
    } catch {
      return { id: 'user-customer', name: 'Rahul Sharma', email: 'user@smartbasket.com', role: 'customer' };
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState('customer');
  const [authModalMessage, setAuthModalMessage] = useState('');

  // Products & Filtering
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);

  // System & AI Status
  const [aiStatus, setAiStatus] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [systemAlertBanner, setSystemAlertBanner] = useState(null);

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('smartbasket_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [billSummaryForCheckout, setBillSummaryForCheckout] = useState(null);

  const categories = [
    'All',
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Bakery & Bread',
    'Staples & Grains',
    'Snacks & Beverages',
    'Household & Cleaning',
    'Personal Care'
  ];

  // Save auth user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('smartbasket_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('smartbasket_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartbasket_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Load initial catalog & system statuses
  useEffect(() => {
    loadProducts();
    checkSystemStatus();
  }, []);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetchProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const checkSystemStatus = async () => {
    try {
      const [aiData, lowStockData] = await Promise.all([
        fetchAiStatus(),
        fetchLowStockProducts()
      ]);
      setAiStatus(aiData);
      setLowStockCount(lowStockData.count || 0);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleOpenAuth = (role = 'customer', message = '') => {
    setAuthModalRole(role);
    setAuthModalMessage(message);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('store');
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  // Cart operations
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        unit: product.unit,
        image: product.image,
        stock: product.stock,
        quantity: 1
      }];
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i));
  };

  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleAddMultipleToCart = (items) => {
    setCart(prev => {
      const newCart = [...prev];
      items.forEach(newItem => {
        const idx = newCart.findIndex(i => i.id === newItem.id);
        if (idx !== -1) {
          newCart[idx].quantity += (newItem.quantity || 1);
        } else {
          const fullProd = products.find(p => p.id === newItem.id);
          newCart.push({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            unit: newItem.unit || '1 unit',
            image: fullProd?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
            stock: fullProd?.stock || 50,
            quantity: newItem.quantity || 1
          });
        }
      });
      return newCart;
    });
    setIsCartOpen(true);
  };

  const handleProceedCheckout = (summary) => {
    setBillSummaryForCheckout(summary);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order, alerts) => {
    setIsCheckoutOpen(false);
    setCart([]);
    setActiveInvoice(order);

    loadProducts();
    checkSystemStatus();

    if (alerts && alerts.length > 0) {
      setSystemAlertBanner({
        message: `Inventory Alert: Order confirmation triggered low stock threshold for ${alerts.length} product(s). Restock alert logged!`,
        alerts
      });
      setTimeout(() => setSystemAlertBanner(null), 8000);
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStock = !inStockOnly || p.stock > 0;
    const matchesPrice = p.price <= maxPrice;
    return matchesCategory && matchesSearch && matchesStock && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.salesCount || 0) - (a.salesCount || 0);
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar with User State */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        cartTotal={cartTotal}
        setIsCartOpen={setIsCartOpen}
        lowStockCount={lowStockCount}
        aiStatus={aiStatus}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Real-time System Automation Alert Banner */}
      {systemAlertBanner && (
        <div className="bg-amber-500 text-slate-950 font-bold text-xs py-2 px-4 shadow-sm animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>{systemAlertBanner.message}</span>
            </div>
            <button
              onClick={() => {
                if (currentUser?.role === 'admin') setActiveTab('admin');
                else handleOpenAuth('admin', 'Admin login required to view inventory alerts.');
              }}
              className="px-2.5 py-0.5 bg-slate-950 text-amber-300 rounded-md text-[11px] hover:bg-slate-900 cursor-pointer"
            >
              View in Admin Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: CUSTOMER STOREFRONT */}
        {activeTab === 'store' && (
          <div className="space-y-8">
            
            {/* Hero Banner with AI Teaser & CTAs */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-6 sm:p-10 shadow-xl">
              <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Gen Smart Grocery Experience</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Fresh Farm Groceries, <br />
                  <span className="text-emerald-300">Optimized with Gemini AI.</span>
                </h1>

                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
                  Shop daily staples in INR with automated stock accuracy, plan weekly baskets strictly within your budget, and generate recipes from leftover ingredients with 1-click cart addition.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('assistant')}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer hover:scale-103"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Plan Under My Budget</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('recipe')}
                    className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
                  >
                    <ChefHat className="w-4 h-4 text-emerald-300" />
                    <span>AI Recipe Chef</span>
                  </button>
                </div>
              </div>

              {/* Service Badges */}
              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-emerald-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-300" />
                  <span>Free Delivery &gt; ₹499</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>100% Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Gemini AI Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-300" />
                  <span>Live Automated Stock</span>
                </div>
              </div>
            </div>

            {/* Category Selector Pills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Shop by Category</h3>
                <span className="text-xs text-slate-500">{products.length} Products Available</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search, Filter & Sort Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
              
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search fresh mangoes, milk, atta, paneer, tea, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 focus:outline-emerald-600"
                />
              </div>

              {/* Price slider */}
              <div className="flex items-center gap-2 w-full md:w-auto px-2">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                  Max: ₹{maxPrice}
                </span>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24 sm:w-28 accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* In stock only toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>In Stock Only</span>
              </label>

              {/* Sort by dropdown */}
              <div className="w-full md:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-emerald-600"
                >
                  <option value="popular">Sort: Best Sellers</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

            </div>

            {/* Product Catalog Grid */}
            {loadingProducts ? (
              <div className="py-20 text-center text-slate-500 text-xs">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                <span>Loading SmartBasket grocery inventory...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
                <p className="text-base font-bold text-slate-700">No products match your current filters</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or adjusting the price range.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setMaxPrice(500);
                    setInStockOnly(false);
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find(i => i.id === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      cartItem={cartItem}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onOpenDetails={setSelectedProductDetails}
                      onFindAlternatives={(p) => setSelectedProductDetails(p)}
                    />
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: AI SHOPPING ASSISTANT */}
        {activeTab === 'assistant' && (
          <AiBudgetPlanner
            onAddMultipleToCart={handleAddMultipleToCart}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* VIEW 3: AI RECIPE GENERATOR */}
        {activeTab === 'recipe' && (
          <AiRecipeGenerator
            onAddMultipleToCart={handleAddMultipleToCart}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* VIEW 4: ADMIN DASHBOARD (PROTECTED) */}
        {activeTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard
              products={products}
              onRefreshProducts={loadProducts}
              onOpenInvoice={(order) => setActiveInvoice(order)}
            />
          ) : (
            /* Protected Access Screen when non-admin accesses Admin tab */
            <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Role-Based Security Gate
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Store Admin Access Required
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  The Admin Dashboard contains sensitive store operations, sales metrics, inventory restock priority analysis, and live audit logs.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Current logged in user:</span>
                  <strong className="text-slate-800">{currentUser?.name || 'Guest'}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Current role:</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {currentUser?.role || 'Guest'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCurrentUser({
                      id: 'user-admin',
                      name: 'Krishna Patel',
                      email: 'admin@smartbasket.com',
                      role: 'admin'
                    });
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>1-Click Switch to Krishna Patel (Store Admin)</span>
                </button>

                <button
                  onClick={() => handleOpenAuth('admin', 'Sign in with store admin credentials')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Sign In with Different Account
                </button>

                <button
                  onClick={() => setActiveTab('store')}
                  className="text-xs font-semibold text-emerald-700 hover:underline pt-1 cursor-pointer"
                >
                  Return to Customer Store
                </button>
              </div>
            </div>
          )
        )}

      </main>

      {/* Auth Modal for User & Admin Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authModalRole}
        message={authModalMessage}
      />

      {/* Floating Chatbot Widget */}
      <FloatingChatbot cart={cart} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedCheckout={handleProceedCheckout}
        onAddToCart={handleAddToCart}
      />

      {/* Product Details & AI Alternatives Modal */}
      {selectedProductDetails && (
        <ProductModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onAddToCart={handleAddToCart}
          cartItem={cart.find(i => i.id === selectedProductDetails.id)}
          onUpdateQuantity={handleUpdateQuantity}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && billSummaryForCheckout && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          billSummary={billSummaryForCheckout}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Printable Invoice Modal */}
      {activeInvoice && (
        <PrintableInvoice
          order={activeInvoice}
          onClose={() => setActiveInvoice(null)}
          onContinueShopping={() => {
            setActiveInvoice(null);
            setActiveTab('store');
          }}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 text-sm">SmartBasket</span>
            <span>• AI-Powered Smart Grocery Store & Automation System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Prices in INR (₹)</span>
            <span>•</span>
            <span>Google Gemini AI</span>
            <span>•</span>
            <span>Automated Inventory & GST Billing</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
