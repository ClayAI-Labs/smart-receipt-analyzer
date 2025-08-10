# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set work directory
WORKDIR /app

# Install system dependencies for OCR & PDF support
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    poppler-utils \
    libgl1 \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app (monorepo friendly)
COPY ./app ./app

# Expose port for Cloud Run
EXPOSE 8080

# Run the FastAPI app with Uvicorn

# For Render/Railway
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
# For Cloud Run
CMD uvicorn app.main:app --host 0.0.0.0 --port 8080