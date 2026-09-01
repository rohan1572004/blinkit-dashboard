// =========================================================
//  BLINKIT ANALYTICS DASHBOARD — EXPRESS REST API SERVER
// =========================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
db.initDatabase();

// Simple in-memory session tokens
const activeSessions = new Map();

// ── AUTHENTICATION ENDPOINTS ──────────────────────────────

// 1. User Login Endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username (email/phone) and password required' });
    }

    const user = db.authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid phone/email or password' });
    }

    // Generate token
    const token = `token-${user.id}-${Date.now()}`;
    activeSessions.set(token, user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. User Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization;
  if (token) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 3. Current User Session Endpoint
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization;
  if (token && activeSessions.has(token)) {
    return res.json({ success: true, user: activeSessions.get(token) });
  }
  res.status(401).json({ success: false, error: 'Not authenticated' });
});

// ── DASHBOARD REST API ENDPOINTS ─────────────────────────

// ── 6 DEDICATED DASHBOARDS REST ENDPOINTS ───────────────

// 1. Sales Overview Dashboard Endpoint
app.get('/api/dashboards/sales-overview', (req, res) => {
  try {
    const data = db.getSalesOverviewDashboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Order & Delivery Performance Endpoint
app.get('/api/dashboards/delivery-performance', (req, res) => {
  try {
    const data = db.getDeliveryPerformanceDashboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Customer Insights Endpoint
app.get('/api/dashboards/customer-insights', (req, res) => {
  try {
    const data = db.getCustomerInsightsDashboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Product / Category Analysis Endpoint
app.get('/api/dashboards/product-category', (req, res) => {
  try {
    const data = db.getProductCategoryDashboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Regional / Dark Store Performance Endpoint
app.get('/api/dashboards/regional-store', (req, res) => {
  try {
    const data = db.getRegionalStoreDashboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Inventory & Supply Chain Endpoint
app.get('/api/dashboards/inventory-supply', (req, res) => {
  try {
    const data = db.getInventorySupplyDashboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Executive / Hero KPI Endpoint
app.get('/api/dashboard/hero', (req, res) => {
  try {
    const data = db.getHeroMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Marketing Metrics Endpoint
app.get('/api/dashboard/marketing', (req, res) => {
  try {
    const data = db.getMarketingMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Customer Metrics Endpoint
app.get('/api/dashboard/customers', (req, res) => {
  try {
    const data = db.getCustomerMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Inventory Metrics Endpoint
app.get('/api/dashboard/inventory', (req, res) => {
  try {
    const data = db.getInventoryMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sales Overview Endpoint
app.get('/api/dashboard/sales-overview', (req, res) => {
  try {
    const data = db.getSalesOverview();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Feedbacks Endpoint
app.get('/api/dashboard/feedbacks', (req, res) => {
  try {
    const data = db.getFeedbacks();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add Feedback Endpoint
app.post('/api/dashboard/feedbacks', (req, res) => {
  try {
    const { name, stars, sentiment, comment } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const newFb = db.addFeedback({ name, stars, sentiment, comment });
    res.json({ success: true, data: newFb });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Categories Carousel Endpoint
app.get('/api/dashboard/categories', (req, res) => {
  try {
    const data = db.getCategories();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Live Orders Endpoint
app.get('/api/orders', (req, res) => {
  try {
    const { search, status } = req.query;
    const orders = db.getOrders({ search, status });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Comprehensive Report Export Data Endpoint (Daily, Weekly, Monthly, Yearly)
app.get('/api/reports/data', (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'daily';
    const report = db.getReportData(timeframe);
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`⚡ Blinkit Analytics Backend Server running on http://localhost:${PORT}`);
});


