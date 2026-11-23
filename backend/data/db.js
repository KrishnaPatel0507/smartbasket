const fs = require('fs');
const path = require('path');
const { initialProducts, initialOrders } = require('./seedProducts');

const DATA_FILE = path.join(__dirname, 'store.json');

class StoreDatabase {
  constructor() {
    this.data = {
      products: [],
      orders: [],
      automationLogs: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure properties exist
        if (!this.data.products || this.data.products.length === 0) {
          this.data.products = [...initialProducts];
        }
        if (!this.data.orders) {
          this.data.orders = [...initialOrders];
        }
        if (!this.data.automationLogs) {
          this.data.automationLogs = [];
        }
      } else {
        this.data = {
          products: [...initialProducts],
          orders: [...initialOrders],
          automationLogs: [
            {
              id: 'log-1',
              timestamp: new Date().toISOString(),
              type: 'SYSTEM_INIT',
              level: 'info',
              message: 'SmartBasket persistent database initialized with initial catalog and seed orders.'
            },
            {
              id: 'log-2',
              timestamp: new Date().toISOString(),
              type: 'LOW_STOCK_ALERT',
              level: 'warning',
              message: 'Automated Scan: Found 5 products operating below minimum safety threshold (Organic Red Onions, Green Capsicum, Malai Paneer, Soft Pav Buns, Epigamia Yogurt).'
            }
          ]
        };
        this.save();
      }
    } catch (err) {
      console.error('Error loading database file, falling back to memory seed:', err);
      this.data = {
        products: [...initialProducts],
        orders: [...initialOrders],
        automationLogs: []
      };
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save store data to disk:', err);
    }
  }

  addLog(type, message, level = 'info', details = null) {
    const logEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      level,
      message,
      details
    };
    this.data.automationLogs.unshift(logEntry);
    // Keep last 150 logs
    if (this.data.automationLogs.length > 150) {
      this.data.automationLogs = this.data.automationLogs.slice(0, 150);
    }
    this.save();
    return logEntry;
  }

  // --- Products CRUD & Management ---
  getProducts(filters = {}) {
    let result = [...this.data.products];
    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    if (filters.inStock === 'true' || filters.inStock === true) {
      result = result.filter(p => p.stock > 0);
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }
    if (filters.sort) {
      if (filters.sort === 'price-low') result.sort((a, b) => a.price - b.price);
      else if (filters.sort === 'price-high') result.sort((a, b) => b.price - a.price);
      else if (filters.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
      else if (filters.sort === 'popular') result.sort((a, b) => b.salesCount - a.salesCount);
    }
    return result;
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(productData) {
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: productData.name,
      category: productData.category || 'Staples & Grains',
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice || productData.price) || 0,
      unit: productData.unit || '1 unit',
      stock: Number(productData.stock) || 0,
      minStockLevel: Number(productData.minStockLevel) || 10,
      image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      description: productData.description || '',
      tags: Array.isArray(productData.tags) ? productData.tags : (productData.tags ? productData.tags.split(',').map(s => s.trim()) : []),
      rating: 4.8,
      salesCount: 0,
      isFeatured: Boolean(productData.isFeatured)
    };

    this.data.products.push(newProduct);
    this.addLog('PRODUCT_ADDED', `New catalog product added: "${newProduct.name}" (Stock: ${newProduct.stock})`, 'info', { productId: newProduct.id });
    this.save();
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const oldProduct = this.data.products[idx];
    const updated = {
      ...oldProduct,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : oldProduct.price,
      stock: updates.stock !== undefined ? Number(updates.stock) : oldProduct.stock,
      minStockLevel: updates.minStockLevel !== undefined ? Number(updates.minStockLevel) : oldProduct.minStockLevel
    };

    this.data.products[idx] = updated;

    // Check low stock trigger
    if (updated.stock <= updated.minStockLevel) {
      this.addLog('LOW_STOCK_ALERT', `Stock update alert: "${updated.name}" is at or below minimum threshold (${updated.stock}/${updated.minStockLevel} left)!`, 'warning', { productId: updated.id, stock: updated.stock });
    }

    this.save();
    return updated;
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const removed = this.data.products.splice(idx, 1)[0];
    this.addLog('PRODUCT_DELETED', `Product "${removed.name}" removed from catalog.`, 'info', { productId: id });
    this.save();
    return true;
  }

  restockProduct(id, quantity) {
    const product = this.getProductById(id);
    if (!product) return null;

    const oldStock = product.stock;
    product.stock += Number(quantity);
    this.addLog('RESTOCK_AUTOMATION', `Automated Restock: Replenished ${quantity} units for "${product.name}". Previous: ${oldStock}, New Stock: ${product.stock}`, 'success', { productId: id, added: quantity, newStock: product.stock });
    this.save();
    return product;
  }

  getLowStockProducts() {
    return this.data.products.filter(p => p.stock <= p.minStockLevel);
  }

  // --- Automated Order & Billing Engine ---
  createOrder(orderInput) {
    const { customer, items, discount = 0 } = orderInput;

    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    // Step 1: Stock Validation (prevent duplicate or over-selling)
    for (const item of items) {
      const prod = this.getProductById(item.productId);
      if (!prod) {
        throw new Error(`Product "${item.name || item.productId}" does not exist.`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, requested: ${item.quantity}.`);
      }
    }

    // Step 2: Automated Billing Calculation
    let subtotal = 0;
    const processedItems = items.map(item => {
      const prod = this.getProductById(item.productId);
      const itemPrice = prod.price;
      const lineTotal = itemPrice * item.quantity;
      subtotal += lineTotal;
      return {
        productId: prod.id,
        name: prod.name,
        price: itemPrice,
        quantity: item.quantity,
        unit: prod.unit,
        total: lineTotal
      };
    });

    const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST
    const deliveryFee = subtotal >= 499 ? 0 : 40; // Free delivery over ₹499
    const grandTotal = Number((subtotal + tax + deliveryFee - Number(discount)).toFixed(2));

    const invoiceNumber = `SB-INV-${new Date().getFullYear()}-${1000 + this.data.orders.length + 1}`;

    const newOrder = {
      id: invoiceNumber,
      orderDate: new Date().toISOString(),
      customer: {
        name: customer.name || 'Valued Customer',
        email: customer.email || 'customer@example.com',
        phone: customer.phone || '',
        address: customer.address || '',
        paymentMethod: customer.paymentMethod || 'UPI'
      },
      items: processedItems,
      subtotal,
      tax,
      deliveryFee,
      discount: Number(discount) || 0,
      totalAmount: grandTotal,
      status: 'Confirmed'
    };

    // Step 3: Automated Stock Deduction & Trigger Alerts
    const lowStockAlertsTriggered = [];
    for (const item of processedItems) {
      const prod = this.getProductById(item.productId);
      prod.stock -= item.quantity;
      prod.salesCount = (prod.salesCount || 0) + item.quantity;

      this.addLog(
        'STOCK_REDUCED',
        `Stock automatically deducted for "${prod.name}": -${item.quantity} units (Remaining: ${prod.stock})`,
        'info',
        { productId: prod.id, orderId: invoiceNumber, quantity: item.quantity }
      );

      // Automated Low-Stock Alert trigger
      if (prod.stock <= prod.minStockLevel) {
        const alertMsg = `AUTOMATION ALERT: Stock for "${prod.name}" dropped to ${prod.stock} (Threshold: ${prod.minStockLevel}). Urgent restock needed!`;
        this.addLog('LOW_STOCK_ALERT', alertMsg, 'warning', {
          productId: prod.id,
          currentStock: prod.stock,
          minStockLevel: prod.minStockLevel
        });
        lowStockAlertsTriggered.push({
          productId: prod.id,
          name: prod.name,
          currentStock: prod.stock,
          minStockLevel: prod.minStockLevel
        });
      }
    }

    // Step 4: Record Invoice and Save Order
    this.addLog(
      'INVOICE_GENERATED',
      `Automated Billing: Invoice ${invoiceNumber} generated for ${newOrder.customer.name} (Amount: ₹${grandTotal}).`,
      'success',
      { orderId: invoiceNumber, total: grandTotal, itemsCount: processedItems.length }
    );

    this.data.orders.unshift(newOrder);
    this.save();

    return {
      order: newOrder,
      lowStockAlerts: lowStockAlertsTriggered
    };
  }

  getOrders() {
    return this.data.orders;
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  updateOrderStatus(id, status) {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.status = status;
    this.addLog('ORDER_STATUS_CHANGED', `Order ${id} status updated to "${status}".`, 'info', { orderId: id, status });
    this.save();
    return order;
  }

  getAutomationLogs() {
    return this.data.automationLogs;
  }

  // --- Sales & Analytics Engine ---
  getSalesAnalytics() {
    const products = this.data.products;
    const orders = this.data.orders;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock <= p.minStockLevel).length;

    // Top selling products (sorted by salesCount)
    const bestSelling = [...products]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        salesCount: p.salesCount || 0,
        revenue: (p.salesCount || 0) * p.price,
        stock: p.stock
      }));

    // Slow moving products (stock > 0, low sales count)
    const slowMoving = [...products]
      .filter(p => p.stock > 0)
      .sort((a, b) => (a.salesCount || 0) - (b.salesCount || 0))
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        salesCount: p.salesCount || 0,
        stock: p.stock
      }));

    // Category-wise sales
    const categoryStats = {};
    products.forEach(p => {
      if (!categoryStats[p.category]) {
        categoryStats[p.category] = { category: p.category, itemsCount: 0, totalSalesCount: 0, revenue: 0 };
      }
      categoryStats[p.category].itemsCount += 1;
      categoryStats[p.category].totalSalesCount += (p.salesCount || 0);
      categoryStats[p.category].revenue += (p.salesCount || 0) * p.price;
    });

    // Recent 7 days trend calculation (using orders)
    const dailySalesMap = {};
    orders.forEach(o => {
      const dateKey = new Date(o.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dailySalesMap[dateKey] = (dailySalesMap[dateKey] || 0) + o.totalAmount;
    });

    const salesTrend = Object.keys(dailySalesMap).map(date => ({
      date,
      amount: Math.round(dailySalesMap[date])
    }));

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalProducts,
        lowStockCount,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
      },
      bestSelling,
      slowMoving,
      categoryDistribution: Object.values(categoryStats),
      salesTrend
    };
  }
}

const db = new StoreDatabase();
module.exports = db;
