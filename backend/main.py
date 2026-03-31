import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import settings, connect_db, close_db
from backend.model import SummarisationModel
from backend.routes import session, transcript, summary
# Configure standard logging format for the API
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s — %(message)s')
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('=== MeetingMind API starting up ===')
    await connect_db()
    checkpoint = settings.model_checkpoint
    logger.info(f'Loading model checkpoint: {checkpoint}')
    app.state.model = SummarisationModel.get_instance(checkpoint)
    app.state.checkpoint_path = checkpoint
    logger.info('=== Startup complete — ready to serve requests ===')
    yield
    logger.info('=== MeetingMind API shutting down ===')
    await close_db()
app = FastAPI(title='MeetingMind API', description='Self-hosted meeting summarisation API backed by a fine-tuned BART model. No external LLM APIs.', version='1.0.0', lifespan=lifespan)
origins = [o.strip() for o in settings.allowed_origins.split(',') if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(session.router)
app.include_router(transcript.router)
app.include_router(summary.router)

@app.get('/health', tags=['health'])
async def health():
    return {'status': 'ok', 'model_checkpoint': app.state.checkpoint_path, 'model_loaded': app.state.model is not None}
if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host=settings.host, port=settings.port, reload=True, log_level='info')