# Project description

This is a full-stack authentication demonstration project built with modern web technologies. The application showcases both stateless (JWT-based) and stateful (session-based) authentication patterns, providing developers with practical examples of different authentication strategies. Also it uses secure way of storing passwords with salt and hash.

Medium in depth post: https://medium.com/@marko.uremovic00/why-skipping-authentication-basics-can-break-your-app-7515fab9271a 
Website: https://auth.rinadely.com/ 

## What is going on 🤓

1. **Statless basic**

- this is very simple aproach which serves its purpose and protects resources, but it has a problem and that is what if someone steals a token? He can access all of the data he needs and there is no way to stop him from doing it until token he has expires
- logout here is just deleting token from the cookie, but if someone else has it it does not matter

<img src="./images/stateless-simple.png" width="700" height="600" />

2. **Stateless/Statefull With refresh token (Hybrid)**

- this aproach makes this problem less effective as access token has very short time it lives, but problem still exists
- but as we store that refresh token in db they can be revoked and attack can be stoped
- also refreshing refresh token when creating new access token also is good practice as it invalids any old tokens (**refresh token rotation**)
- this is a bit expensive as database needs to be accessed frequently, also unlike sessions takes a lot of stuff to check if it is valid etc..

<img src="./images/hybrid.png" width="700" height="600" />

3. **Statefull**

- using express-sessions, when user sends initial request session is created and saved in memory (upgrade would be to use something like redis), and returend to client via cookie, each time user sends new request that session is sent and checked with memory storage, session can be updated on requests where in memory it also gets updated, when session gets destroyed user is protected as his session is not anymore in store and cannot be used for anything
- to protect routes some userId or something needs to be stored in session which is then checked on protected endpoints
- unlike token storing this uses memory and is much faster

<img src="./images/session.png" width="700" height="600" />

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

- **Stateless Authentication**: JWT-based authentication for scalable, distributed application
- **Hyrbid Authentication**: Using access and refresh token which are stored in db
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
# jwt secret which is used to sign jwt access token, generate your own
JWT_ACCESS_SECRET=some_access_secret
# session secret to sign that session
SESSION_SECRET=some_session_secret

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
