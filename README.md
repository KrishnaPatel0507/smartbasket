# SmartBasket – AI-Powered Smart Grocery Store & Automation System

A production-grade, full-stack intelligent grocery application combining online grocery shopping in Indian Rupees (₹), Google Gemini AI shopping assistance, and automated business operations.

---

## 🌟 Key Features Overview

### 1. Customer Grocery Storefront
- **Modern Responsive Design**: Emerald green & pastel grocery theme with clean typography and fluid micro-interactions.
- **Product Catalog by Categories**: Fruits & Vegetables, Dairy & Eggs, Bakery & Bread, Staples & Grains, Snacks & Beverages, Household & Cleaning, Personal Care.
- **Real-Time Filtering & Search**: Instant search by keywords and tags, category pills, price range slider (up to ₹500), and "In Stock Only" toggle.
- **Detailed Product Insights**: High-resolution imagery, unit specifications (e.g. 1 kg, 500 ml, 6 pcs), prices in INR, discount badges, and customer ratings.
- **Quantity & Cart Management**: Instant cart addition, increment/decrement controls, subtotal tracking, and persistent local storage.
- **AI Product Alternatives**: Every product card features a Gemini-powered button that recommends cheaper or healthier alternative products from the catalog.

### 2. AI Shopping Assistant (Google Gemini AI)
- **Budget-Based Grocery Basket Builder**: Input any custom budget (e.g., ₹500, ₹1000, ₹1500, ₹2500) and household size; Gemini creates an optimal, nutritionally balanced basket with a 1-click *"Add All to Cart"* button.
- **Family Size Blueprint**: Calculates weekly and monthly staples, produce, and dairy schedules according to household size (Solo, Couple, Family of 4, Large Family).
- **Affordable Alternative Recommender**: Compares unit pricing and suggests cost-effective substitutions.
- **Conversational AI Chatbot ("BasketBuddy")**: Floating and inline AI assistant answering food storage queries, high-protein pantry picks, and store guidance.

### 3. AI Recipe Generator & Missing Ingredients Identifier
- **Pantry Input**: Select or type available kitchen ingredients (e.g., *Potatoes, Onions, Tomatoes, Paneer*).
- **Customized Recipe Creation**: Gemini generates prep time, cook time, difficulty, servings, and step-by-step cooking instructions.
- **Automated Missing Item Detection**: Identifies ingredients needed to complete the meal and maps them to real products in the store catalog with live prices and stock.
- **1-Click Cart Addition**: Add all missing ingredients to your shopping basket with a single tap.

### 4. Smart Business Automation Engine
- **Atomic Stock Deduction**: Automatically decreases product inventory upon order confirmation; prevents overselling and duplicate orders.
- **Automated Billing & Invoice Generation**: Computes subtotal, 5% GST, free delivery logic (free over ₹499 or ₹40), and creates unique invoice numbers (e.g., `SB-INV-2026-XXXX`).
- **Printable Grocery Invoices**: Professional modal with dedicated print stylesheet (`window.print()`) formatted for physical receipts or PDF export.
- **Low-Stock Detection & Alerts**: Automatically flags items dropping below their minimum safety stock level and logs warning events.
- **AI Restock Priority Analysis**: Gemini evaluates stock velocity and assigns High, Medium, or Low restock priorities with suggested order quantities and wholesale cost estimates.
- **Intelligent Cart Recommendations**: Evaluates cart contents and suggests 3-4 complementary items (e.g., tea leaves + milk/biscuits).
- **AI Sales & Business Intelligence**: Tracks revenue trends, best-selling drivers, and slow-moving items, and generates executive business summaries.
- **Live Automation Audit Trail**: Real-time log of system events (`STOCK_REDUCED`, `LOW_STOCK_ALERT`, `RESTOCK_AUTOMATION`, `INVOICE_GENERATED`).

### 5. Admin Dashboard
- **Executive KPIs**: Real-time Total Revenue (₹), Total Orders, Catalog Items, and Low-Stock Alert badge.
- **Sales Analytics**: Revenue distribution, top-selling items, and slow-moving inventory.
- **Catalog Management (CRUD)**: Create new products, edit price/stock/details, and delete items.
- **Inventory Control**: Fast restock buttons (+10, +25, +50) with instant database sync.
- **Order Management**: Order history, status updates (Confirmed, Processing, Delivered, Cancelled), and printable invoice viewing for any past order.

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons | Responsive UI, interactive grocery catalog, print styling |
| **Backend** | Node.js, Express.js, CORS, Dotenv | RESTful API, atomic business logic, billing & inventory automation |
| **Artificial Intelligence** | Google Gemini API (`@google/genai`) | Budget planning, recipe generation, alternatives & business intelligence |
| **Database** | Persistent JSON Store (`store.json`) | Zero-friction, zero-dependency persistent storage with atomic CRUD |
| **Animation & Effects** | Canvas Confetti | Celebratory checkout experience |

---

## 📁 Project Folder Structure

```
smartbasket/
├── backend/
│   ├── data/
│   │   ├── db.js                 # Persistent atomic database manager & automation triggers
│   │   ├── seedProducts.js       # 27+ rich Indian grocery products across 7 categories
│   │   └── store.json            # Persistent JSON database (auto-created on startup)
│   ├── routes/
│   │   ├── productRoutes.js      # Catalog CRUD & restock endpoints
│   │   ├── orderRoutes.js        # Checkout, atomic stock deduction & billing
│   │   ├── inventoryRoutes.js    # Low-stock monitoring & AI restock priorities
│   │   ├── aiRoutes.js           # Budget planner, recipes, alternatives & chatbot
│   │   └── analyticsRoutes.js    # Sales metrics & AI executive business summaries
│   ├── services/
│   │   └── geminiService.js      # Gemini API integration with intelligent fallback logic
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Local environment configuration
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server entry point (Port 5000)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation, status indicator & cart badge
│   │   │   ├── ProductCard.jsx       # Grocery card with stock status & discount pill
│   │   │   ├── ProductModal.jsx      # Product details & Gemini alternative recommender
│   │   │   ├── CartDrawer.jsx        # Basket drawer with automated bill & AI recommendations
│   │   │   ├── CheckoutModal.jsx     # Customer info & instant order confirmation
│   │   │   ├── PrintableInvoice.jsx  # Printable GST tax invoice modal
│   │   │   ├── AiBudgetPlanner.jsx   # Budget-based grocery basket builder & family plans
│   │   │   ├── AiRecipeGenerator.jsx # Ingredient input, recipe & missing item cart adder
│   │   │   ├── AdminDashboard.jsx    # KPIs, Sales analytics, inventory control & logs
│   │   │   └── FloatingChatbot.jsx   # Floating BasketBuddy AI assistant widget
│   │   ├── services/
│   │   │   └── api.js                # Frontend API client
│   │   ├── App.jsx                   # Main application controller
│   │   ├── index.css                 # Global Tailwind styles & print stylesheet
│   │   └── main.jsx                  # React entry point
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js                # Vite configuration with proxy to port 5000
│
├── start-app.bat                     # 1-Click Windows launcher (starts both servers & browser)
├── start-backend.bat                 # Starts backend server on port 5000
├── start-frontend.bat                # Starts frontend client on port 3000
├── package.json                      # Root workspace scripts
└── README.md                         # Documentation & demonstration manual
```

---

## ⚙️ Environment Configuration

1. In the `backend/` directory, open `.env` (or copy `.env.example` to `.env`):
   ```env
   PORT=5000
   NODE_ENV=development

   # Google Gemini API Key
   # Obtain a free key from Google AI Studio: https://aistudio.google.com/
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   GEMINI_MODEL=gemini-2.5-flash
   ```

> [!NOTE]
> **Zero-Friction AI Fallback**: If you do not have a Gemini API key yet, the application automatically runs in **Smart Intelligent Mode** using structured semantic reasoning algorithms. You can run and demonstrate every single feature immediately without external API blockers!

---

## 🚀 Running the Project Locally

### Option A: 1-Click Windows Launcher (Easiest)
Simply double-click:
```bat
start-app.bat
```
This automatically starts the backend server, launches the frontend development server, and opens `http://localhost:3000` in your default browser.

---

### Option B: Manual Command Line

#### 1. Start the Backend:
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5000`*

#### 2. Start the Frontend (in a separate terminal):
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🧪 Demonstration & Academic Evaluation Walkthrough

Follow these simple steps during an academic evaluation or live presentation to demonstrate all system capabilities:

### Step 1: Customer Grocery Shopping & Dynamic Filtering
1. Open `http://localhost:3000`.
2. Browse categories: *Fruits & Vegetables*, *Dairy & Eggs*, *Staples & Grains*.
3. Use the search bar to search for `"paneer"`, `"atta"`, or `"milk"`.
4. Notice the real-time stock badges: items with low stock display an amber pulse badge (*"Only X left!"*).
5. Click any product to open the **Product Modal** and observe the **Gemini AI Affordable Alternatives** section recommending cheaper substitutes with price comparisons.

### Step 2: AI Shopping Assistant & Budget Optimizer
1. Click **AI Assistant** in the top navigation.
2. Select or enter a budget (e.g., `₹1500`) and select household size (`Family of 4`).
3. Click **"Generate AI Grocery Basket"**.
4. Gemini calculates a balanced basket of staples, fresh produce, and lentils within your budget and provides a money-saving tip.
5. Click **"Add All AI-Recommended Items to Cart"** — watch your shopping basket instantly fill with the recommended items!

### Step 3: AI Recipe Generator & Missing Ingredients Automation
1. Click **AI Recipe Chef** in the top navigation.
2. Enter ingredients you have at home (e.g., `Potatoes, Onions, Tomatoes, Paneer`).
3. Click **"Generate Recipe & Identify Missing Items"**.
4. Gemini designs a recipe, prep/cook time, and cooking instructions.
5. Notice the **Missing Ingredients** card: Gemini automatically identifies missing seasonings/butter, matches them to store products, and provides an **"Add All Missing Ingredients to Cart"** button.

### Step 4: Automated Billing, Checkout & Printable GST Invoice
1. Click the shopping basket icon in the top right to open the **Cart Drawer**.
2. Notice the automated bill calculation: Items Subtotal, 5% GST, Free Express Delivery logic, and enter coupon code `SMART10` for an instant 10% discount.
3. Observe the **Gemini Cart Recommendations** widget suggesting complementary items.
4. Click **"Proceed to Checkout"**, enter customer details, and confirm the order.
5. Celebratory confetti triggers, and an itemized **Printable GST Invoice** appears with a unique invoice number (e.g. `SB-INV-2026-1004`). Click **"Print / Save PDF"** to test physical receipt generation!

### Step 5: Real-Time Business Automation in the Admin Dashboard
1. Click **Admin Dashboard** in the top navigation.
2. **Sales Analytics Tab**: Review total sales in ₹ INR, average order value, best-selling products, and click **"Generate Executive Report"** for Gemini business intelligence.
3. **Inventory Automation Tab**: Notice the **Low-Stock Alert** triggered by your recent order. Click **"Run AI Restock Priorities"** to let Gemini assign High/Medium/Low reorder priorities and calculate the wholesale replenishment investment.
4. Test restocking by clicking `+10` or `+25` on any low-stock product and observe the stock increase instantly.
5. **Automation Audit Logs Tab**: View the live timestamped audit trail showing `STOCK_REDUCED`, `INVOICE_GENERATED`, and `LOW_STOCK_ALERT` events fired automatically.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/products` | GET | List catalog products with search, category & price filters |
| `/api/products/:id` | GET | Retrieve product details |
| `/api/products` | POST | Add new product to catalog |
| `/api/products/:id` | PUT | Update product details / pricing / stock |
| `/api/products/:id` | DELETE | Delete product from catalog |
| `/api/products/:id/restock`| POST | Restock product quantity |
| `/api/orders` | POST | Place order, atomically deduct stock, and generate invoice |
| `/api/orders` | GET | Retrieve all order history |
| `/api/orders/:id/status`| PATCH | Update order fulfillment status |
| `/api/inventory/low-stock` | GET | Retrieve list of products below minimum safety threshold |
| `/api/inventory/automation-logs` | GET | Retrieve automated event audit logs |
| `/api/inventory/ai-restock-report` | POST | Trigger Gemini AI restock priority report |
| `/api/ai/budget-planner`| POST | Generate budget-constrained grocery list |
| `/api/ai/recipe-generator` | POST | Generate recipe and match missing catalog ingredients |
| `/api/ai/alternatives` | POST | Suggest affordable product alternatives |
| `/api/ai/cart-recommendations`| POST | Recommend complementary cart pairings |
| `/api/ai/chat` | POST | Chatbot assistant for grocery queries |
| `/api/analytics/sales` | GET | Aggregated sales metrics, top sellers & slow movers |
| `/api/analytics/ai-summary` | POST | Generate AI executive business summary |
