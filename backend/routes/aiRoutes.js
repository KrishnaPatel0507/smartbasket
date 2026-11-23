const express = require('express');
const router = express.Router();
const db = require('../data/db');
const {
  getAiClient,
  generateGroceryListByBudget,
  generateFamilyPlan,
  getAffordableAlternatives,
  generateRecipeAndMissingIngredients,
  getCartRecommendations,
  chatWithAssistant
} = require('../services/geminiService');

// Check AI status
router.get('/status', (req, res) => {
  const client = getAiClient();
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(client && apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE');
  res.json({
    success: true,
    isConfigured,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    mode: isConfigured ? 'live-gemini-api' : 'intelligent-mock-engine',
    message: isConfigured
      ? 'Connected to Google Gemini Live API'
      : 'Using SmartBasket Intelligent Engine (set GEMINI_API_KEY in backend/.env to enable live Gemini API)'
  });
});

// 1. Budget-based Grocery List
router.post('/budget-planner', async (req, res) => {
  try {
    const { budget, familySize = 'Family of 4', diet = 'Vegetarian', period = 'Weekly' } = req.body;
    const catalog = db.getProducts();
    const result = await generateGroceryListByBudget({
      budget: Number(budget) || 1500,
      familySize,
      diet,
      period,
      catalog
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Family Size Weekly/Monthly Planner
router.post('/family-plan', async (req, res) => {
  try {
    const { familySize = '3-4 Members', period = 'Weekly', diet = 'Vegetarian' } = req.body;
    const catalog = db.getProducts();
    const result = await generateFamilyPlan({ familySize, period, diet, catalog });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Affordable Product Alternatives
router.post('/alternatives', async (req, res) => {
  try {
    const { productId, productName } = req.body;
    const catalog = db.getProducts();
    const result = await getAffordableAlternatives({ productId, productName, catalog });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. AI Recipe Generator & Missing Ingredients Identifier
router.post('/recipe-generator', async (req, res) => {
  try {
    const { ingredients, mealType, cuisine, dietary } = req.body;
    if (!ingredients || !ingredients.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter at least one available ingredient' });
    }
    const catalog = db.getProducts();
    const result = await generateRecipeAndMissingIngredients({
      ingredients,
      mealType,
      cuisine,
      dietary,
      catalog
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Intelligent Cart Recommendations
router.post('/cart-recommendations', async (req, res) => {
  try {
    const { cartItems } = req.body;
    const catalog = db.getProducts();
    const result = await getCartRecommendations({ cartItems, catalog });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Conversational AI Assistant Chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history, cart } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const catalog = db.getProducts();
    const result = await chatWithAssistant({ message, history, catalog, cart });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
