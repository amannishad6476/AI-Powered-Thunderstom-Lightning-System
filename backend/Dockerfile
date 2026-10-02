# ==============================================================================
# Stage 1: Build Environment & Geospatial Compilers
# ==============================================================================
FROM python:3.10-slim-bullseye AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DEFAULT_TIMEOUT=120

WORKDIR /build

# Install system compilation toolchain and C/C++ geospatial dev libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    cmake \
    pkg-config \
    libpq-dev \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    libspatialindex-dev \
    libnetcdf-dev \
    libhdf5-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment for clean multi-stage extraction
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade core packaging tools
RUN pip install --upgrade pip setuptools wheel

# Install PyTorch CPU wheel first (avoids multi-gigabyte CUDA bloat for lean production deployment)
RUN pip install --no-cache-dir torch>=2.2.0 torchvision>=0.17.0 --index-url https://download.pytorch.org/whl/cpu

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# ==============================================================================
# Stage 2: Production Runtime Image (Slim & Hardened)
# ==============================================================================
FROM python:3.10-slim-bullseye AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH" \
    PROJ_LIB="/usr/share/proj" \
    GDAL_DATA="/usr/share/gdal"

WORKDIR /app

# Install only shared runtime libraries (without heavy C/C++ build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    gdal-bin \
    libgdal28 \
    libgeos-c1v5 \
    libproj19 \
    proj-data \
    libspatialindex6 \
    libnetcdf18 \
    libhdf5-103-1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy pre-compiled virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create unprivileged system user for hardened security
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

# Copy application source code
COPY --chown=appuser:appgroup . /app

# Set permissions for data and model checkpoint directories
RUN mkdir -p /app/data/radar /app/data/satellite /app/ml_pipeline/model_checkpoints && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

# Container liveness and readiness health probe
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production ASGI server launch with proxy headers for Nginx reverse proxy
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers", "--forwarded-allow-ips", "*"]
