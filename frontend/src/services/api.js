const API_BASE = '/api';

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products?${query}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
}

export async function createProduct(productData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id, updates) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function restockProduct(id, quantity) {
  const res = await fetch(`${API_BASE}/products/${id}/restock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to restock product');
  }
  return res.json();
}

export async function placeOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Order placement failed');
  }
  return data;
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function fetchLowStockProducts() {
  const res = await fetch(`${API_BASE}/inventory/low-stock`);
  if (!res.ok) throw new Error('Failed to fetch low stock products');
  return res.json();
}

export async function fetchAutomationLogs() {
  const res = await fetch(`${API_BASE}/inventory/automation-logs`);
  if (!res.ok) throw new Error('Failed to fetch automation logs');
  return res.json();
}

export async function generateAiRestockReport() {
  const res = await fetch(`${API_BASE}/inventory/ai-restock-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to generate restock priority report');
  return res.json();
}

export async function fetchAiStatus() {
  const res = await fetch(`${API_BASE}/ai/status`);
  if (!res.ok) throw new Error('Failed to check AI status');
  return res.json();
}

export async function generateBudgetPlan(params) {
  const res = await fetch(`${API_BASE}/ai/budget-planner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to generate budget plan');
  return res.json();
}

export async function generateFamilyPlan(params) {
  const res = await fetch(`${API_BASE}/ai/family-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to generate family plan');
  return res.json();
}

export async function fetchAffordableAlternatives(params) {
  const res = await fetch(`${API_BASE}/ai/alternatives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to fetch alternatives');
  return res.json();
}

export async function generateRecipe(params) {
  const res = await fetch(`${API_BASE}/ai/recipe-generator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate recipe');
  }
  return data;
}

export async function fetchCartRecommendations(cartItems) {
  const res = await fetch(`${API_BASE}/ai/cart-recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItems })
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function sendChatMessage(params) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchSalesAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/sales`);
  if (!res.ok) throw new Error('Failed to fetch sales analytics');
  return res.json();
}

export async function generateAiSalesSummary() {
  const res = await fetch(`${API_BASE}/analytics/ai-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to generate AI sales summary');
  return res.json();
}
