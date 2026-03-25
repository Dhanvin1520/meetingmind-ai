from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class SessionCreate(BaseModel):
    meeting_title: str = Field(..., min_length=1, max_length=256, example='Q2 Planning Sync')
    participant_names: Optional[list[str]] = Field(default=[], description='Names of meeting participants for action item attribution')

class SessionResponse(BaseModel):
    session_id: str
    meeting_title: str
    participant_names: list[str]
    started_at: datetime
    status: str

class TranscriptChunk(BaseModel):
    session_id: str
    chunk_index: int = Field(..., ge=0, description='Zero-based chunk sequence number')
    text: str = Field(..., min_length=1, description='Transcribed text for this 30-second chunk')
    timestamp_start: float = Field(..., description='Chunk start time in seconds from meeting start')
    timestamp_end: float = Field(..., description='Chunk end time in seconds from meeting start')

class TranscriptChunkResponse(BaseModel):
    session_id: str
    chunk_index: int
    total_chunks: int
    total_duration_seconds: float

class SummaryRequest(BaseModel):
    session_id: str

class ActionItem(BaseModel):
    description: str
    owner: Optional[str] = None
    due_date: Optional[str] = None

class SummaryResponse(BaseModel):
    session_id: str
    meeting_title: str
    tldr: str
    summary: str
    action_items: list[ActionItem]
    key_decisions: list[str]
    generated_at: datetime
    transcript_length_chars: int
    model_checkpoint: str