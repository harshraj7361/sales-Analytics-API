
# SQLAlchemy se database engine banane ka function import kar rahe hain
from sqlalchemy import create_engine, text

# Database sessions aur model base banane ke tools import kar rahe hain
from sqlalchemy.orm import sessionmaker, declarative_base


# PostgreSQL database ka connection URL
# Format: driver://username:password@host:port/database_name
# Password mein special characters hon toh unhe URL-encode karna pad sakta hai
DATABASE_URL = "postgresql+psycopg://postgres:harsh%402005@localhost:5432/sales_analytics"


# Engine database connections ko manage karta hai
engine = create_engine(DATABASE_URL)


# Har API request ke liye database session banane mein use hoga
SessionLocal = sessionmaker(
    bind=engine  # Session ko hamare PostgreSQL engine se connect karta hai
)


# Is Base class ko inherit karke hum database models banayenge
Base = declarative_base()


# Connection test: actual database query chala kar connection verify karte hain
if __name__ == "__main__":
    try:
        # Engine se database connection open kar rahe hain
        with engine.connect() as connection:

            # PostgreSQL ka version mangne wali SQL query execute kar rahe hain
            result = connection.execute(text("SELECT version()"))

            # Connection successful hone par confirmation print hoga
            print("PostgreSQL connected successfully!")

            # Query ka result terminal mein dikhayenge
            print(result.fetchone()[0])

    except Exception as e:
        # Connection fail ho toh error ka reason dikhayenge
        print("Connection failed:", e)
