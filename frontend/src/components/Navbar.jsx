import React, { useState } from 'react';
import { ShoppingBasket, Sparkles, ChefHat, LayoutDashboard, ShoppingCart, Bot, AlertTriangle, User, LogOut, ChevronDown, ShieldCheck, Crown } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  cartTotal,
  setIsCartOpen,
  lowStockCount,
  aiStatus,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleAdminClick = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      onOpenAuth('admin', 'Store Admin Login Required: Please sign in with an Admin account to access inventory and sales operations.');
    } else {
      setActiveTab('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top micro-bar for promotional & AI notice */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-medium">⚡ Smart Automation</span>
            <span>Free Express Delivery on orders above ₹499 • Real-Time Stock Updates</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>{aiStatus?.mode === 'live-gemini-api' ? 'Google Gemini Live API Connected' : 'SmartBasket AI Engine Active'}</span>
            </span>

            {/* Micro User Switcher indicator */}
            <button
              onClick={() => onOpenAuth(currentUser?.role === 'admin' ? 'customer' : 'admin')}
              className="hidden sm:inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-emerald-200 px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors cursor-pointer"
            >
              <span>Role: {currentUser?.role === 'admin' ? '👑 Admin' : '🛒 Customer'}</span>
              <span className="underline ml-0.5">Switch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <div
            onClick={() => setActiveTab('store')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-850 bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
                  SmartBasket
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart Grocery & Automation</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <ShoppingBasket className="w-4 h-4" />
              Store Catalog
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600" />
              AI Assistant
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">New</span>
            </button>

            <button
              onClick={() => setActiveTab('recipe')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'recipe'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <ChefHat className="w-4 h-4 text-teal-600" />
              AI Recipe Chef
            </button>

            {/* Admin Dashboard tab - Gated with Admin Role */}
            <button
              onClick={handleAdminClick}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer relative ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : currentUser?.role === 'admin'
                  ? 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard</span>
              {currentUser?.role === 'admin' ? (
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">Lock</span>
              )}
              {lowStockCount > 0 && currentUser?.role === 'admin' && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {lowStockCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right side Actions: User Profile Badge & Cart Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Account / Role Badge */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    currentUser.role === 'admin'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span className="max-w-[100px] truncate">{currentUser.name || 'Account'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('customer')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2.5 mb-2 border-b border-slate-100">
                    <p className="font-extrabold text-xs text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                      currentUser.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {currentUser.role === 'admin' ? '👑 Store Administrator' : '🛒 Verified Customer'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth(currentUser.role === 'admin' ? 'customer' : 'admin');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span>Switch to {currentUser.role === 'admin' ? 'Customer' : 'Admin'}</span>
                      <span className="text-[10px] text-emerald-600">Quick Swap</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="hidden sm:flex flex-col text-left text-xs leading-tight">
                <span className="text-emerald-100 font-normal">{cartCount} items</span>
                <span className="font-bold text-sm">₹{cartTotal.toFixed(0)}</span>
              </div>
              {cartCount > 0 && (
                <span className="sm:hidden absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'store' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
          >
            <ShoppingBasket className="w-4 h-4" />
            <span>Store</span>
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'assistant' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('recipe')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'recipe' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
          >
            <ChefHat className="w-4 h-4" />
            <span>AI Chef</span>
          </button>
          <button
            onClick={handleAdminClick}
            className={`flex flex-col items-center gap-1 py-1 px-2 relative ${activeTab === 'admin' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin</span>
            {lowStockCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
