git clone https://github.com/YOUR_USERNAME/blinkit-dashboard.git
# 🛒 Blinkit Analytics Dashboard

A full-stack **Quick Commerce Analytics Dashboard** inspired by Blinkit, built with **Node.js + Express** backend and an interactive **3D frontend** dashboard.

## 🚀 Features

- 📊 **6 Dedicated Dashboards** — Sales, Delivery, Customers, Products, Regional, Inventory
- 🔐 **Authentication System** — Login/logout with session management
- 📦 **SQLite Database** — Auto-seeded with realistic Blinkit-style data
- 🌐 **REST API** — Full Express.js REST API backend
- ✨ **3D Animated UI** — Three.js powered background and interactive charts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Frontend | Vanilla JS, HTML5, CSS3 |
| 3D Graphics | Three.js |

## 📦 Getting Started

### Prerequisites
- Node.js v18+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/blinkit-dashboard.git
cd blinkit-dashboard

# Install dependencies
npm install

# Start the server
npm start
```

Open your browser at **http://localhost:3000**

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/dashboards/sales-overview` | Sales dashboard data |
| GET | `/api/dashboards/delivery-performance` | Delivery metrics |
| GET | `/api/dashboards/customer-insights` | Customer analytics |
| GET | `/api/dashboards/product-category` | Product data |
| GET | `/api/dashboards/regional-store` | Regional store data |
| GET | `/api/dashboards/inventory-supply` | Inventory metrics |
| GET | `/api/orders` | Live orders |

## 🚀 Deploy on Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Deploy!

## 📄 License

MIT
