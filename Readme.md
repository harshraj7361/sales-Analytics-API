# Sales Analytics Dashboard

A full-stack sales management and analytics project built using FastAPI, PostgreSQL, React, Pandas, and NumPy.

## Features

- Product management (Create, Read, Update, Delete)
- Sales recording with automatic stock reduction
- PostgreSQL database integration using SQLAlchemy
- Total revenue calculation
- Pandas-based sales reports
- NumPy-based sales statistics
- React frontend dashboard
- REST API documentation using Swagger UI

## Tech Stack

- **Backend:** Python, FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Data Analysis:** Pandas, NumPy
- **Frontend:** React, JavaScript, Vite
- **API Testing:** Swagger UI

## Project Structure

```text
sales-analytics-api/
├── frontend/
├── main.py
├── models.py
├── schemas.py
├── database.py
├── requirements.txt
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd sales-analytics-api
```

### 2. Set Up the Backend

Create a virtual environment:

```powershell
python -m venv myenv
.\myenv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

Create a PostgreSQL database and configure the database connection in your project.

Keep database passwords and other secrets out of GitHub.

### 4. Run the Backend

```powershell
uvicorn main:app --reload
```

Backend URL: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 5. Run the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

Ensure the frontend API URL points to the running FastAPI backend.

## Analytics

The application provides sales revenue reports and statistical analysis using Pandas and NumPy.

## Future Improvements

- Add automated tests
- Add user authentication
- Add product-wise and monthly sales analysis
- Deploy the frontend and backend
- Improve error handling and security

## Author

Harsh Raj

---

Built as a learning project to practice full-stack development, REST APIs, database management, and data analytics.