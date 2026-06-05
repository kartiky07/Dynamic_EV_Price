# VoltOptimizer: AI-Powered EV Dynamic Tariff Optimization Platform

VoltOptimizer is a modern, full-stack web application designed to optimize electric vehicle (EV) charging tariffs dynamically. By leveraging machine learning (LightGBM) to predict real-time charging demand (kWh delivered), the platform automatically calculates optimal dynamic pricing to balance grid load, maximize station utilization, and boost charging operators' revenues.

---

## 🚀 Key Features

*   **AI Demand Prediction Engine**: Uses a trained **LightGBM Regressor** to analyze session parameters (hour of day, month, weekend status, charging duration, idle ratio) and predict exact battery charge requirements.
*   **Dynamic Tariff Optimization**: Automatically classifies grid load into **Surge**, **Normal**, or **Discount** pricing brackets, adjusting charging rates to incentivize off-peak usage.
*   **Live Analytics Dashboard**: Visualizes hourly load profiles, congestion distributions, and revenue gains (averaging **2.16%** increase) using interactive charts.
*   **Interactive Pricing Simulator**: Simulates base rates, grid congestion, and station utilization factors to project revenue impact.
*   **AI Operations & Monitoring Agent**: Real-time tracking of system health, database connections, grid anomalies, and autonomous operational recommendations.

---

## 🛠️ Technology Stack

### Backend
*   **Framework**: FastAPI (Python 3.12)
*   **Database**: SQLite with SQLAlchemy ORM
*   **Machine Learning**: LightGBM, Scikit-Learn, Joblib, Pandas, NumPy
*   **Server**: Uvicorn (with live reload)

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS & Modern Glassmorphism UI
*   **Charts**: Recharts (interactive SVG charts)
*   **Animations**: Framer Motion for premium micro-interactions

---

## 📦 Project Structure

```bash
SocBiz_Analyst/
├── backend/
│   ├── main.py            # FastAPI main application & API endpoints
│   ├── database.py        # SQLite database connection & seeding logic
│   └── requirements.txt   # Python dependency list
├── frontend/
│   ├── src/
│   │   ├── pages/         # Landing, Dashboard, Prediction, Simulator, Monitoring pages
│   │   ├── App.jsx        # Main router and navigation layout
│   │   └── index.css      # Core styles & Tailwind directives
│   ├── package.json       # Node dependency list
│   └── vite.config.js     # Frontend server configuration
├── models/
│   ├── train_model.py     # Script to generate synthetic data & train the model
│   └── lightgbm_ev_model.pkl # Trained LightGBM model binary
└── README.md              # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
*   Python 3.12+
*   Node.js 18+

### 1. Backend Setup & Run

1.  Navigate to the project directory:
    ```bash
    cd backend
    ```
2.  Activate the virtual environment:
    ```bash
    source ../venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the FastAPI server:
    ```bash
    python -u -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
    ```
    *Note: On first startup, the backend automatically initializes and seeds `ev_dashboard.db` with 150 historical charging sessions scaled to exactly **2.16%** revenue gain.*

### 2. Frontend Setup & Run

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to: `http://localhost:5173/`

---

## 📊 ML Model Training

To retrain or evaluate the prediction model:
1.  Navigate to the `models` directory.
2.  Run the training script:
    ```bash
    python train_model.py
    ```
    This script will:
    *   Synthesize 8,000 EV charging records with realistic demand factors.
    *   Train a `LightGBM Regressor` (with a `RandomForestRegressor` fallback).
    *   Export the finalized model to `models/lightgbm_ev_model.pkl`.

---

## 📜 License

This project is licensed under the MIT License.
