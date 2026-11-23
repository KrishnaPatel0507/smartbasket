const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { requireAdmin } = require('../middleware/auth');
const { runReorderNudgesJob, runDeadStockClearanceJob } = require('../services/automationWorker');

// GET /api/purchase-orders - Fetch all automated purchase orders
router.get('/', (req, res) => {
  try {
    const purchaseOrders = db.getPurchaseOrders();
    res.json({
      success: true,
      count: purchaseOrders.length,
      purchaseOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/purchase-orders/:id/approve - Store Admin 1-click approval & autonomous restocking
router.post('/:id/approve', requireAdmin, (req, res) => {
  try {
    const adminName = req.body?.adminName || 'Krishna Patel';
    const approvedPO = db.approvePurchaseOrder(req.params.id, adminName);

    if (!approvedPO) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    res.json({
      success: true,
      message: `Purchase Order ${approvedPO.id} approved by ${adminName}! Inventory has been automatically replenished.`,
      purchaseOrder: approvedPO
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/purchase-orders/trigger-job - Trigger autonomous retention or clearance job
router.post('/trigger-job', requireAdmin, async (req, res) => {
  try {
    const { jobType } = req.body;
    if (jobType === 'reorder-nudges') {
      const result = await runReorderNudgesJob();
      return res.json(result);
    } else if (jobType === 'dead-stock-clearance') {
      const result = await runDeadStockClearanceJob();
      return res.json(result);
    }
    return res.status(400).json({ success: false, message: 'Unknown jobType. Use "reorder-nudges" or "dead-stock-clearance".' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
