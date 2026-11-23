const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { generateSalesBusinessSummary } = require('../services/geminiService');

// GET sales analytics
router.get('/sales', (req, res) => {
  try {
    const analytics = db.getSalesAnalytics();
    res.json({ success: true, ...analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST generate AI Executive Business Summary
router.post('/ai-summary', async (req, res) => {
  try {
    const analytics = db.getSalesAnalytics();
    const result = await generateSalesBusinessSummary({ salesAnalytics: analytics });

    db.addLog(
      'AI_BUSINESS_INSIGHTS',
      `Gemini AI generated comprehensive Executive Sales Summary and strategic recommendations.`,
      'info',
      { headline: result.data.headline, healthScore: result.data.healthScore }
    );

    res.json({ success: true, source: result.source, summary: result.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
