import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from backend.database import get_session, get_full_transcript, store_summary_in_session
from backend.schemas import SummaryRequest, SummaryResponse, ActionItem
router = APIRouter(prefix='/summary', tags=['summary'])
logger = logging.getLogger(__name__)

@router.post('/generate', response_model=SummaryResponse)
async def generate_summary(body: SummaryRequest, request: Request):
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail='Session not found')
    if session['status'] == 'summarised' and session.get('summary'):
        cached = session['summary']
        logger.info(f'Returning cached summary for {body.session_id}')
        return SummaryResponse(**cached)
    transcript = await get_full_transcript(body.session_id)
    if not transcript:
        raise HTTPException(status_code=422, detail='No transcript chunks found for this session')
    logger.info(f'Generating summary for session {body.session_id} ({len(transcript)} chars, {len(transcript.split())} words)')
    model = request.app.state.model
    result = model.generate_summary(transcript=transcript, participant_names=session.get('participant_names', []))
    checkpoint = request.app.state.checkpoint_path
    now = datetime.now(timezone.utc)
    summary_doc = {'session_id': body.session_id, 'meeting_title': session['meeting_title'], 'tldr': result['tldr'], 'summary': result['summary'], 'action_items': result['action_items'], 'key_decisions': result['key_decisions'], 'generated_at': now, 'transcript_length_chars': len(transcript), 'model_checkpoint': checkpoint}
    await store_summary_in_session(body.session_id, {**summary_doc, 'generated_at': now.isoformat()})
    action_items = [ActionItem(**item) for item in result['action_items']]
    return SummaryResponse(session_id=body.session_id, meeting_title=session['meeting_title'], tldr=result['tldr'], summary=result['summary'], action_items=action_items, key_decisions=result['key_decisions'], generated_at=now, transcript_length_chars=len(transcript), model_checkpoint=checkpoint)