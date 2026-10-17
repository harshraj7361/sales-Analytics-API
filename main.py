
# FastAPI application aur dependency injection ke tools
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# SQLAlchemy database session ka type
from sqlalchemy.orm import Session

# Database session aur engine
from database import SessionLocal, engine, Base

# Product ka database model
from models import Product,Sale

# Request aur response ke Pydantic schemas
from schemas import ProductCreate, ProductResponse,ProductUpdate,SaleCreate
from sqlalchemy import func

import pandas as pd
import numpy as np

# FastAPI application create karna
app = FastAPI(title="Sales Analytics API")


# Enable CORS for frontend applications (e.g. Vite on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.get("/products/{product_id}")
def get_product(product_id: int,
                 
    db: Session = Depends(get_db)
):
    products = db.query(Product).filter(Product.product_id==product_id).first()
    if products is None:
        raise HTTPException(
    status_code=404,
    detail="Product not found"
)
    
    return products

@app.patch("/products/{product_id}")
def update_data(product_id:int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)

):
    products = db.query(Product).filter(Product.product_id==product_id).first()

    if products is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"

)
    updated_data = product_data.model_dump(exclude_unset=True)

   

 # Har field aur uski value ko ek-ek karke process karna

    for field, value in updated_data.items():
        setattr(products, field, value)

    db.commit()

    db.refresh(products)

        
        
    return products

@app.delete("/delete/{product_id}")
def delete_stock(product_id: int,
    db : Session = Depends(get_db)

):
    products = db.query(Product).filter(Product.product_id==product_id).first()

    if products is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"

)
    db.delete(products)
    db.commit()

    return {"message": "Product deleted successfully"}

@app.post("/sales")
def sale_create(sale:SaleCreate,
    db : Session = Depends(get_db)
                
):
    products = db.query(Product).filter(Product.product_id==sale.product_id).first()
    if products is None:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
    
)
    
    if products.stock < sale.quantity:
        raise HTTPException(
        status_code=400,
        detail="Insufficient stock"
    )
    try:
        products.stock = products.stock - sale.quantity
        
        new_sale = Sale(
        product_id = sale.product_id,
        quantity = sale.quantity,
        selling_price = sale.selling_price
        )
        db.add(new_sale)
        db.commit()

        db.refresh(new_sale)

        return new_sale
    except Exception:
        db.rollback()

        raise
    

# Total sales revenue calculate karne ke liye API
@app.get("/analytics/revenue")
def get_total_revenue(db: Session = Depends(get_db)):

    # Har sale ka quantity * selling_price calculate karke
    # sabhi sales ka total nikalna
    total_revenue = db.query(
        func.sum(Sale.quantity * Sale.selling_price)
    ).scalar()

    # Agar abhi koi sale nahi hui hai toh revenue 0 hoga
    if total_revenue is None:
        total_revenue = 0

    # Total revenue response mein return karo
    return {
        "total_revenue": float(total_revenue)
    }



# Pandas se sales report generate karne wali API
@app.get("/analytics/sales-report")
def get_sales_report(db: Session = Depends(get_db)):

    # Database se saare sales records fetch karo
    sales = db.query(Sale).all()

    # Agar koi sale nahi hui hai, toh empty report return karo
    if not sales:
        return {
            "total_sales": 0,
            "total_quantity_sold": 0,
            "total_revenue": 0.0,
            "average_selling_price": 0.0
        }

    # SQLAlchemy objects se Pandas DataFrame banao
    df = pd.DataFrame([
        {
            "sale_id": sale.sale_id,
            "quantity": sale.quantity,
            "selling_price": float(sale.selling_price)
        }
        for sale in sales
    ])

    # Har sale ka revenue calculate karo
    df["revenue"] = df["quantity"] * df["selling_price"]

    # Pandas se report ke statistics calculate karo
    total_sales = len(df)
    total_quantity_sold = int(df["quantity"].sum())
    total_revenue = float(df["revenue"].sum())
    average_selling_price = float(df["selling_price"].mean())

    # Report JSON format mein return karo
    return {
        "total_sales": total_sales,
        "total_quantity_sold": total_quantity_sold,
        "total_revenue": round(total_revenue, 2),
        "average_selling_price": round(average_selling_price, 2)
    }


# NumPy se sales statistics calculate karne wali API
@app.get("/analytics/sales-statistics")
def get_sales_statistics(db: Session = Depends(get_db)):

    # Database se saari sales fetch karo
    sales = db.query(Sale).all()

    # Agar koi sale nahi hai, toh error ki jagah clear response do
    if not sales:
        return {
            "message": "No sales data available",
            "average_revenue": 0.0,
            "median_revenue": 0.0,
            "maximum_revenue": 0.0,
            "minimum_revenue": 0.0,
            "revenue_std_deviation": 0.0
        }

    # Har sale ka revenue calculate karo:
    # quantity multiplied by selling price
    revenues = np.array([
        float(sale.quantity * sale.selling_price)
        for sale in sales
    ])

    # NumPy se statistical calculations
    average_revenue = np.mean(revenues)
    median_revenue = np.median(revenues)
    maximum_revenue = np.max(revenues)
    minimum_revenue = np.min(revenues)
    revenue_std_deviation = np.std(revenues)

    # NumPy values ko normal Python float mein convert karke return karo
    return {
        "average_revenue": round(float(average_revenue), 2),
        "median_revenue": round(float(median_revenue), 2),
        "maximum_revenue": round(float(maximum_revenue), 2),
        "minimum_revenue": round(float(minimum_revenue), 2),
        "revenue_std_deviation": round(
            float(revenue_std_deviation), 2
        )
    }
