# Sales Analytics Dashboard - React Frontend

A beginner-friendly React + Vite frontend for the Sales Analytics FastAPI & PostgreSQL backend.

## Tech Stack
- **Framework**: React 18 + Vite 5
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: Clean, semantic Vanilla CSS (no complex CSS frameworks required)

---

## Backend API Route Mapping
All frontend features interact with existing backend routes from `main.py`:

| Section | Feature | HTTP Method | Backend Route | Request / Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| **Global** | Health Check | `GET` | `/` | Checks FastAPI server connectivity |
| **Dashboard** | Total Revenue | `GET` | `/analytics/revenue` | `{"total_revenue": float}` |
| **Dashboard** | Sales Summary | `GET` | `/analytics/sales-report` | Pandas computed sales statistics |
| **Dashboard** | Distribution Stats | `GET` | `/analytics/sales-statistics`| NumPy revenue distribution |
| **Products** | List Products | `GET` | `/products` | List of `ProductResponse` objects |
| **Products** | Get Product | `GET` | `/products/{product_id}` | Single `ProductResponse` |
| **Products** | Add Product | `POST` | `/products` | Body: `ProductCreate` (`product_name`, `price`, `stock`) |
| **Products** | Edit Product | `PATCH`| `/products/{product_id}`| Body: `ProductUpdate` |
| **Products** | Delete Product | `DELETE`| `/delete/{product_id}` | Deletes product from database |
| **Sales** | Record Sale | `POST` | `/sales` | Body: `SaleCreate` (`product_id`, `quantity`, `selling_price`) |
| **Analytics** | Pandas Report | `GET` | `/analytics/sales-report` | `total_sales`, `total_quantity_sold`, `total_revenue`, `average_selling_price` |
| **Analytics** | NumPy Stats | `GET` | `/analytics/sales-statistics`| `average_revenue`, `median_revenue`, `maximum_revenue`, `minimum_revenue`, `revenue_std_deviation` |

---

## Getting Started

### 1. Prerequisites
Ensure your FastAPI backend is running:
```bash
# In the project root directory
uvicorn main:app --reload --port 8000
```
Backend will be available at `http://127.0.0.1:8000`.

### 2. Configure Environment Variable
In `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### 3. Install Dependencies
```bash
cd frontend
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
```
Build output is saved to `frontend/dist/`.
