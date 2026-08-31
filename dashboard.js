// =========================================================
//  BLINKIT 3D LIVE ANALYTICS PORTAL — DASHBOARD CONTROLLER
// =========================================================

let activeUser = null;
let activeToken = localStorage.getItem('blinkit_token');
let activeCharts = {};
let isStreamActive = true;
let streamInterval = null;
let sidebarOrderCount = 1042;

// Chart defaults — premium dark theme
Chart.defaults.color = '#5A6480';
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.legend.labels.padding = 16;

const C_YELLOW = '#FFD000';
const C_GREEN  = '#00D084';
const C_RED    = '#FF4757';
const C_BLUE   = '#4ECDC4';
const C_PURPLE = '#A855F7';
const C_ORANGE = '#FF6B35';

function gridColor() { return 'rgba(255,255,255,0.05)'; }
function axisColor() { return '#5A6480'; }

const baseChartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: gridColor() }, ticks: { color: axisColor(), font: { size: 11 } } },
    y: { grid: { color: gridColor() }, ticks: { color: axisColor(), font: { size: 11 } } }
  }
};

// ── 1. AUTHENTICATION ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initThreeBackground();
  initClock();

  if (activeToken) {
    checkSession().then(ok => ok ? showApp() : showLogin());
  } else {
    showLogin();
  }

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = document.getElementById('login-error');
    errEl.textContent = '';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: document.getElementById('login-email').value,
          password: document.getElementById('login-password').value
        })
      });
      const json = await res.json();
      if (json.success) {
        activeToken = json.token;
        activeUser = json.user;
        localStorage.setItem('blinkit_token', activeToken);
        showApp();
      } else {
        errEl.textContent = json.error || 'Login failed. Please check your credentials.';
      }
    } catch { errEl.textContent = 'Cannot reach server. Make sure it is running.'; }
  });

  document.getElementById('btn-demo-admin').addEventListener('click', () => {
    document.getElementById('login-email').value = 'rohanwaghmare447@gmail.com';
    document.getElementById('login-password').value = 'Pass@123';
    document.getElementById('login-form').requestSubmit();
  });

  document.getElementById('btn-logout').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: activeToken } }); } catch {}
    activeToken = null; activeUser = null;
    localStorage.removeItem('blinkit_token');
    if (streamInterval) clearInterval(streamInterval);
    showLogin();
  });
});

async function checkSession() {
  try {
    const r = await fetch('/api/auth/me', { headers: { Authorization: activeToken } });
    const j = await r.json();
    if (j.success) { activeUser = j.user; return true; }
  } catch {}
  return false;
}

function showLogin() {
  document.getElementById('view-login').style.display = 'flex';
  document.getElementById('view-app').style.display = 'none';
}

function showApp() {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-app').style.display = 'flex';
  if (activeUser) {
    document.getElementById('topbar-name').textContent = activeUser.name;
    document.getElementById('topbar-role').textContent = activeUser.role;
    document.getElementById('topbar-avatar').textContent = activeUser.avatar || 'RW';
  }
  initSidebar();
  initLiveStream();
  initStreamToggle();
  initExportButtons();
  loadDashboard('dash-sales');
}

// ── 2. SIDEBAR NAV ─────────────────────────────────────────
function initSidebar() {
  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadDashboard(btn.dataset.dash);
    });
  });
}

function loadDashboard(id) {
  document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById(id);
  if (view) view.classList.add('active');

  const loaders = {
    'dash-sales':     loadSalesDashboard,
    'dash-delivery':  loadDeliveryDashboard,
    'dash-customers': loadCustomersDashboard,
    'dash-product':   loadProductDashboard,
    'dash-regional':  loadRegionalDashboard,
    'dash-inventory': loadInventoryDashboard
  };
  if (loaders[id]) loaders[id]();
}

// ── 3. LIVE CLOCK ──────────────────────────────────────────
function initClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const tick = () => { el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false }); };
  tick();
  setInterval(tick, 1000);
}

// ── 4. LIVE STREAM ENGINE ──────────────────────────────────
const customers = ['Ananya Roy','Vikram Sen','Sneha Kapoor','Rahul Verma','Karan Mehta','Meera Nair','Arjun Das','Pooja Singh','Nikhil Gupta','Sakshi Joshi'];
const cities    = ['Mumbai','Delhi NCR','Bangalore','Hyderabad','Chennai','Pune'];
const cats      = ['Grocery','Milk & Dairy','Fruits & Vegs','Snacks','Beverages','Bakery','Meat & Fish'];
const statusOptions = ['Delivered','Preparing','Out for Delivery'];

function initLiveStream() {
  if (streamInterval) clearInterval(streamInterval);
  streamInterval = setInterval(() => {
    if (!isStreamActive) return;
    const order = generateLiveOrder();
    prependOrderRow(order);
    showToast(`⚡ ${order.id} — ${order.customer} (${order.city}) ₹${order.amount}`, 'success');
    sidebarOrderCount++;
    const el = document.getElementById('sidebar-orders-count');
    if (el) el.textContent = sidebarOrderCount.toLocaleString();
  }, 3500);
}

function generateLiveOrder() {
  return {
    id: `#BLK-${Math.floor(280000 + Math.random() * 9999)}`,
    customer: customers[Math.floor(Math.random() * customers.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
    category: cats[Math.floor(Math.random() * cats.length)],
    items: Math.floor(2 + Math.random() * 6),
    amount: Math.floor(250 + Math.random() * 850),
    status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
    time: `${Math.floor(5 + Math.random() * 8)} min`
  };
}

function prependOrderRow(o) {
  const tbody = document.getElementById('live-orders-tbody');
  if (!tbody) return;
  const statusClass = o.status === 'Delivered' ? 'success' : o.status === 'Preparing' ? 'warning' : 'info';
  const row = document.createElement('tr');
  row.className = 'new-row';
  row.innerHTML = `
    <td style="font-weight:800;color:${C_YELLOW};font-family:var(--font-mono)">${o.id}</td>
    <td style="color:var(--text-1)">${o.customer}</td>
    <td>${o.city}</td>
    <td>${o.category}</td>
    <td style="text-align:center">${o.items}</td>
    <td style="font-weight:800;color:var(--text-1)">₹${o.amount}</td>
    <td><span class="status-badge ${statusClass}">${o.status}</span></td>
    <td style="color:${C_GREEN};font-weight:700">${o.time}</td>
  `;
  tbody.insertBefore(row, tbody.firstChild);
  if (tbody.children.length > 14) tbody.removeChild(tbody.lastChild);
}

function initStreamToggle() {
  const btn = document.getElementById('btn-stream-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    isStreamActive = !isStreamActive;
    btn.innerHTML = isStreamActive
      ? `<span class="live-dot"></span> LIVE`
      : `⏸ PAUSED`;
    btn.classList.toggle('paused', !isStreamActive);
  });

  const pauseBtn = document.getElementById('btn-pause-feed');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isStreamActive = !isStreamActive;
      pauseBtn.textContent = isStreamActive ? '⏸ Pause Feed' : '▶ Resume Feed';
    });
  }
}

function initExportButtons() {
  const exportSales = document.getElementById('btn-export-sales');
  if (exportSales) {
    exportSales.addEventListener('click', () => {
      downloadCSV('Blinkit_Sales_Report', 'Metric,Value\nTotal Revenue,₹42.6 Cr\nOrders,284329\nAOV,₹485\nGrowth Rate,+18.7%');
      showToast('📥 Blinkit_Sales_Report.csv downloaded!');
    });
  }
  const globalExport = document.getElementById('btn-export-global');
  if (globalExport) {
    globalExport.addEventListener('click', () => {
      downloadCSV('Blinkit_Full_Analytics_Report', 'Dashboard,Metric,Value\nSales,Revenue,₹42.6 Cr\nDelivery,Avg Time,8.3 min\nCustomers,LTV,₹4250\nInventory,Stock,94%');
      showToast('📥 Full analytics report downloaded!');
    });
  }
}

function downloadCSV(name, content) {
  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  link.download = `${name}.csv`;
  link.click();
}

// ── TOAST NOTIFICATIONS ────────────────────────────────────
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '⚡' : '📢'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── DESTROY / RECREATE CHARTS ──────────────────────────────
function mkChart(id, config) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (activeCharts[id]) activeCharts[id].destroy();
  activeCharts[id] = new Chart(ctx, config);
  return activeCharts[id];
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD 1 — SALES OVERVIEW
// ═══════════════════════════════════════════════════════════
async function loadSalesDashboard() {
  try {
    const r = await fetch('/api/dashboards/sales-overview');
    const j = await r.json();
    if (!j.success) return;
    const d = j.data;

    document.getElementById('so-revenue').textContent = d.total_revenue;
    document.getElementById('so-orders').textContent  = d.total_orders;
    document.getElementById('so-aov').textContent     = d.aov;

    // Revenue & Orders dual-axis trend
    mkChart('chart-sales-trend', {
      type: 'line',
      data: {
        labels: d.months,
        datasets: [
          { label: 'Revenue (₹ Lakh)', data: d.current_year, borderColor: C_YELLOW, backgroundColor: 'rgba(255,208,0,0.1)', fill: true, borderWidth: 2.5, tension: 0.4, yAxisID: 'y' },
          { label: 'Orders (K)', data: d.previous_year, borderColor: C_BLUE, borderWidth: 2, tension: 0.4, borderDash: [5, 3], yAxisID: 'y1' }
        ]
      },
      options: { ...baseChartOpts,
        plugins: { legend: { display: true, labels: { color: '#A8B2CC' } } },
        scales: {
          x: { grid: { color: gridColor() }, ticks: { color: axisColor(), font: { size: 11 } } },
          y:  { grid: { color: gridColor() }, ticks: { color: C_YELLOW, font: { size: 11 } }, position: 'left' },
          y1: { grid: { display: false }, ticks: { color: C_BLUE, font: { size: 11 } }, position: 'right' }
        }
      }
    });

    // Category revenue bar
    mkChart('chart-sales-category', {
      type: 'bar',
      data: {
        labels: ['Grocery','Dairy','Snacks','Fruits','Beverages','Bakery'],
        datasets: [{ data: [18.4, 15.2, 12.8, 9.6, 7.4, 5.2], backgroundColor: [C_YELLOW, C_GREEN, C_BLUE, C_ORANGE, C_PURPLE, C_RED], borderRadius: 6 }]
      },
      options: { ...baseChartOpts, indexAxis: 'y', plugins: { legend: { display: false } } }
    });

    // YoY comparison grouped bar
    mkChart('chart-yoy', {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
        datasets: [
          { label: 'FY25', data: [320,290,340,380,350,400,420,390,370], backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 },
          { label: 'FY26', data: d.current_year, backgroundColor: C_YELLOW, borderRadius: 4 }
        ]
      },
      options: { ...baseChartOpts, plugins: { legend: { display: true, labels: { color: '#A8B2CC' } } } }
    });

    // Hourly order distribution
    mkChart('chart-hourly', {
      type: 'line',
      data: {
        labels: ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm','10pm'],
        datasets: [{ label: 'Orders', data: [120,380,620,890,740,680,950,1100,680], borderColor: C_GREEN, backgroundColor: 'rgba(0,208,132,0.1)', fill: true, tension: 0.4, borderWidth: 2.5 }]
      },
      options: { ...baseChartOpts }
    });

    // Load order stream
    fetchInitialOrders();
    initTimeframePills();
  } catch(err) { console.error('Sales dashboard error:', err); }
}

async function fetchInitialOrders() {
  try {
    const r = await fetch('/api/orders');
    const j = await r.json();
    if (!j.success) return;
    const tbody = document.getElementById('live-orders-tbody');
    if (!tbody) return;
    tbody.innerHTML = j.data.map(o => `
      <tr>
        <td style="font-weight:800;color:${C_YELLOW};font-family:var(--font-mono)">${o.id}</td>
        <td style="color:var(--text-1)">${o.customer}</td>
        <td>${o.city}</td>
        <td>${o.category}</td>
        <td style="text-align:center">${o.items}</td>
        <td style="font-weight:800;color:var(--text-1)">₹${o.amount}</td>
        <td><span class="status-badge success">${o.status}</span></td>
        <td style="color:${C_GREEN};font-weight:700">${o.delivery_time}</td>
      </tr>
    `).join('');
  } catch(err) {}
}

function initTimeframePills() {
  document.querySelectorAll('.pill-group .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-group .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // re-render with different timeframe data
      const tf = btn.dataset.tf;
      const salesChart = activeCharts['chart-sales-trend'];
      if (!salesChart) return;
      const labels = { daily: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], weekly: ['Wk1','Wk2','Wk3','Wk4','Wk5'], monthly: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'], quarterly: ['Q1','Q2','Q3','Q4'] };
      const vals   = { daily: [420,380,510,490,620,780,680], weekly: [2100,2400,2200,2800,2600], monthly: [380,410,450,490,520,560,600,640,680], quarterly: [1050,1180,1340,1420] };
      salesChart.data.labels = labels[tf];
      salesChart.data.datasets[0].data = vals[tf];
      salesChart.update();
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD 2 — ORDER & DELIVERY PERFORMANCE
// ═══════════════════════════════════════════════════════════
async function loadDeliveryDashboard() {
  try {
    const r = await fetch('/api/dashboards/delivery-performance');
    const j = await r.json();
    if (!j.success) return;
    const d = j.data;

    document.getElementById('dp-avg-time').textContent  = d.avg_delivery_time;
    document.getElementById('dp-ontime').textContent    = d.on_time_pct;
    document.getElementById('dp-fulfillment').textContent = d.fulfillment_rate;
    document.getElementById('dp-cancel').textContent    = d.cancellation_rate;

    // Order status donut
    mkChart('chart-dp-donut', {
      type: 'doughnut',
      data: {
        labels: d.status_breakdown.labels,
        datasets: [{ data: d.status_breakdown.data, backgroundColor: d.status_breakdown.colors, cutout: '68%', borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#A8B2CC', padding: 12 } } } }
    });

    // Delivery speed histogram
    mkChart('chart-dp-speed', {
      type: 'bar',
      data: {
        labels: d.delivery_time_distribution.labels,
        datasets: [{ label: '% of Orders', data: d.delivery_time_distribution.data, backgroundColor: [C_GREEN, C_YELLOW, C_YELLOW, C_ORANGE, C_RED], borderRadius: 6 }]
      },
      options: { ...baseChartOpts }
    });

    // SLA compliance weekly trend
    mkChart('chart-dp-sla-trend', {
      type: 'line',
      data: {
        labels: ['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8'],
        datasets: [
          { label: 'On-Time %', data: [94.2,95.1,96.8,95.4,97.2,96.9,96.4,97.1], borderColor: C_GREEN, backgroundColor: 'rgba(0,208,132,0.1)', fill: true, borderWidth: 2.5, tension: 0.4 },
          { label: 'Target', data: [96,96,96,96,96,96,96,96], borderColor: C_RED, borderDash: [6,3], borderWidth: 1.5, tension: 0 }
        ]
      },
      options: { ...baseChartOpts, plugins: { legend: { display: true, labels: { color: '#A8B2CC' } } } }
    });

    // Cancellation reasons
    mkChart('chart-dp-cancel', {
      type: 'doughnut',
      data: {
        labels: ['Out of Stock','Customer Cancelled','Payment Failed','Address Error','Other'],
        datasets: [{ data: [52, 24, 12, 8, 4], backgroundColor: [C_RED, C_ORANGE, C_YELLOW, C_PURPLE, '#5A6480'], cutout: '65%', borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#A8B2CC', padding: 10 } } } }
    });
  } catch(err) {}
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD 3 — CUSTOMER INSIGHTS
// ═══════════════════════════════════════════════════════════
async function loadCustomersDashboard() {
  try {
    const r = await fetch('/api/dashboards/customer-insights');
    const j = await r.json();
    if (!j.success) return;
    const d = j.data;

    document.getElementById('ci-users').textContent     = d.active_users;
    document.getElementById('ci-retention').textContent = d.retention_rate;
    document.getElementById('ci-ltv').textContent       = d.clv;
    document.getElementById('ci-freq').textContent      = d.order_frequency;

    // Cohort trend
    mkChart('chart-ci-cohort', {
      type: 'line',
      data: {
        labels: d.cohort_trend.months,
        datasets: [
          { label: 'New Shoppers', data: d.cohort_trend.new_users, borderColor: C_BLUE, backgroundColor: 'rgba(78,205,196,0.1)', fill: true, borderWidth: 2.5, tension: 0.4 },
          { label: 'Repeat Shoppers', data: d.cohort_trend.repeat_users, borderColor: C_GREEN, backgroundColor: 'rgba(0,208,132,0.1)', fill: true, borderWidth: 2.5, tension: 0.4 }
        ]
      },
      options: { ...baseChartOpts, plugins: { legend: { display: true, labels: { color: '#A8B2CC' } } } }
    });

    // Composition donut
    mkChart('chart-ci-donut', {
      type: 'doughnut',
      data: {
        labels: ['Repeat Customers', 'New Customers'],
        datasets: [{ data: [d.new_vs_repeat.repeat_pct, d.new_vs_repeat.new_pct], backgroundColor: [C_GREEN, C_YELLOW], cutout: '70%', borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#A8B2CC', padding: 12 } } } }
    });

    // Retention trend line
    mkChart('chart-ci-retention', {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
        datasets: [{ label: 'Retention %', data: [68.2,70.1,71.5,72.8,73.4,74.0,73.6,74.2,74.8], borderColor: C_PURPLE, backgroundColor: 'rgba(168,85,247,0.1)', fill: true, borderWidth: 2.5, tension: 0.4 }]
      },
      options: { ...baseChartOpts }
    });

    // Churn risk distribution
    mkChart('chart-ci-churn', {
      type: 'bar',
      data: {
        labels: ['< 7 days','7-14 days','14-30 days','30-60 days','> 60 days'],
        datasets: [{ label: 'Customer Count', data: [45200, 32100, 24300, 14600, 7256], backgroundColor: [C_GREEN, C_YELLOW, C_ORANGE, C_RED, '#5A6480'], borderRadius: 6 }]
      },
      options: { ...baseChartOpts }
    });
  } catch(err) {}
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD 4 — PRODUCT / CATEGORY ANALYSIS
// ═══════════════════════════════════════════════════════════
async function loadProductDashboard() {
  try {
    const r = await fetch('/api/dashboards/product-category');
    const j = await r.json();
    if (!j.success) return;
    const d = j.data;

    document.getElementById('pca-promo').textContent    = d.discount_impact.promo_sales_pct;
    document.getElementById('pca-discount').textContent = d.discount_impact.avg_discount_pct;

    // Category revenue horizontal bar
    mkChart('chart-pca-cat', {
      type: 'bar',
      data: {
        labels: d.category_revenue.labels,
        datasets: [{ label: 'Revenue (₹ Cr)', data: d.category_revenue.data, backgroundColor: [C_YELLOW, C_GREEN, C_BLUE, C_ORANGE, C_PURPLE, C_RED], borderRadius: 6 }]
      },
      options: { ...baseChartOpts, indexAxis: 'y' }
    });

    // Promo impact grouped bar
    mkChart('chart-pca-promo', {
      type: 'bar',
      data: {
        labels: d.category_revenue.labels,
        datasets: [
          { label: 'Regular Sales', data: [15.0, 12.4, 10.4, 7.8, 6.0, 4.2], backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 },
          { label: 'Promo Sales', data: [3.4, 2.8, 2.4, 1.8, 1.4, 1.0], backgroundColor: C_YELLOW, borderRadius: 4 }
        ]
      },
      options: { ...baseChartOpts, plugins: { legend: { display: true, labels: { color: '#A8B2CC' } } } }
    });

    // Products table
    const tbody = document.getElementById('products-table-body');
    if (tbody) {
      tbody.innerHTML = d.top_selling_products.map((p, i) => `
        <tr>
          <td style="color:${C_YELLOW};font-weight:800;font-family:var(--font-mono)">#${i+1}</td>
          <td style="color:var(--text-1);font-weight:700">${p.name}</td>
          <td>${p.category || 'Grocery'}</td>
          <td>${p.units.toLocaleString()}</td>
          <td style="font-weight:800;color:var(--text-1)">${p.revenue}</td>
          <td style="color:${C_GREEN};font-weight:700">${p.margin || '18.4%'}</td>
          <td><span class="status-badge ${p.stock_status === 'In Stock' ? 'success' : 'warning'}">${p.stock_status}</span></td>
        </tr>
      `).join('');
    }
  } catch(err) {}
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD 5 — REGIONAL / STORE PERFORMANCE
// ═══════════════════════════════════════════════════════════
async function loadRegionalDashboard() {
  try {
    const r = await fetch('/api/dashboards/regional-store');
    const j = await r.json();
    if (!j.success) return;
    const d = j.data;

    document.getElementById('rsp-riders').textContent = d.delivery_partner_stats.active_riders;
    document.getElementById('rsp-speed').textContent  = d.delivery_partner_stats.avg_rider_speed;
    document.getElementById('rsp-rating').textContent = d.delivery_partner_stats.rider_rating;

    // Heatmap bar chart
    mkChart('chart-rsp-heatmap', {
      type: 'bar',
      data: {
        labels: d.top_cities.map(c => c.city),
        datasets: [{ label: 'Orders', data: d.top_cities.map(c => c.orders), backgroundColor: [C_YELLOW, C_GREEN, C_BLUE, C_ORANGE, C_PURPLE, C_RED], borderRadius: 8 }]
      },
      options: { ...baseChartOpts }
    });

    // Radar chart
    mkChart('chart-rsp-radar', {
      type: 'radar',
      data: {
        labels: d.top_cities.map(c => c.city),
        datasets: [
          { label: 'Revenue Score', data: [95, 88, 82, 72, 65, 58], borderColor: C_YELLOW, backgroundColor: 'rgba(255,208,0,0.15)', borderWidth: 2 },
          { label: 'Rider Rating', data: [97, 94, 92, 90, 88, 85], borderColor: C_GREEN, backgroundColor: 'rgba(0,208,132,0.1)', borderWidth: 2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { color: '#A8B2CC' } } },
        scales: { r: { grid: { color: gridColor() }, ticks: { color: axisColor(), backdropColor: 'transparent' }, pointLabels: { color: '#A8B2CC', font: { size: 11 } } } }
      }
    });

    // Cities table
    const tbody = document.getElementById('cities-table-body');
    if (tbody) {
      tbody.innerHTML = d.top_cities.map(c => `
        <tr>
          <td style="color:var(--text-1);font-weight:800">${c.city}</td>
          <td>${c.orders.toLocaleString()}</td>
          <td style="font-weight:800;color:var(--text-1)">${c.revenue}</td>
          <td>${c.dark_stores} stores</td>
          <td style="color:${C_GREEN};font-weight:700">${c.avg_speed || '8.1 min'}</td>
          <td style="color:${C_YELLOW};font-weight:700">★ ${c.partner_rating}</td>
          <td>
            <div class="progress-track" style="height:6px;width:80px;display:inline-block">
              <div class="progress-fill yellow" style="width:${c.utilization || 82}%"></div>
            </div>
            <span style="font-size:11px;margin-left:6px;color:var(--text-3)">${c.utilization || 82}%</span>
          </td>
        </tr>
      `).join('');
    }
  } catch(err) {}
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD 6 — INVENTORY & SUPPLY CHAIN
// ═══════════════════════════════════════════════════════════
async function loadInventoryDashboard() {
  try {
    const r = await fetch('/api/dashboards/inventory-supply');
    const j = await r.json();
    if (!j.success) return;
    const d = j.data;

    document.getElementById('isc-avail').textContent   = d.available_stock_pct;
    document.getElementById('isc-damaged').textContent = d.damaged_stock_pct;
    document.getElementById('isc-restock').textContent = d.restock_frequency;
    document.getElementById('isc-oos').textContent     = d.out_of_stock_rate;

    // Stock available vs sold line
    mkChart('chart-isc-trend', {
      type: 'line',
      data: {
        labels: d.months,
        datasets: [
          { label: 'Stock Available (M units)', data: d.stock_available, borderColor: C_GREEN, backgroundColor: 'rgba(0,208,132,0.1)', fill: true, borderWidth: 2.5, tension: 0.4 },
          { label: 'Stock Sold (M units)', data: d.stock_sold, borderColor: C_YELLOW, backgroundColor: 'rgba(255,208,0,0.1)', fill: true, borderWidth: 2.5, tension: 0.4 }
        ]
      },
      options: { ...baseChartOpts, plugins: { legend: { display: true, labels: { color: '#A8B2CC' } } } }
    });

    // Warehouse health doughnut
    mkChart('chart-isc-health', {
      type: 'doughnut',
      data: {
        labels: ['Available & Healthy', 'Damaged / Waste'],
        datasets: [{ data: [94, 6], backgroundColor: [C_GREEN, C_RED], cutout: '68%', borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#A8B2CC', padding: 12 } } } }
    });

    // Category stock horizontal bar
    mkChart('chart-isc-cat', {
      type: 'bar',
      data: {
        labels: ['Grocery','Dairy','Snacks','Fruits','Beverages','Bakery'],
        datasets: [{ label: 'Stock Level (%)', data: [96, 92, 88, 95, 91, 84], backgroundColor: C_YELLOW, borderRadius: 6 }]
      },
      options: { ...baseChartOpts, indexAxis: 'y', plugins: { legend: { display: false } } }
    });
  } catch(err) {}
}

// ═══════════════════════════════════════════════════════════
//  THREE.JS 3D BACKGROUND
// ═══════════════════════════════════════════════════════════
function initThreeBackground() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 35;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambLight);
  const pointLightYellow = new THREE.PointLight(0xFFD000, 2.5, 60);
  pointLightYellow.position.set(15, 15, 20);
  scene.add(pointLightYellow);
  const pointLightGreen = new THREE.PointLight(0x00D084, 1.5, 50);
  pointLightGreen.position.set(-20, -10, 15);
  scene.add(pointLightGreen);

  // Floating 3D objects — cubes & octahedrons
  const objects = [];
  const geos = [new THREE.BoxGeometry(2,2,2), new THREE.OctahedronGeometry(1.3), new THREE.TetrahedronGeometry(1.5)];
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0xFFD000, roughness: 0.2, metalness: 0.6, transparent: true, opacity: 0.75 }),
    new THREE.MeshStandardMaterial({ color: 0x00D084, roughness: 0.2, metalness: 0.6, transparent: true, opacity: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0x4ECDC4, roughness: 0.3, metalness: 0.5, transparent: true, opacity: 0.5 }),
  ];

  for (let i = 0; i < 28; i++) {
    const geo = geos[Math.floor(Math.random() * geos.length)];
    const mat = mats[Math.floor(Math.random() * mats.length)];
    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.position.set((Math.random() - 0.5) * 55, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 25 - 5);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const s = 0.4 + Math.random() * 0.8;
    mesh.scale.set(s, s, s);
    mesh.userData = { rx: (Math.random() - 0.5) * 0.012, ry: (Math.random() - 0.5) * 0.012, iy: mesh.position.y };
    scene.add(mesh);
    objects.push(mesh);
  }

  // Particle cloud
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(200 * 3);
  for (let i = 0; i < 200 * 3; i++) pPos[i] = (Math.random() - 0.5) * 90;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.2, color: 0xFFD000, transparent: true, opacity: 0.35 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Mouse parallax
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => { mx = (e.clientX / window.innerWidth) * 2 - 1; my = -(e.clientY / window.innerHeight) * 2 + 1; });
  window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    cx += (mx * 5 - cx) * 0.04;
    cy += (my * 3 - cy) * 0.04;
    camera.position.x = cx;
    camera.position.y = cy;
    camera.lookAt(scene.position);

    objects.forEach(m => {
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      m.position.y = m.userData.iy + Math.sin(t * 0.6 + m.position.x * 0.2) * 0.6;
    });
    particles.rotation.y += 0.0004;
    renderer.render(scene, camera);
  })();
}
