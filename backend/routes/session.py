import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from backend.database import create_session, get_session, update_session_status
from backend.schemas import SessionCreate, SessionResponse
router = APIRouter(prefix='/session', tags=['session'])
logger = logging.getLogger(__name__)

@router.post('/start', response_model=SessionResponse, status_code=201)
async def start_session(body: SessionCreate):
    session_id = str(uuid.uuid4())
    doc = await create_session(session_id=session_id, meeting_title=body.meeting_title, participant_names=body.participant_names or [])
    logger.info(f"Session started: {session_id} — '{body.meeting_title}'")
    return SessionResponse(session_id=doc['session_id'], meeting_title=doc['meeting_title'], participant_names=doc['participant_names'], started_at=doc['started_at'], status=doc['status'])

@router.get('/{session_id}', response_model=SessionResponse)
async def get_session_details(session_id: str):
    doc = await get_session(session_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return SessionResponse(**{k: doc[k] for k in SessionResponse.model_fields if k in doc})

@router.post('/{session_id}/stop')
async def stop_session(session_id: str):
    doc = await get_session(session_id)
    if not doc:
        raise HTTPException(status_code=404, detail='Session not found')
    await update_session_status(session_id, 'stopped')
    return {'session_id': session_id, 'status': 'stopped'}