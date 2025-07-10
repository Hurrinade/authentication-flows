# Authentication Server

A Node.js Express server with TypeScript for authentication handling.

## Docker Setup

### Production Build

To run the server in production mode:

```bash
# Build and start the production container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Development Build

To run the server in development mode with hot reloading:

```bash
# Build and start the development container
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

### Useful Commands

```bash
# Stop all containers
docker-compose down

# View logs
docker-compose logs -f server

# Rebuild without cache
docker-compose build --no-cache

# Access container shell
docker-compose exec server sh
```

## Local Development

If you prefer to run the server locally without Docker:

```bash
# Install dependencies
cd server
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## API Endpoints

- `GET /` - Health check
- `GET /api/v1/*` - Authentication routes

The server runs on port 3000 by default.
