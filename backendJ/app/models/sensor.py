from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.datetime import now_jakarta


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Hujan: true jika basah, false jika kering
    rain_detected = Column(Boolean, default=False, nullable=False, index=True)
    # "dry", "rain_detected", "unknown"
    rain_status = Column(String(20), default="dry", nullable=False)
    rain_analog_value = Column(Float, nullable=True)  # nilai ADC dari sensor hujan
    
    # Cahaya / LDR
    # "bright", "dark", "unknown"
    light_status = Column(String(20), default="bright", nullable=True)
    light_lux = Column(Float, nullable=True)
    
    # Sensor lingkungan opsional (misal DHT22 jika terpasang)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    
    recorded_at = Column(DateTime(timezone=True), default=now_jakarta, nullable=False, index=True)

    device = relationship("Device", back_populates="sensor_readings")

    __table_args__ = (
        Index("idx_device_recorded", "device_id", "recorded_at"),
    )
