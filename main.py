
# FastAPI application aur dependency injection ke tools
from fastapi import FastAPI, Depends, HTTPException

# SQLAlchemy database session ka type
from sqlalchemy.orm import Session

# Database session aur engine
from database import SessionLocal, engine, Base

# Product ka database model
from models import Product

# Request aur response ke Pydantic schemas
from schemas import ProductCreate, ProductResponse


# FastAPI application create karna
app = FastAPI(title="Sales Analytics API")


# Model ke basis par missing tables create karega
# Existing table ke columns ko automatically modify nahi karega
Base.metadata.create_all(bind=engine)


# Har request ko database session dene ke liye function
def get_db():
    db = SessionLocal()
    try:
        # Endpoint ko database session provide karna
        yield db
    finally:
        # Request complete hone par session close karna
        db.close()


# API check karne ke liye basic endpoint
@app.get("/")
def home():
    return {"message": "Sales Analytics API is running"}


# Naya product database mein add karne ka endpoint
@app.post("/products", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    # Validated request data se SQLAlchemy object banana
    new_product = Product(
        product_name=product_data.product_name,
        price=product_data.price,
        stock=product_data.stock
    )

    # Product ko database session mein add karna
    db.add(new_product)

    # Database mein changes save karna
    db.commit()

    # Database se generated ID jaise values object mein lana
    db.refresh(new_product)

    # Product ko response schema ke format mein return karna
    return new_product


@app.get("/products")
def get_products(
    db: Session = Depends(get_db)
):

    # Database se products table ke saare records fetch karna
    products = db.query(Product).all()

    return products



