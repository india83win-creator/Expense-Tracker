# Midnight Ledger — Expense Tracker

A premium, glassmorphism-styled expense tracking application designed for a sleek and beautiful user experience. The project is split into a React + Vite frontend and an Express + Node.js native SQLite backend.

## 🌟 Features

- **Secure User Accounts:** JWT-based authentication allows each user to maintain private ledgers securely.
- **Interactive Dashboard:** 
  - Dynamic monthly budget setting that visually calculates spending progress via an SVG progress ring.
  - Interactive charts utilizing Recharts for monthly trends and category breakdowns.
- **Glassmorphic UI Design:** Deep, premium theme with translucent components (`glassmorphism`), customized color palette (`void`, `panel`, `emerald-glow`), typography (`Fraunces`, `Plus Jakarta Sans`, `JetBrains Mono`), and subtle micro-animations.
- **Full Ledger Capabilities:** Add, edit, and track expenses smoothly, assigning them to categories natively populated with rich icons.
- **Zero Configuration DB:** Utilizing Node 24's native `node:sqlite` module for instant, out-of-the-box local database functionality with zero external bindings required.

## 📁 Project Structure

```
expense-tracker/
├── backend/      Node.js (24+) Express API + node:sqlite database
└── frontend/     React 18 + Vite + Tailwind CSS UI
```

## 🚀 Quick Start Guide

### 1. Run the Backend (API)

```bash
cd backend
npm install
npm run dev
```

This starts the API on **http://localhost:4000**. 
- An `expenses.db` SQLite file is created automatically on the first run.
- Default categories are automatically seeded for new users upon signup.
- Notice: Requires Node 24+ for the native `node:sqlite` support.

### 2. Run the Frontend (UI)

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

This starts the web app on **http://localhost:5173**. 
- The Vite development server automatically proxies `/api/*` requests to the backend, so CORS configurations are handled transparently.

### 3. Open the App
Visit **[http://localhost:5173](http://localhost:5173)** in your browser, sign up for a new account, and begin tracking your expenses.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 & Vite
- **Styling:** Tailwind CSS (Custom themes, custom keyframe animations, glass effects)
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Network Requests:** Axios with HTTP interceptors

### Backend
- **Environment:** Node.js 24+
- **Framework:** Express.js
- **Database:** Native `node:sqlite` (Replaced better-sqlite3 for smoother cross-platform deployment)
- **Security:** `bcryptjs` for password hashing, `jsonwebtoken` for secure JWT-based sessions.

## ⚙️ Configuration & Customization

- **Monthly Budget:** The default budget is ₹30,000, which users can securely modify inline directly from the Dashboard.
- **Currency:** Formatted universally in INR (₹). You can easily change this by tweaking the `formatINR` helper functions found across the components.
- **Environment Variables:** For deployment, ensure you assign a strong, secure value to `JWT_SECRET` in your backend rather than falling back on the development default.
