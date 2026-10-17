import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.utils.datetime import now_jakarta


class DeviceCommand(Base):
    __tablename__ = "device_commands"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    command = Column(String(20), nullable=False)  # "open", "close", "stop"
    mode = Column(String(20), nullable=True)  # "auto", "manual"
    source = Column(String(50), nullable=False, default="manual_web")  # "manual_web", "auto_rain", "auto_early_close"
    status = Column(String(20), nullable=False, default="pending")  # "pending", "accepted", "succeeded", "failed", "timeout"
    detail = Column(Text, nullable=True)
    
    issued_at = Column(DateTime(timezone=True), default=now_jakarta, nullable=False, index=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)

    device = relationship("Device", back_populates="commands")
    user = relationship("User", back_populates="commands")


class RoofActivity(Base):
    __tablename__ = "roof_activities"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # "roof_open", "roof_close", "mode_change", "early_close_triggered", "rain_alert", "command_executed"
    event_type = Column(String(50), nullable=False, index=True)
    # "user", "rain_sensor", "early_close_forecast", "system"
    source = Column(String(50), nullable=False, index=True)
    cause = Column(String(255), nullable=False)
    # "succeeded", "failed", "blocked_by_safety"
    result = Column(String(50), nullable=False, default="succeeded")
    
    created_at = Column(DateTime(timezone=True), default=now_jakarta, nullable=False, index=True)

    device = relationship("Device", back_populates="activities")

    __table_args__ = (
        Index("idx_activity_device_created", "device_id", "created_at"),
    )
