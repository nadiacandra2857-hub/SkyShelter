from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class CommandRequest(BaseModel):
    command: Literal["open", "close"] = Field(..., description="Perintah atap: open atau close")


class ModeUpdateRequest(BaseModel):
    mode: Literal["auto", "manual"] = Field(..., description="Mode operasi atap: auto atau manual")


class CommandResponse(BaseModel):
    command_id: str
    device_id: str
    command: str
    mode: Optional[str] = None
    status: Literal["pending", "accepted", "succeeded", "failed", "timeout"]
    detail: Optional[str] = None
    issued_at: datetime
    executed_at: Optional[datetime] = None


class ModeUpdateResponse(BaseModel):
    device_id: str
    mode: Literal["auto", "manual"]
    message: str
    updated_at: datetime
