const express = require('express');
const router = express.Router();
const db = require('../data/db');

// GET all orders
router.get('/', (req, res) => {
  try {
    const orders = db.getOrders();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single order / invoice
router.get('/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order / Invoice not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST place order (triggers automated stock deduction and billing calculation)
router.post('/', (req, res) => {
  try {
    const { customer, items, discount } = req.body;
    if (!customer || !customer.name || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name and delivery address are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    const result = db.createOrder({ customer, items, discount });

    res.status(201).json({
      success: true,
      message: 'Order confirmed! Stock updated and invoice generated automatically.',
      order: result.order,
      lowStockAlerts: result.lowStockAlerts
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH update status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const order = db.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
