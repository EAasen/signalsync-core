# Docker Setup for SignalSync

This directory contains Docker configurations for running SignalSync in containers.

## Quick Start

### Development Mode

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start all services
docker-compose up
```

This will start:
- Web dashboard on http://localhost:3000
- Monitoring worker (background service)

### Production Mode

```bash
# Build images
docker build -f docker/Dockerfile.web -t signalsync/web:latest .
docker build -f docker/Dockerfile.worker -t signalsync/worker:latest .

# Run with production compose file
docker-compose -f docker/docker-compose.prod.yml up -d
```

## Services

### Web Dashboard
- **Port:** 3000
- **Image:** signalsync/web
- **Description:** Next.js admin interface

### Worker
- **Port:** None (background service)
- **Image:** signalsync/worker
- **Description:** Monitoring engine that executes checks

## Configuration

Environment variables are loaded from `.env` file in the root directory.

Required variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

Optional variables:
```bash
WORKER_CHECK_INTERVAL_MS=60000
WORKER_CONCURRENCY=10
LOG_LEVEL=info
```

## Building Images

### Web Dashboard
```bash
docker build -f docker/Dockerfile.web -t signalsync/web:latest .
```

### Worker
```bash
docker build -f docker/Dockerfile.worker -t signalsync/worker:latest .
```

## Running Containers

### Web Dashboard
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=xxx \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  signalsync/web:latest
```

### Worker
```bash
docker run \
  -e SUPABASE_URL=xxx \
  -e SUPABASE_SERVICE_ROLE_KEY=xxx \
  signalsync/worker:latest
```

## Volume Mounts (Development)

In development mode, source code is mounted as volumes for hot reloading:

```yaml
volumes:
  - ../apps/web:/app/apps/web
  - /app/node_modules  # Anonymous volume for node_modules
```

## Logs

View logs for a service:

```bash
# Web dashboard
docker-compose logs -f web

# Worker
docker-compose logs -f worker
```

## Troubleshooting

### Port already in use
```bash
# Stop existing containers
docker-compose down

# Or use different port
docker-compose up web -p 3001:3000
```

### Worker not running checks
1. Check worker logs: `docker-compose logs worker`
2. Verify Supabase credentials are correct
3. Ensure monitors exist in database with status 'up' or 'down'

### Build fails
```bash
# Clean build cache
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```
