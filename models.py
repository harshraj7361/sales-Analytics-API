
# Database columns aur unke data types define karne ke liye import
from sqlalchemy import Column, Integer, String, Numeric,ForeignKey, CheckConstraint,DateTime

# Database.py se Base class import kar rahe hain
from database import Base
from datetime import datetime

# Product class PostgreSQL ki products table ko represent karti hai
class Product(Base):

    # Database mein table ka naam
    __tablename__ = "products"

    # Har product ki unique ID; primary key aur indexed column
    product_id = Column(Integer, primary_key=True, index=True)

    # Product ka naam; maximum 50 characters aur required field
    product_name = Column(String(50), nullable=False)

    # Product ki price; total 10 digits, jismein 2 decimal places ho sakti hain
    price = Column(Numeric(10, 2), nullable=False)

    # Available stock ki quantity; required integer value
    stock = Column(Integer, nullable=False)

class Sale(Base):

    __tablename__ = "sales"

    sale_id = Column(Integer,primary_key=True,index=True)

    product_id = Column(Integer,ForeignKey("products.product_id"),index=True,nullable=False)

    quantity = Column(Integer,nullable=False)

    selling_price = Column(Numeric(10,2),nullable=False)

  
    sale_date = Column(DateTime, default=datetime.now, nullable=False)

       # Database-level validation
    __table_args__ = (
        CheckConstraint("quantity >= 1", name="check_sale_quantity"),
        CheckConstraint("selling_price > 0", name="check_selling_price"),
    )