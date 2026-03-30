import logging
from fastapi import APIRouter, HTTPException
from backend.database import get_session, append_transcript_chunk, count_chunks, get_total_duration
from backend.schemas import TranscriptChunk, TranscriptChunkResponse
router = APIRouter(prefix='/transcript', tags=['transcript'])
logger = logging.getLogger(__name__)

@router.post('/chunk', response_model=TranscriptChunkResponse, status_code=201)
async def ingest_chunk(body: TranscriptChunk):
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail='Session not found')
    if session['status'] not in ('recording',):
        raise HTTPException(status_code=409, detail=f"Session is '{session['status']}' — cannot append to a stopped/summarised session")
    if not body.text.strip():
        raise HTTPException(status_code=422, detail='Chunk text is empty')
    await append_transcript_chunk(session_id=body.session_id, chunk_index=body.chunk_index, text=body.text.strip(), timestamp_start=body.timestamp_start, timestamp_end=body.timestamp_end)
    total = await count_chunks(body.session_id)
    duration = await get_total_duration(body.session_id)
    logger.info(f'Chunk {body.chunk_index} ingested for session {body.session_id} ({len(body.text)} chars, {duration:.0f}s total)')
    return TranscriptChunkResponse(session_id=body.session_id, chunk_index=body.chunk_index, total_chunks=total, total_duration_seconds=duration)