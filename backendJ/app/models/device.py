from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.datetime import now_jakarta


class Device(Base):
    __tablename__ = "devices"

    id = Column(String(50), primary_key=True, index=True)  # e.g., "roof-001"
    name = Column(String(100), nullable=False, default="Atap Jemuran Utama")
    device_type = Column(String(50), nullable=False, default="roof")
    is_simulation = Column(Boolean, default=False, nullable=False)
    # open, closed, opening, closing, unknown
    roof_status = Column(String(20), default="closed", nullable=False)
    # auto, manual
    mode = Column(String(20), default="auto", nullable=False)
    last_heartbeat = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=now_jakarta, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=now_jakarta, onupdate=now_jakarta, nullable=False)

    sensor_readings = relationship("SensorReading", back_populates="device", cascade="all, delete-orphan")
    commands = relationship("DeviceCommand", back_populates="device", cascade="all, delete-orphan")
    activities = relationship("RoofActivity", back_populates="device", cascade="all, delete-orphan")
