FROM python:3.11-slim

# Create a non-root user (HuggingFace Spaces requirement)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install dependencies first (caching layer)
COPY --chown=user backend/requirements.txt $HOME/app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY --chown=user backend/ $HOME/app/backend/

# For a production/Space deployment, the model checkpoint should ideally 
# be loaded from the HuggingFace Hub rather than checked in, though 
# standard `facebook/bart-large-cnn` will be pulled at runtime if specified.
# Any local checkpoints placed in `backend/checkpoints/` will be copied here.

# Expose port (HF Spaces defaults to 7860)
EXPOSE 7860

# Command to run FastAPI
# Note: In huggingface spaces, we tell uvicorn to run on port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860", "--proxy-headers"]
