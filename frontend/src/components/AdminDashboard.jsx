import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Package, ShoppingBag, AlertTriangle, Sparkles, RefreshCw,
  Plus, Edit2, Trash2, CheckCircle2, ArrowUpRight, BarChart3, Clock,
  ShieldAlert, Printer, ChevronRight, Filter, DollarSign
} from 'lucide-react';
import {
  fetchSalesAnalytics, generateAiSalesSummary,
  fetchLowStockProducts, fetchAutomationLogs, generateAiRestockReport,
  restockProduct, fetchOrders, updateOrderStatus,
  createProduct, updateProduct, deleteProduct,
  fetchPurchaseOrders, approvePurchaseOrder, triggerAutomationJob
} from '../services/api';

export default function AdminDashboard({ products, onRefreshProducts, onOpenInvoice }) {
  const [adminTab, setAdminTab] = useState('sales'); // 'sales' | 'pos' | 'inventory' | 'products' | 'orders' | 'logs'
  
  // Sales Analytics & AI Insights State
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Purchase Orders & Autonomous Background Pipelines
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [approvingPoId, setApprovingPoId] = useState(null);
  const [runningJob, setRunningJob] = useState(false);
  const [jobTriggerMessage, setJobTriggerMessage] = useState(null);

  // Inventory Automation State
  const [lowStockList, setLowStockList] = useState([]);
  const [restockReport, setRestockReport] = useState(null);
  const [loadingRestockReport, setLoadingRestockReport] = useState(false);
  const [restockAmount, setRestockAmount] = useState({});

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Automation Logs State
  const [logs, setLogs] = useState([]);

  // Product CRUD Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Fruits & Vegetables',
    isVeg: true,
    price: '',
    originalPrice: '',
    unit: '1 kg',
    stock: 20,
    minStockLevel: 10,
    image: '',
    description: '',
    tags: ''
  });
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoadingAnalytics(true);
    try {
      const [salesData, lowStockData, ordersData, logsData, poData] = await Promise.all([
        fetchSalesAnalytics(),
        fetchLowStockProducts(),
        fetchOrders(),
        fetchAutomationLogs(),
        fetchPurchaseOrders().catch(() => ({ purchaseOrders: [] }))
      ]);
      setAnalytics(salesData);
      setLowStockList(lowStockData.lowStockProducts || []);
      setOrders(ordersData.orders || []);
      setLogs(logsData.logs || []);
      setPurchaseOrders(poData.purchaseOrders || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleApprovePO = async (poId) => {
    setApprovingPoId(poId);
    try {
      await approvePurchaseOrder(poId, 'Krishna Patel');
      await loadAllAdminData();
      if (onRefreshProducts) onRefreshProducts();
    } catch (err) {
      alert('Error approving PO: ' + err.message);
    } finally {
      setApprovingPoId(null);
    }
  };

  const handleTriggerJob = async (jobType) => {
    setRunningJob(true);
    setJobTriggerMessage(null);
    try {
      const res = await triggerAutomationJob(jobType);
      setJobTriggerMessage(jobType === 'reorder-nudges'
        ? `✅ Retention Job Executed! Generated ${res.nudgesCount || 0} customer refill suggestions.`
        : `✅ Clearance Job Executed! Generated promotional bundle clearance pairings.`
      );
      await loadAllAdminData();
    } catch (err) {
      setJobTriggerMessage(`❌ Job execution failed: ${err.message}`);
    } finally {
      setRunningJob(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await generateAiSalesSummary();
      setAiSummary(res.summary);
      // Reload logs as automation event was written
      const logsData = await fetchAutomationLogs();
      setLogs(logsData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateAiRestock = async () => {
    setLoadingRestockReport(true);
    try {
      const res = await generateAiRestockReport();
      setRestockReport(res.report);
      const logsData = await fetchAutomationLogs();
      setLogs(logsData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRestockReport(false);
    }
  };

  const handleRestock = async (productId, qty) => {
    try {
      await restockProduct(productId, qty);
      await onRefreshProducts();
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Restock failed');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      const ordersData = await fetchOrders();
      setOrders(ordersData.orders || []);
      const logsData = await fetchAutomationLogs();
      setLogs(logsData.logs || []);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
      } else {
        await createProduct(productForm);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await onRefreshProducts();
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      try {
        await deleteProduct(id);
        await onRefreshProducts();
        await loadAllAdminData();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Fruits & Vegetables',
      price: '',
      originalPrice: '',
      unit: '1 kg',
      stock: 25,
      minStockLevel: 10,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      description: '',
      tags: ''
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      unit: p.unit,
      stock: p.stock,
      minStockLevel: p.minStockLevel,
      image: p.image,
      description: p.description,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : ''
    });
    setIsProductModalOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner / Dashboard Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              Management Portal
            </span>
            <span className="text-slate-400 text-xs">• Real-Time Automated Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            SmartBasket Control Center & Automation
          </h1>
        </div>

        <button
          onClick={loadAllAdminData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Metrics</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{analytics?.summary?.totalRevenue?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Avg ₹{analytics?.summary?.averageOrderValue || 0} / order</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics?.summary?.totalOrders || orders.length}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Recorded in store history
          </p>
        </div>

        {/* Total Catalog Products */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {products.length}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Across 7 grocery categories
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className={`p-5 rounded-3xl border shadow-xs transition-all ${
          lowStockList.length > 0 ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Low Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-950">
            {lowStockList.length}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            {lowStockList.length > 0 ? 'Urgent restock needed' : 'All stocks healthy'}
          </p>
        </div>

      </div>

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'sales', label: '📊 Sales & AI Insights', badge: null },
          { id: 'pos', label: '🤖 AI Purchase Orders', badge: purchaseOrders.filter(p => p.status === 'PENDING_ADMIN_APPROVAL').length || null },
          { id: 'inventory', label: '📦 Inventory Automation', badge: lowStockList.length > 0 ? lowStockList.length : null },
          { id: 'products', label: '🛍️ Catalog Management', badge: products.length },
          { id: 'orders', label: '📋 Orders & Invoices', badge: orders.length },
          { id: 'logs', label: '⚡ Automation Audit Logs', badge: logs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                adminTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* --- TAB 1: SALES & AI INSIGHTS --- */}
      {adminTab === 'sales' && (
        <div className="space-y-6">
          
          {/* AI Business Insights Generator Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Google Gemini AI Executive Consultant</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  Automated Sales Analysis & Strategic Intelligence
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gemini analyzes real order velocities, category distribution, and identifies growth recommendations.
                </p>
              </div>

              <button
                onClick={handleGenerateAiSummary}
                disabled={loadingSummary}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                <span>{loadingSummary ? 'Gemini is Analyzing...' : 'Generate Executive Report'}</span>
              </button>
            </div>

            {/* Render AI summary if present */}
            {aiSummary ? (
              <div className="pt-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-lg font-black text-emerald-300">{aiSummary.headline}</h4>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs">
                    <span>Business Health Score:</span>
                    <strong className="text-emerald-400 font-black text-sm">{aiSummary.healthScore}/100</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                  {aiSummary.executiveSummary}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-1.5">
                    <h5 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">Key Strengths</h5>
                    {aiSummary.keyStrengths?.map((s, idx) => (
                      <p key={idx} className="text-slate-200 flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span> {s}
                      </p>
                    ))}
                  </div>

                  <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl space-y-1.5">
                    <h5 className="font-bold text-rose-300 text-xs uppercase tracking-wider">Critical Inventory Risks</h5>
                    {aiSummary.criticalRisks?.map((r, idx) => (
                      <p key={idx} className="text-slate-200 flex items-start gap-1.5">
                        <span className="text-rose-400">⚠</span> {r}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Strategic recommendations */}
                {aiSummary.strategicRecommendations && (
                  <div className="pt-2">
                    <h5 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-2">
                      Strategic AI Action Items
                    </h5>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {aiSummary.strategicRecommendations.map((rec, i) => (
                        <div key={i} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-xs">
                          <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block">
                            {rec.area}
                          </span>
                          <p className="font-bold text-slate-100">{rec.action}</p>
                          <p className="text-[11px] text-slate-300 mt-1">Impact: {rec.expectedImpact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-6 text-center text-slate-400 text-xs">
                Click "Generate Executive Report" above to run Gemini AI analysis on current store sales.
              </div>
            )}
          </div>

          {/* Best Selling vs Slow Moving Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Best-Selling Products */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-slate-900 text-base mb-1 flex items-center justify-between">
                <span>🔥 Best-Selling Grocery Items</span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Top Drivers</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4">Highest demand velocity based on completed orders</p>

              <div className="divide-y divide-slate-100">
                {analytics?.bestSelling?.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.category} • ₹{p.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm">{p.salesCount} sold</span>
                      <p className="text-[10px] text-emerald-600 font-semibold">₹{p.revenue} rev</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slow Moving Products */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-slate-900 text-base mb-1 flex items-center justify-between">
                <span>📉 Slow-Moving Grocery Items</span>
                <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">Liquidation Risk</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4">Products with stock available but lower sales conversion</p>

              <div className="divide-y divide-slate-100">
                {analytics?.slowMoving?.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.category} • Current stock: {p.stock}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-700 text-xs">{p.salesCount} sold</span>
                      <p className="text-[10px] text-amber-600 font-semibold">Consider discount</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Category Distribution Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h4 className="font-extrabold text-slate-900 text-base mb-3">Category-Wise Revenue Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {analytics?.categoryDistribution?.map((cat, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-800 truncate">{cat.category}</p>
                  <p className="text-sm font-black text-emerald-700 mt-1">₹{cat.revenue.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-500">{cat.totalSalesCount} units • {cat.itemsCount} SKUs</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB: AUTONOMOUS PURCHASE ORDERS (AI DRAFT POs) --- */}
      {adminTab === 'pos' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-900/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Closed-Loop Event Automation</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  Autonomous Purchase Orders & Supply Chain Pipelines
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Orders trigger real-time stock deductions. When safety buffer is breached, AI autonomously generates replenishment POs with wholesale budgets for Krishna Patel approval.
                </p>
              </div>
              <button
                onClick={loadAllAdminData}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync POs</span>
              </button>
            </div>

            {/* Autonomous Background Jobs (Cron Simulation) */}
            <div className="mt-5 pt-2">
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2.5">
                ⚡ Autonomous Scheduled Retail Tasks
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleTriggerJob('reorder-nudges')}
                  disabled={runningJob}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Execute Customer Reorder Nudges Job</span>
                </button>

                <button
                  onClick={() => handleTriggerJob('dead-stock-clearance')}
                  disabled={runningJob}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-amber-400/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Execute Dead-Stock Clearance Tagger</span>
                </button>
              </div>

              {jobTriggerMessage && (
                <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-emerald-200">
                  {jobTriggerMessage}
                </div>
              )}
            </div>
          </div>

          {/* Purchase Orders List */}
          <div className="space-y-4">
            {purchaseOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-base">No Purchase Orders Generated Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Purchase orders are created autonomously when customer checkouts cause inventory to drop below safety thresholds.
                </p>
              </div>
            ) : (
              purchaseOrders.map((po) => {
                const isPending = po.status === 'PENDING_ADMIN_APPROVAL';
                return (
                  <div
                    key={po.id}
                    className={`bg-white rounded-3xl border p-6 shadow-xs space-y-4 transition-all ${
                      isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                    }`}
                  >
                    {/* PO Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-lg">{po.id}</h4>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            po.urgencyLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Urgency: {po.urgencyLevel}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            isPending ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {isPending ? '⏳ Awaiting Admin Approval' : '✅ Approved & Restocked'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Created {new Date(po.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {po.executiveSummary}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[11px] text-slate-400 font-semibold">Total Reorder Investment</p>
                          <p className="text-xl font-black text-slate-900">₹{po.totalAmount?.toLocaleString('en-IN')}</p>
                        </div>

                        {isPending && (
                          <button
                            onClick={() => handleApprovePO(po.id)}
                            disabled={approvingPoId === po.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{approvingPoId === po.id ? 'Replenishing...' : '1-Click Approve & Restock'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* PO Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3 rounded-l-xl">Item</th>
                            <th className="py-2.5 px-3">Current Stock / Min</th>
                            <th className="py-2.5 px-3">Reorder Qty</th>
                            <th className="py-2.5 px-3">Wholesale / Unit</th>
                            <th className="py-2.5 px-3">Subtotal</th>
                            <th className="py-2.5 px-3 rounded-r-xl">AI Justification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(po.items || []).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                              <td className="py-2.5 px-3 text-rose-600 font-bold">{item.currentStock} / {item.minStockLevel || 10}</td>
                              <td className="py-2.5 px-3 font-black text-emerald-700">+{item.recommendedReorderQty} units</td>
                              <td className="py-2.5 px-3 text-slate-600">₹{item.costPerUnit}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">₹{item.totalReorderCost}</td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px] italic max-w-xs">{item.justification}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {!isPending && (
                      <div className="pt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved by {po.approvedBy || 'Krishna Patel'} on {new Date(po.approvedAt).toLocaleString('en-IN')}. Stock added to live store.</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: INVENTORY AUTOMATION --- */}
      {adminTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Low Stock Alert Banner */}
          {lowStockList.length > 0 ? (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-amber-950 text-base">
                    Automated Alert: {lowStockList.length} Products Below Safety Threshold!
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Orders have reduced stock levels below the configured minimum buffer. Restocking is required to avoid checkout drop-offs.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateAiRestock}
                disabled={loadingRestockReport}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loadingRestockReport ? 'animate-spin' : ''}`} />
                <span>{loadingRestockReport ? 'Calculating...' : 'Run AI Restock Priorities'}</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>All catalog products are operating above their safety stock levels. System inventory healthy.</span>
            </div>
          )}

          {/* AI Restock Report Presentation */}
          {restockReport && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-black text-slate-900 text-base">Gemini AI Restocking Priority Analysis</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{restockReport.executiveSummary}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated PO Cost</span>
                  <p className="text-xl font-black text-emerald-700">₹{restockReport.estimatedTotalInvestment?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {restockReport.restockItems?.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <h5 className="font-bold text-slate-800 text-xs">{item.name}</h5>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Stock: <span className="font-bold text-rose-600">{item.currentStock}</span> (Min: {item.minStockLevel})
                      </p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.justification}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                      <div className="text-[11px]">
                        <span className="text-slate-400">Order: </span>
                        <strong className="text-slate-900">+{item.recommendedReorderQty} units</strong>
                      </div>
                      <button
                        onClick={() => handleRestock(item.productId, item.recommendedReorderQty)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        Execute Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Table with Quick Restock Controls */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-base">Live Inventory & Replenishment Controls</h4>
              <span className="text-xs text-slate-400">{products.length} Products Monitored</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Stock Level</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Quick Restock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const isLow = p.stock <= p.minStockLevel;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {p.name}
                          <span className="text-[10px] text-slate-400 block font-normal">{p.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{p.category}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">₹{p.price}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900">{p.stock}</span>
                          <span className="text-[10px] text-slate-400"> / min {p.minStockLevel}</span>
                        </td>
                        <td className="py-3 px-3">
                          {p.stock === 0 ? (
                            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                              Low Stock ({p.stock})
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full text-[10px]">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRestock(p.id, 10)}
                              className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleRestock(p.id, 25)}
                              className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                            >
                              +25
                            </button>
                            <button
                              onClick={() => handleRestock(p.id, 50)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                            >
                              +50
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 3: PRODUCT MANAGEMENT (CRUD) --- */}
      {adminTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <input
              type="text"
              placeholder="Search products in catalog..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs w-full sm:w-72 focus:outline-emerald-600"
            />
            <button
              onClick={openNewProductModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                      <div>
                        <span>{p.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{p.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.category}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">₹{p.price}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{p.stock}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: ORDERS & INVOICES --- */}
      {adminTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-extrabold text-slate-900 text-base">All Customer Orders & Invoices</h4>
            <span className="text-xs text-slate-500">{orders.length} Orders Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.id}</td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(o.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800 block">{o.customer?.name}</span>
                      <span className="text-[10px] text-slate-400">{o.customer?.phone}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{o.items?.length || 0} items</td>
                    <td className="py-3.5 px-3 font-black text-slate-900">₹{o.totalAmount}</td>
                    <td className="py-3.5 px-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-emerald-600 ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : o.status === 'Processing'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenInvoice(o)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: AUTOMATION AUDIT LOGS --- */}
      {adminTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Live Automation Audit Trail</h4>
              <p className="text-xs text-slate-500">Autonomous stock deduction, low stock triggers, and AI event logs</p>
            </div>
            <span className="text-xs text-slate-400">{logs.length} Logged Events</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {logs.map((log) => {
              const isWarning = log.type === 'LOW_STOCK_ALERT';
              const isSuccess = log.type === 'INVOICE_GENERATED' || log.type === 'RESTOCK_AUTOMATION';
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-2xl border text-xs flex items-start gap-3 ${
                    isWarning
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : isSuccess
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 mt-0.5 ${
                    isWarning
                      ? 'bg-amber-500 text-white'
                      : isSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {log.type}
                  </span>

                  <div className="flex-1">
                    <p className="font-semibold">{log.message}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg text-slate-900 mb-4">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Grocery Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                  >
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Dairy & Bakery">Dairy & Bakery</option>
                    <option value="Staples & Grains">Staples & Grains</option>
                    <option value="Snacks & Beverages">Snacks & Beverages</option>
                    <option value="Household & Cleaning">Household & Cleaning</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Specification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg, 500 ml"
                    value={productForm.unit}
                    onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Stock Safety Level</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.minStockLevel}
                    onChange={e => setProductForm({ ...productForm, minStockLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="fresh, organic, breakfast"
                  value={productForm.tags}
                  onChange={e => setProductForm({ ...productForm, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
