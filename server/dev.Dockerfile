# Use Node.js 22 Alpine as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies including dev dependencies
RUN pnpm install

# Copy source code
COPY . .

# Start the development application
CMD ["pnpm", "run", "dev"] 