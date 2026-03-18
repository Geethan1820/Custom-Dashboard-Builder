# 📊 Custom Dashboard Builder

A robust, full-stack application for managing customer orders and building personalized monitoring dashboards with real-time data integration and secure JWT authentication.

## ✨ Key Features

### 🔐 Secure Access
- **JWT Authentication**: Full registration and login flow with `bcryptjs` password hashing.
- **Protected Routes**: Secure workspace for authenticated users only.
- **Persistent Sessions**: Automatic token management with Axios interceptors.

### 📦 Order Management
- **Full CRUD**: Create, Read, Update, and Delete customer orders.
- **Auto-Calculations**: Dynamic total calculation based on quantity and unit price.
- **Global Data**: Pre-seeded with 21 realistic international orders (USA, Canada, India, Germany, UK).

### 📐 Dashboard Builder
- **Draggable Grid**: Powered by `react-grid-layout` with a 12-column responsive system.
- **Multi-Directional Resizing**: Independent width and height handles for pixel-perfect alignment.
- **Widget Library**:
  - **KPI Cards**: Sum, Avg, Count aggregations.
  - **Charts**: Bar, Line, Area, Scatter, and Pie charts with customizable axes.
  - **Data Tables**: Recent transactions with granular column control.
- **Global Context**: Sync all widgets with a single date filter (Today, 7d, 30d, All Time).
- **Real-Time Sync**: Auto-polling every 30 seconds for live updates.

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎥 Project Demo
Check out the full workflow and features in action here:
[Demo Video Link](https://drive.google.com/file/d/1IikOG2V_7vN46SslasNjmJkrcbUqnAr2/view?usp=drive_link)

---
Developed with ❤️ by the Dashboard Builder Team.
