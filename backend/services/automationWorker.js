const { storeEvents, db } = require('../data/db');
const { generateRestockPriorityReport, getAiClient } = require('./geminiService');

let isWorkerInitialized = false;

function initializeAutomationWorker() {
  if (isWorkerInitialized) return;
  isWorkerInitialized = true;

  console.log('🤖 [SmartBasket Automation Worker] Initialized event-driven retail pipelines.');

  // 1. Reactive Pipeline: Close the Event Loop on Low Stock
  storeEvents.on('stock:low', async (lowStockAlerts) => {
    try {
      console.log(`⚡ [AutomationWorker] Received "stock:low" event for ${lowStockAlerts.length} item(s). Running AI triage...`);

      const lowStockProducts = lowStockAlerts
        .map(alert => db.getProductById(alert.productId))
        .filter(Boolean);

      if (!lowStockProducts.length) return;

      // 1. Automatically run AI restock analysis in the background
      const report = await generateRestockPriorityReport({ lowStockProducts });

      if (report?.data?.restockItems?.length > 0) {
        // 2. Automatically save draft Purchase Order for Store Admin review
        const draftPO = db.saveDraftPurchaseOrder(report.data);

        // 3. Log event and alert
        db.addLog(
          'AI_PO_DRAFTED',
          `AUTONOMOUS SUPPLY CHAIN: Draft Purchase Order ${draftPO.id} generated for ${draftPO.items.length} items (Urgency: ${draftPO.urgencyLevel}, Total: ₹${draftPO.totalAmount}). Pending approval by Krishna Patel.`,
          'success',
          {
            poId: draftPO.id,
            totalAmount: draftPO.totalAmount,
            urgencyLevel: draftPO.urgencyLevel,
            itemCount: draftPO.items.length
          }
        );

        console.log(`✅ [AutomationWorker] Purchase Order ${draftPO.id} created automatically with ${draftPO.items.length} restock items.`);
      }
    } catch (err) {
      console.error('❌ [AutomationWorker] Failed autonomous restock pipeline:', err.message);
    }
  });

  // Ensure initial draft PO exists if initial database has low-stock products
  try {
    const existingLow = db.getLowStockProducts();
    const existingPOs = db.getPurchaseOrders();
    if (existingLow.length > 0 && existingPOs.length === 0) {
      generateRestockPriorityReport({ lowStockProducts: existingLow }).then(report => {
        if (report?.data?.restockItems?.length > 0) {
          db.saveDraftPurchaseOrder(report.data);
          db.addLog(
            'SYSTEM_INIT',
            `Autonomous Retail Engine initialized initial Purchase Order for ${existingLow.length} threshold items.`,
            'info'
          );
        }
      }).catch(e => console.warn('Initial PO seed warning:', e.message));
    }
  } catch (e) {
    console.warn('Initial check warning:', e.message);
  }
}

// 2. Autonomous Customer Retention: Smart Reorder Nudges Job
async function runReorderNudgesJob() {
  const orders = db.getOrders();
  const nudges = [];

  // Group orders by customer
  for (const order of orders) {
    const cust = order.customer;
    if (!cust || !cust.name) continue;

    const fastStaples = (order.items || []).filter(item => {
      const n = (item.name || '').toLowerCase();
      return n.includes('milk') || n.includes('paneer') || n.includes('atta') || n.includes('bread') || n.includes('dal');
    });

    if (fastStaples.length > 0) {
      nudges.push({
        customerName: cust.name,
        email: cust.email,
        recommendedItems: fastStaples.map(i => i.name),
        nudgeMessage: `Hi ${cust.name}, time to refill your daily essentials (${fastStaples.map(i => i.name).slice(0, 2).join(', ')})!`
      });
    }
  }

  db.addLog(
    'SCHEDULED_REORDER_JOB',
    `Autonomous Retention Job: Scanned customer order history and generated ${nudges.length} personalized 1-click refill nudges.`,
    'info',
    { nudgesGenerated: nudges.length }
  );

  return { success: true, nudgesCount: nudges.length, nudges };
}

// 3. Autonomous Dead-Stock Clearance Tagger Job
async function runDeadStockClearanceJob() {
  const analytics = db.getSalesAnalytics();
  const slowItems = analytics.slowMoving || [];

  if (slowItems.length === 0) {
    return { success: true, message: 'No critical slow-moving inventory detected.' };
  }

  const bundles = slowItems.map(p => ({
    targetProduct: p.name,
    stock: p.stock,
    salesCount: p.salesCount,
    proposedPairing: 'Basmati Rice + Pure Cow Ghee Combo',
    discountPercent: 15,
    clearanceStrategy: 'Pair with high-velocity weekend staples at 15% promotional bundle discount.'
  }));

  db.addLog(
    'SCHEDULED_CLEARANCE_JOB',
    `Autonomous Merchandising Job: Flagged ${slowItems.length} slow-moving products and generated promotional clearance bundles.`,
    'warning',
    { slowItemsCount: slowItems.length, proposedBundles: bundles.length }
  );

  return { success: true, slowItemsCount: slowItems.length, bundles };
}

module.exports = {
  initializeAutomationWorker,
  runReorderNudgesJob,
  runDeadStockClearanceJob
};
