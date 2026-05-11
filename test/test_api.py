import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database import connect_db, close_db, get_db
import uuid

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as ac:
        async with app.router.lifespan_context(app):
            yield ac

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get('/health')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'

@pytest.mark.asyncio
async def test_session_lifecycle(client):
    session_data = {'meeting_title': 'Test Meeting', 'participant_names': ['Alice', 'Bob']}
    response = await client.post('/session/start', json=session_data)
    assert response.status_code == 201
    res_data = response.json()
    session_id = res_data['session_id']
    assert res_data['meeting_title'] == 'Test Meeting'
    assert res_data['status'] == 'recording'
    response = await client.get(f'/session/{session_id}')
    assert response.status_code == 200
    assert response.json()['session_id'] == session_id
    response = await client.post(f'/session/{session_id}/stop')
    assert response.status_code == 200
    assert response.json()['status'] == 'stopped'

@pytest.mark.asyncio
async def test_transcript_append(client):
    session_response = await client.post('/session/start', json={'meeting_title': 'Transcript Test'})
    session_id = session_response.json()['session_id']
    chunk_data = {'session_id': session_id, 'chunk_index': 0, 'text': 'Hello this is a test transcript chunk.', 'timestamp_start': 0.0, 'timestamp_end': 30.0}
    response = await client.post('/transcript/chunk', json=chunk_data)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data['session_id'] == session_id
    assert res_data['chunk_index'] == 0