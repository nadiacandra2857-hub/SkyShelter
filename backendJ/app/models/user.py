from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.datetime import now_jakarta


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_jakarta, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=now_jakarta, onupdate=now_jakarta, nullable=False)

    commands = relationship("DeviceCommand", back_populates="user", cascade="all, delete-orphan")
