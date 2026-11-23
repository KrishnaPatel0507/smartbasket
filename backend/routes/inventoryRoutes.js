const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { generateRestockPriorityReport } = require('../services/geminiService');

// GET low-stock products
router.get('/low-stock', (req, res) => {
  try {
    const lowStock = db.getLowStockProducts();
    res.json({
      success: true,
      count: lowStock.length,
      lowStockProducts: lowStock
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET automated inventory logs
router.get('/automation-logs', (req, res) => {
  try {
    const logs = db.getAutomationLogs();
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST trigger AI Restock Priority Report
router.post('/ai-restock-report', async (req, res) => {
  try {
    const lowStock = db.getLowStockProducts();
    const analytics = db.getSalesAnalytics();
    const report = await generateRestockPriorityReport({
      lowStockProducts: lowStock,
      salesAnalytics: analytics
    });

    if (report?.data?.restockItems?.length > 0) {
      db.saveDraftPurchaseOrder(report.data);
    }

    db.addLog(
      'AI_RESTOCK_ANALYSIS',
      `Gemini AI evaluated ${lowStock.length} low-stock items and generated Restock Priority recommendations. Draft PO created for Admin approval.`,
      'info',
      { urgency: report.data.urgencyLevel, totalEstCost: report.data.estimatedTotalInvestment }
    );

    res.json({
      success: true,
      source: report.source,
      report: report.data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
