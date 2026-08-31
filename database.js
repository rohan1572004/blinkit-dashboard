// =========================================================
//  BLINKIT ANALYTICS — SQLITE DATABASE & AUTHENTICATION
// =========================================================
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'blinkit.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for speed & safety
db.exec(`PRAGMA journal_mode = WAL;`);

function initDatabase() {
  console.log('📦 Initializing SQLite database at:', dbPath);

  // 1. USERS TABLE FOR AUTHENTICATION
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL
    );
  `);

  // 2. HERO METRICS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS hero_metrics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      growth_pct REAL NOT NULL,
      current_year TEXT NOT NULL,
      previous_year TEXT NOT NULL
    );
  `);

  // 3. MARKETING METRICS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS marketing_metrics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      impressions TEXT NOT NULL,
      clicks TEXT NOT NULL,
      conversions TEXT NOT NULL,
      revenue TEXT NOT NULL
    );
  `);

  // 4. CUSTOMER METRICS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS customer_metrics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      new_customers INTEGER NOT NULL,
      lost_customers INTEGER NOT NULL,
      total_target INTEGER NOT NULL
    );
  `);

  // 5. INVENTORY METRICS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_metrics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      available_stock_pct REAL NOT NULL,
      damage_stock_pct REAL NOT NULL
    );
  `);

  // 6. INVENTORY TREND TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_trend (
      month TEXT PRIMARY KEY,
      month_order INTEGER NOT NULL,
      stock_available REAL NOT NULL,
      stock_sold REAL NOT NULL
    );
  `);

  // 7. SALES OVERVIEW TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales_overview (
      month TEXT PRIMARY KEY,
      month_order INTEGER NOT NULL,
      current_year REAL NOT NULL,
      previous_year REAL NOT NULL,
      growth_pct REAL NOT NULL
    );
  `);

  // 8. FEEDBACKS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stars INTEGER NOT NULL,
      sentiment TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. CATEGORIES TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      bg_color TEXT NOT NULL
    );
  `);

  // 10. ORDERS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      city TEXT NOT NULL,
      category TEXT NOT NULL,
      items INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      delivery_time TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedIfEmpty();
}

function seedIfEmpty() {
  console.log('🌱 Checking SQLite database seed state...');

  // Update existing Rohan Waghmare & cleanup extra demo users
  db.exec(`UPDATE users SET email = 'rohanwaghmare447@gmail.com', password = 'Pass@123', name = 'Rohan Waghmare', avatar = 'RW' WHERE id = 'usr-101';`);
  db.exec(`DELETE FROM users WHERE id IN ('usr-102', 'usr-103');`);

  const checkUser = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUser.count > 0) {
    console.log('✅ SQLite database already contains dashboard data.');
    return;
  }

  // Seed Users for Authentication
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, phone, email, password, role, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-101', 'Rohan Waghmare', '9876543210', 'rohanwaghmare447@gmail.com', 'Pass@123', 'Head of Analytics', 'RW');

  // Seed Hero
  db.prepare(`
    INSERT OR IGNORE INTO hero_metrics (id, growth_pct, current_year, previous_year)
    VALUES (1, 32.50, '2.2M', '1.68M')
  `).run();

  // Seed Marketing
  db.prepare(`
    INSERT OR IGNORE INTO marketing_metrics (id, impressions, clicks, conversions, revenue)
    VALUES (1, '3.9M', '3.9M', '3.9M', '3.9M')
  `).run();

  // Seed Customers
  db.prepare(`
    INSERT OR IGNORE INTO customer_metrics (id, new_customers, lost_customers, total_target)
    VALUES (1, 768, 472, 1504)
  `).run();

  // Seed Inventory Summary
  db.prepare(`
    INSERT OR IGNORE INTO inventory_metrics (id, available_stock_pct, damage_stock_pct)
    VALUES (1, 6.0, 6.0)
  `).run();

  // Seed Inventory Trend
  const insertInv = db.prepare(`
    INSERT OR IGNORE INTO inventory_trend (month, month_order, stock_available, stock_sold) VALUES (?, ?, ?, ?)
  `);
  const invData = [
    ['Jan', 1, 93, 89], ['Feb', 2, 81, 84], ['Mar', 3, 90, 89],
    ['Apr', 4, 87, 88], ['May', 5, 90, 86], ['Jun', 6, 91, 90],
    ['Jul', 7, 90, 89], ['Aug', 8, 92, 88], ['Sep', 9, 93, 89]
  ];
  for (const row of invData) insertInv.run(...row);

  // Seed Sales Overview
  const insertSales = db.prepare(`
    INSERT OR IGNORE INTO sales_overview (month, month_order, current_year, previous_year, growth_pct) VALUES (?, ?, ?, ?, ?)
  `);
  const salesData = [
    ['Jan', 1, 0.28, 0.28, 65], ['Feb', 2, 0.26, 0.25, 78], ['Mar', 3, 0.24, 0.18, 95],
    ['Apr', 4, 0.22, 0.25, 25], ['May', 5, 0.26, 0.27, 28], ['Jun', 6, 0.24, 0.23, 30],
    ['Jul', 7, 0.25, 0.30, 24], ['Aug', 8, 0.26, 0.28, 20], ['Sep', 9, 0.24, 0.31, 28]
  ];
  for (const row of salesData) insertSales.run(...row);

  // Seed Feedbacks
  const insertFb = db.prepare(`
    INSERT OR IGNORE INTO feedbacks (id, name, stars, sentiment, comment) VALUES (?, ?, ?, ?, ?)
  `);
  const fbData = [
    ['#FB-101', 'Vasantika Chatterjee', 3, '😐', 'Fast delivery, but missing item replaced quickly.'],
    ['#FB-102', 'Udyati Malhotra', 3, '😔', 'Packaging was slightly damaged during rain.'],
    ['#FB-103', 'Sneha Amble', 3, '😐', 'Good fresh vegetables, standard 8 min delivery.'],
    ['#FB-104', 'Aarav Mehta', 5, '😊', 'Super fast 6 minute delivery! Impressed.'],
    ['#FB-105', 'Rhea Sen', 4, '😊', 'Quality of dairy products was fresh and great.']
  ];
  for (const row of fbData) insertFb.run(...row);

  // Seed Categories
  const insertCat = db.prepare(`
    INSERT OR IGNORE INTO categories (name, icon, bg_color) VALUES (?, ?, ?)
  `);
  const catData = [
    ['Mother & Baby', '👩‍👦', '#EDE9FE'], ['Drinks & Juices', '🧃', '#FEF3C7'],
    ['Milk & Dairy', '🥛', '#DBEAFE'], ['Fruits & Veggies', '🍎', '#FEE2E2'],
    ['Groceries', '🛍️', '#E0E7FF'], ['Snacks & Munch', '🍿', '#FFEDD5'],
    ['Ice Creams', '🍦', '#FCE7F3'], ['Personal Care', '🧴', '#CCFBF1'],
    ['Pet Food', '🐶', '#FEF3C7'], ['Pharmacy', '💊', '#E0F2FE']
  ];
  for (const row of catData) insertCat.run(...row);

  // Seed Orders
  const insertOrder = db.prepare(`
    INSERT OR IGNORE INTO orders (id, customer, city, category, items, amount, status, delivery_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const orders = [
    ['#BLK-284329', 'Priya Sharma', 'Mumbai', 'Grocery', 6, 842, 'Delivered', '4 min'],
    ['#BLK-284328', 'Rahul Gupta', 'Delhi NCR', 'Beverages', 2, 234, 'In Transit', '6 min'],
    ['#BLK-284327', 'Ananya Patel', 'Bangalore', 'Fruits & Vegs', 9, 1243, 'Preparing', '3 min'],
    ['#BLK-284326', 'Karan Mehta', 'Hyderabad', 'Dairy & Eggs', 4, 567, 'Delivered', '7 min'],
    ['#BLK-284325', 'Sneha Iyer', 'Chennai', 'Snacks', 3, 389, 'Delivered', '9 min'],
    ['#BLK-284324', 'Vikram Singh', 'Pune', 'Grocery', 7, 1102, 'Cancelled', '—'],
    ['#BLK-284323', 'Pooja Reddy', 'Mumbai', 'Personal Care', 1, 149, 'Delivered', '5 min'],
    ['#BLK-284322', 'Arjun Nair', 'Bangalore', 'Household', 5, 723, 'In Transit', '8 min']
  ];
  for (const o of orders) insertOrder.run(...o);

  console.log('🎉 SQLite Database initialized!');
}

// ── AUTHENTICATION HELPERS ───────────────────────────────

function authenticateUser(phoneOrEmail, password) {
  const stmt = db.prepare(`
    SELECT id, name, email, phone, role, avatar FROM users
    WHERE (phone = ? OR email = ?) AND password = ?
  `);
  return stmt.get(phoneOrEmail, phoneOrEmail, password);
}

function getUserById(id) {
  const stmt = db.prepare('SELECT id, name, email, phone, role, avatar FROM users WHERE id = ?');
  return stmt.get(id);
}

// ── DASHBOARD HELPERS FOR 6 SPECIALIZED PAGES ─────────────

// 1. Sales Overview Dashboard
function getSalesOverviewDashboard() {
  const overview = db.prepare('SELECT * FROM sales_overview ORDER BY month_order ASC').all();
  return {
    total_revenue: '₹42.6 Cr',
    total_orders: '284,329',
    aov: '₹485',
    growth_rate: '+18.7%',
    months: overview.map(r => r.month),
    current_year: overview.map(r => r.current_year),
    previous_year: overview.map(r => r.previous_year),
    growth_pct: overview.map(r => r.growth_pct),
    timeframes: {
      daily: [8200, 8900, 9100, 8700, 9500, 9800, 10400],
      weekly: [54000, 58000, 61000, 64000, 67000],
      monthly: overview.map(r => r.current_year * 100)
    }
  };
}

// 2. Order & Delivery Performance Dashboard
function getDeliveryPerformanceDashboard() {
  return {
    avg_delivery_time: '8.3 min',
    on_time_pct: '96.4%',
    fulfillment_rate: '98.2%',
    cancellation_rate: '3.6%',
    status_breakdown: {
      labels: ['Delivered', 'In Transit', 'Preparing', 'Cancelled', 'Returned'],
      data: [96.4, 1.8, 1.2, 0.4, 0.2],
      colors: ['#10B981', '#3B82F6', '#FFC400', '#EF4444', '#8B5CF6']
    },
    delivery_time_distribution: {
      labels: ['< 5 min', '5-8 min', '8-10 min', '10-15 min', '> 15 min'],
      data: [35, 48, 12, 4, 1]
    }
  };
}

// 3. Customer Insights Dashboard
function getCustomerInsightsDashboard() {
  return {
    active_users: '123,456',
    new_vs_repeat: { new_pct: 35, repeat_pct: 65, new_count: 43210, repeat_count: 80246 },
    retention_rate: '74.2%',
    clv: '₹4,250',
    order_frequency: '3.8 orders/mo',
    cohort_trend: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      new_users: [420, 510, 630, 580, 690, 710, 750, 740, 768],
      repeat_users: [1200, 1350, 1420, 1580, 1690, 1810, 1950, 2040, 2150]
    }
  };
}

// 4. Product / Category Analysis Dashboard
function getProductCategoryDashboard() {
  return {
    top_selling_products: [
      { name: "Amul Taaza Milk 1L", units: 18420, revenue: "₹2.21 Cr", stock_status: "In Stock" },
      { name: "Lay's Classic Chips 50g", units: 15630, revenue: "₹1.09 Cr", stock_status: "In Stock" },
      { name: "Organic Bananas 1kg", units: 14210, revenue: "₹0.85 Cr", stock_status: "Low Stock" },
      { name: "Aashirvaad Atta 5kg", units: 12880, revenue: "₹1.93 Cr", stock_status: "In Stock" },
      { name: "Red Bull Energy 250ml", units: 11540, revenue: "₹1.39 Cr", stock_status: "In Stock" }
    ],
    category_revenue: {
      labels: ['Fruits & Veggies', 'Milk & Dairy', 'Snacks & Munch', 'Drinks & Juices', 'Household', 'Personal Care'],
      data: [18.4, 15.2, 12.8, 10.6, 9.3, 7.7]
    },
    discount_impact: {
      promo_sales_pct: '18.5%',
      avg_discount_pct: '12.4%',
      discounted_revenue: '₹7.8 Cr'
    }
  };
}

// 5. Regional / Store Performance Dashboard
function getRegionalStoreDashboard() {
  return {
    top_cities: [
      { city: 'Mumbai', orders: 52400, revenue: '₹9.2 Cr', dark_stores: 42, partner_rating: '4.9 ⭐' },
      { city: 'Delhi NCR', orders: 48300, revenue: '₹8.4 Cr', dark_stores: 38, partner_rating: '4.8 ⭐' },
      { city: 'Bangalore', orders: 43200, revenue: '₹7.8 Cr', dark_stores: 35, partner_rating: '4.9 ⭐' },
      { city: 'Hyderabad', orders: 31800, revenue: '₹5.6 Cr', dark_stores: 26, partner_rating: '4.7 ⭐' },
      { city: 'Chennai', orders: 28500, revenue: '₹5.1 Cr', dark_stores: 22, partner_rating: '4.8 ⭐' }
    ],
    delivery_partner_stats: {
      active_riders: '14,250',
      avg_rider_speed: '7.8 min',
      rider_rating: '4.85 / 5'
    }
  };
}

// 6. Inventory & Supply Chain Dashboard
function getInventorySupplyDashboard() {
  const summary = db.prepare('SELECT * FROM inventory_metrics WHERE id = 1').get();
  const trendRows = db.prepare('SELECT * FROM inventory_trend ORDER BY month_order ASC').all();
  return {
    available_stock_pct: '94.0%',
    damaged_stock_pct: '6.0%',
    restock_frequency: '4x Daily',
    out_of_stock_rate: '1.8%',
    warehouse_health: 'Optimal',
    months: trendRows.map(r => r.month),
    stock_available: trendRows.map(r => r.stock_available),
    stock_sold: trendRows.map(r => r.stock_sold)
  };
}

function getHeroMetrics() {
  return db.prepare('SELECT * FROM hero_metrics WHERE id = 1').get();
}

function getMarketingMetrics() {
  return db.prepare('SELECT * FROM marketing_metrics WHERE id = 1').get();
}

function getCustomerMetrics() {
  return db.prepare('SELECT * FROM customer_metrics WHERE id = 1').get();
}

function getInventoryMetrics() {
  const summary = db.prepare('SELECT * FROM inventory_metrics WHERE id = 1').get();
  const trendRows = db.prepare('SELECT * FROM inventory_trend ORDER BY month_order ASC').all();
  return {
    ...summary,
    months: trendRows.map(r => r.month),
    stock_available: trendRows.map(r => r.stock_available),
    stock_sold: trendRows.map(r => r.stock_sold)
  };
}

function getSalesOverview() {
  const rows = db.prepare('SELECT * FROM sales_overview ORDER BY month_order ASC').all();
  return {
    months: rows.map(r => r.month),
    current_year: rows.map(r => r.current_year),
    previous_year: rows.map(r => r.previous_year),
    growth_pct: rows.map(r => r.growth_pct)
  };
}

function getFeedbacks() {
  return db.prepare('SELECT * FROM feedbacks ORDER BY created_at DESC').all();
}

function addFeedback({ name, stars = 3, sentiment = '😐', comment = '' }) {
  const newId = `#FB-${Math.floor(100 + Math.random() * 900)}`;
  db.prepare(`
    INSERT INTO feedbacks (id, name, stars, sentiment, comment) VALUES (?, ?, ?, ?, ?)
  `).run(newId, name, Number(stars), sentiment, comment);
  return { id: newId, name, stars, sentiment, comment };
}

function getCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
}

function getOrders({ search = '', status = '' } = {}) {
  let query = 'SELECT * FROM orders';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('(customer LIKE ? OR city LIKE ? OR id LIKE ? OR category LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY timestamp DESC LIMIT 20';
  return db.prepare(query).all(...params);
}

module.exports = {
  initDatabase,
  authenticateUser,
  getUserById,
  getSalesOverviewDashboard,
  getDeliveryPerformanceDashboard,
  getCustomerInsightsDashboard,
  getProductCategoryDashboard,
  getRegionalStoreDashboard,
  getInventorySupplyDashboard,
  getHeroMetrics,
  getMarketingMetrics,
  getCustomerMetrics,
  getInventoryMetrics,
  getSalesOverview,
  getFeedbacks,
  addFeedback,
  getCategories,
  getOrders
};
