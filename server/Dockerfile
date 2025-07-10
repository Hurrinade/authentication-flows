# Use Node.js 22 Alpine as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the TypeScript application
RUN pnpm run build

# Start the production application, always built project, does not depend on dist of project itself
CMD ["pnpm", "run", "prod"]