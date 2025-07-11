# Project description

This is a full-stack authentication demonstration project built with modern web technologies. The application showcases both stateless (JWT-based) and stateful (session-based) authentication patterns, providing developers with practical examples of different authentication strategies. Also it uses secure way of storing passwords with salt and hash.

# 🚧 STILL IN WORK

- whole frontend
- authentications
  - statefull (simple and with refresh token)
  - stateless with session
- final prisma models
- production build and dockerization

## What is going on 🤓

1. **Statless basic**

<img src="./images/stateless-simple.png" width="700" height="600" />

2. **Stateless With refresh token**
3. **Statefull**

## Tech Stack

### Frontend

- **React** - Modern UI library for building interactive user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience

### Backend

- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast and minimalist web framework
- **TypeScript** - Type-safe server-side development
- **Prisma/Postgres** - ORM and database

Libraries:

- cookie-parser - for parsing cookies
- jsonwebtoken - for tokens
- bycrypt - for salting

### Infrastructure

- **Docker** - Containerization for consistent development and deployment`
- **Docker Compose** - Multi-container orchestration for easy setup`

## Features

- **Stateless Authentication**: JWT-based authentication for scalable, distributed applications, with one token and with refresh token
- **Stateful Authentication**: Session-based authentication with server-side session management
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Database Integration**: Prisma ORM for efficient database operations
- **Containerized Environment**: Docker setup for easy development and deployment

## Quick Start

### Setup env variables

Two files:

- .env.development
- .env.production

Content:

```bash
# development
# Server port
PORT=3000
# Server env
NODE_ENV=development
# Local dockerized db url, database container port and domain
DATABASE_URL="postgres://exampleuser:examplepassword@database:5432/authentications"
# Custom db password
POSTGRES_PASSWORD=examplepassword
# Custom db user
POSTGRES_USER=exampleuser
# Custom database
POSTGRES_DB=authentications
# jwt secret which is used to sign jwt token, generate your own
JWT_SECRET=some_secret

# production
PORT=8080
NODE_ENV=production
```

### Start application

```bash
docker compose up -d
```

### Database

- database is postgres
- docker will automatically create db migration on initial start to setup all models

**NOTICE**

- database will be reset each time docker compose is run this is intentional and for test/showcase purposes only

To access db from outside run on your host machine

```bash
psql postgres://exampleuser:examplepassword@localhost:5430/authentications
```

### **Usage**

- Three modes:
  - "stateless_simple" - only long lasting token which is sent via cookie and checked on each request
  - "stateless_refresh" - refresh and access (short lived token)
  - "statefull" - session
