
# Database columns aur unke data types define karne ke liye import
from sqlalchemy import Column, Integer, String, Numeric

# Database.py se Base class import kar rahe hain
from database import Base


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
