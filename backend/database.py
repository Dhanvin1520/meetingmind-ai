import logging
from datetime import datetime, timezone
from typing import Optional
import motor.motor_asyncio
from bson import ObjectId
from pydantic_settings import BaseSettings
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    mongo_uri: str = 'mongodb://localhost:27017'
    mongo_db_name: str = 'meetingmind'
    model_checkpoint: str = './checkpoints/bart-meeting/final'
    allowed_origins: str = 'http://localhost:5173,chrome-extension://'
    host: str = '0.0.0.0'
    port: int = 8000

    class Config:
        env_file = '.env'
settings = Settings()
_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
_db: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None

async def connect_db():
    global _client, _db
    logger.info(f'Connecting to MongoDB: {settings.mongo_uri}')
    _client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongo_uri)
    _db = _client[settings.mongo_db_name]
    await _db.sessions.create_index('session_id', unique=True)
    await _db.transcripts.create_index('session_id')
    await _db.transcripts.create_index([('session_id', 1), ('chunk_index', 1)], unique=True)
    logger.info('MongoDB connected.')

async def close_db():
    global _client
    if _client:
        _client.close()
        logger.info('MongoDB connection closed.')

def get_db():
    return _db

async def create_session(session_id: str, meeting_title: str, participant_names: list[str]) -> dict:
    doc = {'session_id': session_id, 'meeting_title': meeting_title, 'participant_names': participant_names, 'started_at': datetime.now(timezone.utc), 'status': 'recording', 'summary': None}
    await _db.sessions.insert_one(doc)
    return doc

async def get_session(session_id: str) -> Optional[dict]:
    return await _db.sessions.find_one({'session_id': session_id}, {'_id': 0})

async def update_session_status(session_id: str, status: str):
    await _db.sessions.update_one({'session_id': session_id}, {'$set': {'status': status}})

async def store_summary_in_session(session_id: str, summary_doc: dict):
    await _db.sessions.update_one({'session_id': session_id}, {'$set': {'status': 'summarised', 'summary': summary_doc}})

async def append_transcript_chunk(session_id: str, chunk_index: int, text: str, timestamp_start: float, timestamp_end: float):
    doc = {'session_id': session_id, 'chunk_index': chunk_index, 'text': text, 'timestamp_start': timestamp_start, 'timestamp_end': timestamp_end, 'created_at': datetime.now(timezone.utc)}
    await _db.transcripts.insert_one(doc)
    return doc

async def get_full_transcript(session_id: str) -> str:
    cursor = _db.transcripts.find({'session_id': session_id}, {'_id': 0, 'text': 1, 'chunk_index': 1}).sort('chunk_index', 1)
    chunks = await cursor.to_list(length=None)
    return ' '.join((c['text'] for c in chunks))

async def count_chunks(session_id: str) -> int:
    return await _db.transcripts.count_documents({'session_id': session_id})

async def get_total_duration(session_id: str) -> float:
    cursor = _db.transcripts.find({'session_id': session_id}, {'_id': 0, 'timestamp_end': 1}).sort('chunk_index', -1).limit(1)
    last = await cursor.to_list(length=1)
    return last[0]['timestamp_end'] if last else 0.0