const { GoogleGenAI } = require('@google/genai');

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

function cleanJsonResponse(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Strip markdown code block fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Failed to parse direct JSON from Gemini, attempting regex match:', err.message);
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Regex JSON extract also failed:', e.message);
      }
    }
    return null;
  }
}

// 1. Budget-based Grocery List Generator
async function generateGroceryListByBudget({ budget, familySize, diet = 'Vegetarian', period = 'Weekly', catalog = [] }) {
  const client = getAiClient();
  const catalogSummary = catalog.map(p => `${p.name} (ID: ${p.id}, Cat: ${p.category}, Price: ₹${p.price}/${p.unit}, Stock: ${p.stock})`).join('\n');

  const prompt = `You are an expert AI Grocery & Budget Planner for SmartBasket (India).
A customer wants an optimal grocery list for:
- Budget: ₹${budget} INR
- Household/Family Size: ${familySize}
- Dietary Preference: ${diet}
- Duration/Period: ${period}

Here is our live store catalog available right now:
${catalogSummary}

Task:
Select the best combination of items from the store catalog to satisfy their nutritional needs, staples, and fresh foods while keeping the total price within or very close to ₹${budget}.
Prioritize essential items first.

You MUST respond strictly with valid JSON conforming to this schema (no extra text):
{
  "title": "Smart Budget Grocery Basket (₹${budget})",
  "explanation": "Brief explanation of how this list balances nutrition and budget for ${familySize}",
  "totalEstimatedCost": number,
  "budgetRemaining": number,
  "savingsTip": "A practical money-saving tip for grocery shopping",
  "items": [
    {
      "productId": "string (matching catalog ID if found, else custom)",
      "name": "string",
      "category": "string",
      "price": number,
      "quantity": number,
      "unit": "string",
      "lineTotal": number,
      "reason": "short reason why this is essential"
    }
  ]
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      const parsed = cleanJsonResponse(response.text);
      if (parsed && Array.isArray(parsed.items)) {
        return { source: 'gemini', data: parsed };
      }
    } catch (err) {
      console.warn('Gemini API call failed for budget list, using intelligent fallback:', err.message);
    }
  }

  // Intelligent Fallback Planner based on catalog
  const budgetNum = Number(budget) || 1500;
  const selected = [];
  let currentCost = 0;

  // Prioritize essential staples and produce
  const priorityKeywords = ['atta', 'dal', 'rice', 'milk', 'potato', 'onion', 'tomato', 'oil', 'salt'];
  for (const kw of priorityKeywords) {
    const item = catalog.find(p => p.name.toLowerCase().includes(kw) && p.stock > 0 && !selected.some(s => s.productId === p.id));
    if (item && currentCost + item.price <= budgetNum) {
      selected.push({
        productId: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
        unit: item.unit,
        lineTotal: item.price,
        reason: 'Essential staple for balanced daily cooking'
      });
      currentCost += item.price;
    }
  }

  // Fill remaining budget with other available items
  for (const item of catalog) {
    if (currentCost + item.price <= budgetNum && !selected.some(s => s.productId === item.id) && item.stock > 0) {
      selected.push({
        productId: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
        unit: item.unit,
        lineTotal: item.price,
        reason: 'Nutritional balance and convenience'
      });
      currentCost += item.price;
    }
  }

  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    data: {
      title: `Smart Budget Plan for ₹${budgetNum} (${familySize})`,
      explanation: `Carefully balanced basket prioritizing grains, lentils, fresh produce and dairy designed for ${familySize}.`,
      totalEstimatedCost: currentCost,
      budgetRemaining: Math.max(0, budgetNum - currentCost),
      savingsTip: 'Buying whole wheat flour and pulses in 5kg/1kg packs saves up to 18% compared to smaller packaging.',
      items: selected
    }
  };
}

// 2. Family Size Weekly/Monthly Planner
async function generateFamilyPlan({ familySize, period = 'Weekly', diet = 'Vegetarian', catalog = [] }) {
  const client = getAiClient();
  const catalogSummary = catalog.map(p => `${p.name} (ID: ${p.id}, Price: ₹${p.price}/${p.unit})`).join('\n');

  const prompt = `You are a nutrition and grocery logistics expert for SmartBasket (India).
Create a comprehensive ${period} grocery plan for a family of ${familySize} with dietary preference "${diet}".
Here are our store catalog items:
${catalogSummary}

Respond strictly in valid JSON:
{
  "planTitle": "${period} Grocery Blueprint for ${familySize}",
  "estimatedBudget": number,
  "weeklyRoutineTip": "Practical advice on meal prep or food freshness preservation",
  "categories": [
    {
      "name": "Staples & Grains",
      "items": [
        { "name": "string", "quantity": "string", "productId": "catalog ID if match", "price": number }
      ]
    },
    {
      "name": "Fresh Fruits & Veggies",
      "items": [
        { "name": "string", "quantity": "string", "productId": "catalog ID if match", "price": number }
      ]
    },
    {
      "name": "Dairy & Protein",
      "items": [
        { "name": "string", "quantity": "string", "productId": "catalog ID if match", "price": number }
      ]
    }
  ]
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      const parsed = cleanJsonResponse(response.text);
      if (parsed) return { source: 'gemini', data: parsed };
    } catch (err) {
      console.warn('Gemini family plan error:', err.message);
    }
  }

  // Fallback family plan
  const staples = catalog.filter(p => p.category === 'Staples & Grains').slice(0, 4);
  const produce = catalog.filter(p => p.category === 'Fruits & Vegetables').slice(0, 4);
  const dairy = catalog.filter(p => p.category === 'Dairy & Eggs').slice(0, 3);

  const calculateCat = (arr, mult = 1) => arr.map(p => ({
    name: p.name,
    quantity: `${mult} x ${p.unit}`,
    productId: p.id,
    price: p.price * mult
  }));

  const mult = period.toLowerCase().includes('month') ? 3 : 1;
  const cat1 = calculateCat(staples, mult);
  const cat2 = calculateCat(produce, 1);
  const cat3 = calculateCat(dairy, mult);
  const total = [...cat1, ...cat2, ...cat3].reduce((acc, i) => acc + i.price, 0);

  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    data: {
      planTitle: `${period} Smart Basket Blueprint for ${familySize}`,
      estimatedBudget: total,
      weeklyRoutineTip: 'Store leafy greens wrapped in dry paper towels and keep potatoes in a cool, ventilated pantry away from onions.',
      categories: [
        { name: 'Staples & Grains', items: cat1 },
        { name: 'Fresh Fruits & Veggies', items: cat2 },
        { name: 'Dairy & Protein', items: cat3 }
      ]
    }
  };
}

// 3. Affordable Alternative Recommender
async function getAffordableAlternatives({ productId, productName, catalog = [] }) {
  const targetProduct = catalog.find(p => p.id === productId || p.name.toLowerCase() === (productName || '').toLowerCase());
  const client = getAiClient();

  const prompt = `You are a SmartBasket price optimization AI.
Customer is viewing:
Product: "${targetProduct ? targetProduct.name : productName}"
Current Price: ₹${targetProduct ? targetProduct.price : 'N/A'} (${targetProduct ? targetProduct.unit : ''})
Category: ${targetProduct ? targetProduct.category : 'Groceries'}

Store catalog options:
${catalog.map(p => `${p.name} (ID: ${p.id}, Cat: ${p.category}, ₹${p.price}/${p.unit})`).join('\n')}

Task:
Recommend 2 to 3 affordable or healthier alternatives.
Respond strictly in valid JSON:
{
  "productName": "${targetProduct ? targetProduct.name : productName}",
  "currentPrice": ${targetProduct ? targetProduct.price : 0},
  "summaryTip": "Brief money-saving or nutritional insight",
  "alternatives": [
    {
      "productId": "catalog ID if matched",
      "name": "string",
      "price": number,
      "savingsAmount": number,
      "reason": "Why this alternative is great value or healthier"
    }
  ]
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      const parsed = cleanJsonResponse(response.text);
      if (parsed) return { source: 'gemini', data: parsed };
    } catch (err) {
      console.warn('Gemini alternative recommender error:', err.message);
    }
  }

  // Fallback alternatives
  const currentPrice = targetProduct ? targetProduct.price : 150;
  const sameCatLower = catalog
    .filter(p => targetProduct ? (p.category === targetProduct.category && p.id !== targetProduct.id) : true)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)
    .map(p => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      savingsAmount: Math.max(0, currentPrice - p.price),
      reason: p.price < currentPrice ? `Save ₹${currentPrice - p.price} while maintaining wholesome quality` : `High rated premium alternative with ${p.unit}`
    }));

  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    data: {
      productName: targetProduct ? targetProduct.name : (productName || 'Selected Item'),
      currentPrice: currentPrice,
      summaryTip: 'Opting for store-verified farm staples or larger volume packages often reduces unit cost by 15-25%.',
      alternatives: sameCatLower
    }
  };
}

// 4. AI Recipe Generator & Missing Ingredients Identifier
async function generateRecipeAndMissingIngredients({ ingredients, mealType = 'Any', cuisine = 'Indian', dietary = 'Vegetarian', catalog = [] }) {
  const client = getAiClient();
  const catalogSummary = catalog.map(p => `${p.name} (ID: ${p.id}, Price: ₹${p.price}/${p.unit}, Stock: ${p.stock})`).join('\n');

  const prompt = `You are the SmartBasket Master Chef & Grocery Matcher AI.
A user has these available ingredients at home:
"${ingredients}"

Preferences:
- Meal Type: ${mealType}
- Cuisine Style: ${cuisine}
- Dietary: ${dietary}

Store Catalog to match missing ingredients from:
${catalogSummary}

Task:
1. Generate an appetizing recipe that creatively uses their available ingredients.
2. Provide prep time, cook time, difficulty, and step-by-step cooking instructions.
3. Automatically IDENTIFY MISSING INGREDIENTS needed to complete this recipe.
4. For each missing ingredient, map it to the closest item from our store catalog so the customer can add it to their SmartBasket cart in one click!

Respond strictly in valid JSON:
{
  "recipeTitle": "string",
  "description": "string",
  "prepTime": "string (e.g. 15 mins)",
  "cookTime": "string (e.g. 20 mins)",
  "servings": "number or string (e.g. 2-3)",
  "difficulty": "Easy | Medium | Advanced",
  "availableIngredientsUsed": ["string"],
  "instructions": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "missingIngredients": [
    {
      "name": "string",
      "requiredQuantity": "string",
      "matchedProductId": "matching ID from store catalog or null",
      "matchedProductName": "matching name from store catalog or null",
      "matchedProductPrice": number,
      "matchedProductUnit": "string",
      "reason": "Why this ingredient is required for the dish"
    }
  ],
  "chefTip": "string"
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      const parsed = cleanJsonResponse(response.text);
      if (parsed) return { source: 'gemini', data: parsed };
    } catch (err) {
      console.warn('Gemini recipe generator error:', err.message);
    }
  }

  // Intelligent fallback recipe generator
  const ingLower = (ingredients || '').toLowerCase();
  let recipeTitle = 'Homestyle Aloo Palak & Crisp Butter Roti';
  let used = ['Potato', 'Spinach', 'Spices'];
  let missing = [];

  if (ingLower.includes('egg') || ingLower.includes('bread')) {
    recipeTitle = 'Classic Masala Egg Toast & Sautéed Bell Peppers';
    used = ['Eggs', 'Bread', 'Green Chilies'];
  } else if (ingLower.includes('paneer') || ingLower.includes('tomato')) {
    recipeTitle = 'Restaurant-Style Paneer Makhani';
    used = ['Paneer', 'Tomatoes', 'Butter'];
  } else if (ingLower.includes('rice') || ingLower.includes('dal')) {
    recipeTitle = 'Comforting Royal Tadka Khichdi with Ghee';
    used = ['Basmati Rice', 'Toor Dal', 'Salt'];
  }

  // Find actual items in catalog for missing items
  const butter = catalog.find(p => p.name.includes('Butter')) || catalog[1];
  const spices = catalog.find(p => p.name.includes('Coriander') || p.name.includes('Salt')) || catalog[2];
  const veggies = catalog.find(p => p.name.includes('Capsicum') || p.name.includes('Tomatoes')) || catalog[0];

  missing = [
    {
      name: butter.name,
      requiredQuantity: '50 g',
      matchedProductId: butter.id,
      matchedProductName: butter.name,
      matchedProductPrice: butter.price,
      matchedProductUnit: butter.unit,
      reason: 'Adds rich flavor and authentic aroma to the gravy'
    },
    {
      name: spices.name,
      requiredQuantity: '1 tbsp',
      matchedProductId: spices.id,
      matchedProductName: spices.name,
      matchedProductPrice: spices.price,
      matchedProductUnit: spices.unit,
      reason: 'Essential seasoning to elevate taste and aroma'
    },
    {
      name: veggies.name,
      requiredQuantity: '200 g',
      matchedProductId: veggies.id,
      matchedProductName: veggies.name,
      matchedProductPrice: veggies.price,
      matchedProductUnit: veggies.unit,
      reason: 'Provides texture, freshness and balance'
    }
  ];

  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    data: {
      recipeTitle,
      description: 'A comforting, flavor-packed dish crafted using your available pantry items paired with fresh store accents.',
      prepTime: '15 mins',
      cookTime: '20 mins',
      servings: '2-3 people',
      difficulty: 'Easy',
      availableIngredientsUsed: used,
      instructions: [
        'Wash and finely chop your available fresh ingredients.',
        'Heat 1 tbsp oil/butter in a pan, add tempered whole spices and sauté until aromatic.',
        'Incorporate the chopped vegetables and simmer on medium heat until tender.',
        'Add the missing seasoned accents and simmer for 5-7 minutes until the gravy thickens.',
        'Garnish with fresh coriander and serve hot with fresh rotis or steaming basmati rice.'
      ],
      missingIngredients: missing,
      chefTip: 'Roasting spices gently on low flame before adding liquid releases maximum essential oils and deep restaurant-quality aroma!'
    }
  };
}

// 5. Intelligent Cart Recommendations
async function getCartRecommendations({ cartItems = [], catalog = [] }) {
  const client = getAiClient();
  const cartNames = cartItems.map(i => `${i.name} (Qty: ${i.quantity})`).join(', ');

  const prompt = `You are the SmartBasket Cart Intelligence AI.
A customer has these products currently in their shopping cart:
${cartNames || 'No items yet'}

Here is the store catalog:
${catalog.map(p => `${p.name} (ID: ${p.id}, Cat: ${p.category}, ₹${p.price}/${p.unit})`).join('\n')}

Task:
Recommend 3 to 4 complementary or essential products that pair well with their cart or suggest a budget-friendly pairing.
Respond strictly in valid JSON:
{
  "recommendationHeadline": "Recommended for your basket",
  "recommendations": [
    {
      "productId": "catalog ID",
      "name": "string",
      "price": number,
      "category": "string",
      "reason": "Why this pairs perfectly with their current items"
    }
  ]
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      const parsed = cleanJsonResponse(response.text);
      if (parsed && Array.isArray(parsed.recommendations)) {
        return { source: 'gemini', data: parsed };
      }
    } catch (err) {
      console.warn('Gemini cart recommendations error:', err.message);
    }
  }

  // Fallback smart recommendations
  const cartIds = cartItems.map(i => i.productId);
  const unselected = catalog.filter(p => !cartIds.includes(p.id) && p.stock > 0);
  const recs = unselected.slice(0, 3).map(p => ({
    productId: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    reason: `Popular staple frequently purchased together with everyday groceries`
  }));

  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    data: {
      recommendationHeadline: 'Customers with similar baskets also bought',
      recommendations: recs
    }
  };
}

// 6. Conversational AI Assistant
async function chatWithAssistant({ message, history = [], catalog = [], cart = [] }) {
  const client = getAiClient();
  const catalogSummary = catalog.map(p => `${p.name} (₹${p.price}/${p.unit}, Cat: ${p.category})`).join(', ');

  const prompt = `You are "BasketBuddy", the friendly, knowledgeable AI shopping assistant for SmartBasket, an Indian online grocery store.
Customer query: "${message}"

Current store context:
- Available catalog items: ${catalogSummary}
- Items in user's cart: ${cart.map(c => c.name).join(', ') || 'Cart is empty'}

Guidelines:
1. Speak warmly, courteously, and helpfully.
2. When answering grocery questions, recommend actual products available in our store where relevant.
3. Help customers create shopping lists, save money, find recipes, or provide tips on food storage and cooking.
4. Keep answers concise, clear, and actionable with bullet points when listing items.
5. Pricing is in Indian Rupees (₹).

Provide a helpful response. If specific store items are recommended, mention their names and prices clearly.`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      return {
        source: 'gemini',
        reply: response.text
      };
    } catch (err) {
      console.warn('Gemini chat error:', err.message);
    }
  }

  // Fallback conversational assistant
  const q = (message || '').toLowerCase();
  let reply = "Hello! I am BasketBuddy, your SmartBasket AI Assistant. How can I help with your grocery shopping, budget planning, or recipes today?";

  if (q.includes('budget') || q.includes('cheap') || q.includes('save')) {
    reply = "To shop smart on a budget, consider our staples pack! For example, Aashirvaad Chakki Atta (5kg for ₹245) and Tata Sampann Toor Dal (1kg for ₹175) offer great value. You can also use our **AI Budget Planner** in the top navigation to build a complete basket under your specific budget limit!";
  } else if (q.includes('recipe') || q.includes('cook') || q.includes('dinner')) {
    reply = "I'd love to help you cook! Try out our **AI Recipe Generator** in the menu above: simply type what you have at home (like onions, potatoes, eggs, or paneer), and I will generate a step-by-step recipe and automatically identify any missing ingredients with 1-click cart addition.";
  } else if (q.includes('delivery') || q.includes('shipping') || q.includes('charge')) {
    reply = "SmartBasket offers **FREE delivery** on all orders above ₹499! For orders below ₹499, a nominal delivery fee of ₹40 applies. Orders are packed fresh and dispatched rapidly.";
  } else if (q.includes('store') || q.includes('keep') || q.includes('fresh')) {
    reply = "Pro tip for grocery longevity: Keep potatoes and onions in separate dry, dark ventilated baskets (onions release ethylene that makes potatoes sprout!). For herbs like coriander and palak, trim the stems and store them upright in a jar with an inch of water or wrap loosely in dry paper towels.";
  } else {
    reply = `I can help you with grocery recommendations, budget-friendly meal planning, recipe ideas, and store questions! Currently we have fresh produce, dairy, bakery, and daily staples in stock. What would you like to prepare or shop for today?`;
  }

  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    reply
  };
}

// 7. AI Restocking Priority Analysis (Admin Inventory Automation)
async function generateRestockPriorityReport({ lowStockProducts = [], salesAnalytics = {} }) {
  const client = getAiClient();
  const summary = lowStockProducts.map(p => `- ${p.name} (Current Stock: ${p.stock}, Safety Threshold: ${p.minStockLevel}, Price: ₹${p.price}, Sales: ${p.salesCount || 0})`).join('\n');

  const prompt = `You are the Chief Inventory Automation AI for SmartBasket.
Analyze the following products currently operating at or below minimum safety stock levels:
${summary || 'No critical low-stock items detected'}

Task:
Evaluate sales velocity, essential nature of daily staples, and restock urgency.
Categorize each into High, Medium, or Low Restock Priority, recommend the exact reorder quantity, and calculate the estimated replenishment investment.

Respond strictly in valid JSON:
{
  "executiveSummary": "Concise 2-sentence inventory health status and replenishment strategy",
  "urgencyLevel": "CRITICAL | MODERATE | NORMAL",
  "estimatedTotalInvestment": number,
  "restockItems": [
    {
      "productId": "string",
      "name": "string",
      "currentStock": number,
      "minStockLevel": number,
      "recommendedReorderQty": number,
      "priority": "HIGH | MEDIUM | LOW",
      "costPerUnit": number,
      "totalReorderCost": number,
      "justification": "Why this priority was assigned based on daily demand and stock depletion"
    }
  ]
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      const parsed = cleanJsonResponse(response.text);
      if (parsed) return { source: 'gemini', data: parsed };
    } catch (err) {
      console.warn('Gemini restock report error:', err.message);
    }
  }

  // Fallback Restock Priority Engine
  let totalInvestment = 0;
  const items = lowStockProducts.map(p => {
    const isHighDemand = (p.salesCount || 0) > 150 || ['paneer', 'milk', 'onion', 'bread'].some(k => p.name.toLowerCase().includes(k));
    const priority = p.stock <= 4 ? 'HIGH' : (isHighDemand ? 'HIGH' : 'MEDIUM');
    const recommendedQty = Math.max(20, (p.minStockLevel * 2) - p.stock);
    const cost = Math.round(p.price * 0.75 * recommendedQty); // wholesale cost estimate
    totalInvestment += cost;

    return {
      productId: p.id,
      name: p.name,
      currentStock: p.stock,
      minStockLevel: p.minStockLevel,
      recommendedReorderQty: recommendedQty,
      priority,
      costPerUnit: Math.round(p.price * 0.75),
      totalReorderCost: cost,
      justification: priority === 'HIGH'
        ? `Critically low stock (${p.stock} units) with high customer velocity. Depletion risk within 24 hours.`
        : `Stock below buffer threshold (${p.stock}/${p.minStockLevel}). Replenish to prevent checkout drop-offs.`
    };
  });

  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    data: {
      executiveSummary: `SmartBasket Automated Inventory Monitor flagged ${lowStockProducts.length} items requiring restocking. Immediate action recommended for high velocity staples.`,
      urgencyLevel: lowStockProducts.some(p => p.stock <= 5) ? 'CRITICAL' : 'MODERATE',
      estimatedTotalInvestment: totalInvestment,
      restockItems: items
    }
  };
}

// 8. AI Sales & Business Intelligence Summary (Admin Dashboard)
async function generateSalesBusinessSummary({ salesAnalytics = {} }) {
  const client = getAiClient();
  const prompt = `You are the AI Business Strategy Consultant for SmartBasket Grocery.
Analyze this sales and operational performance dataset:
- Total Revenue: ₹${salesAnalytics.summary?.totalRevenue || 0}
- Total Orders: ${salesAnalytics.summary?.totalOrders || 0}
- Average Order Value: ₹${salesAnalytics.summary?.averageOrderValue || 0}
- Low Stock Items Count: ${salesAnalytics.summary?.lowStockCount || 0}
- Top Best-Selling Products: ${(salesAnalytics.bestSelling || []).map(p => `${p.name} (Sold: ${p.salesCount}, Rev: ₹${p.revenue})`).join(', ')}
- Slow-Moving Products: ${(salesAnalytics.slowMoving || []).map(p => `${p.name} (Stock: ${p.stock}, Sold: ${p.salesCount})`).join(', ')}

Task:
Produce an intelligent executive business summary with clear actionable insights:
1. Overall revenue & growth health.
2. Top performing product categories and drivers.
3. Slow-moving stock liquidation strategies (e.g. bundling, flash discounts).
4. Restocking and inventory risk mitigation.

Respond strictly in valid JSON:
{
  "headline": "string",
  "healthScore": "number (1-100)",
  "executiveSummary": "string",
  "keyStrengths": ["string", "string"],
  "criticalRisks": ["string", "string"],
  "strategicRecommendations": [
    {
      "area": "Pricing | Inventory | Marketing | Bundling",
      "action": "string",
      "expectedImpact": "string"
    }
  ]
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt
      });
      const parsed = cleanJsonResponse(response.text);
      if (parsed) return { source: 'gemini', data: parsed };
    } catch (err) {
      console.warn('Gemini sales summary error:', err.message);
    }
  }

  // Fallback Business Intelligence Summary
  return {
    source: client ? 'fallback-error' : 'mock-intelligent',
    data: {
      headline: 'Strong Daily Staple Velocity with Urgent Inventory Replenishment Need',
      healthScore: 88,
      executiveSummary: `SmartBasket generated ₹${salesAnalytics.summary?.totalRevenue || 2047} across ${salesAnalytics.summary?.totalOrders || 3} recorded orders with an average basket size of ₹${salesAnalytics.summary?.averageOrderValue || 682}. Dairy, whole grains, and fresh produce represent the core sales drivers.`,
      keyStrengths: [
        'High conversion and repeat purchase velocity in daily essentials (Atta, Milk, Dal, Onions).',
        'Strong average order value exceeding ₹600, indicating healthy multi-item basket sizes.'
      ],
      criticalRisks: [
        `${salesAnalytics.summary?.lowStockCount || 5} high-demand grocery products are below minimum safety stock levels, risking stockouts.`,
        'Specialty items (e.g., Greek yogurt, coriander powder) show slower turnover and require bundling.'
      ],
      strategicRecommendations: [
        {
          area: 'Inventory',
          action: 'Trigger automatic PO reorders for fresh paneer, onions, and milk before evening peak demand.',
          expectedImpact: 'Prevents estimated ₹3,200 in lost daily checkout revenue.'
        },
        {
          area: 'Bundling',
          action: 'Create "Weekend Breakfast Combos" pairing slow-moving items with popular eggs and bread.',
          expectedImpact: 'Accelerates slow-moving inventory turnover by 35%.'
        },
        {
          area: 'Marketing',
          action: 'Promote SmartBasket AI Budget Planner on the homepage to capture price-sensitive family shoppers.',
          expectedImpact: 'Boosts average cart size by 20%.'
        }
      ]
    }
  };
}

module.exports = {
  getAiClient,
  generateGroceryListByBudget,
  generateFamilyPlan,
  getAffordableAlternatives,
  generateRecipeAndMissingIngredients,
  getCartRecommendations,
  chatWithAssistant,
  generateRestockPriorityReport,
  generateSalesBusinessSummary
};
