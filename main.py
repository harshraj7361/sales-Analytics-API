
# FastAPI application aur dependency injection ke tools
from fastapi import FastAPI, Depends, HTTPException

# SQLAlchemy database session ka type
from sqlalchemy.orm import Session

# Database session aur engine
from database import SessionLocal, engine, Base

# Product ka database model
from models import Product

# Request aur response ke Pydantic schemas
from schemas import ProductCreate, ProductResponse,ProductUpdate


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