
# Pydantic se data validation ke liye BaseModel import kar rahe hain
from pydantic import BaseModel, Field


# Product create karte waqt client se aane wale data ka format
class ProductCreate(BaseModel):
    # Product ka naam required hai aur maximum 50 characters ka hoga
    product_name: str = Field(..., min_length=1, max_length=50)

    # Price decimal mein ho sakti hai, jaise 199.99
    price: float = Field(..., gt=0)

    # Stock sirf integer hoga aur negative nahi ho sakta
    stock: int = Field(..., ge=0)

class ProductUpdate(BaseModel):
    product_name: str | None= Field(None, min_length=1, max_length=50)
    price: float | None=Field(default=None, gt=0)
    stock: int | None=Field(default=None, ge=0)


# API response mein product ki ID bhi return hogi
class ProductResponse(ProductCreate):
    # Database se generate hone wali unique product ID
    product_id: int

    # Pydantic ko SQLAlchemy model objects se data read karne deta hai
    model_config = {"from_attributes": True}
