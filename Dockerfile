# Use Node.js 22 as the base image
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite application and esbuild server
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Only copy the built artifacts and production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built dist directory containing the frontend and server.cjs
COPY --from=builder /app/dist ./dist

# Expose the port (Cloud Run sets PORT, which defaults to 8080)
EXPOSE 8080

# Start the application
CMD ["node", "dist/server.cjs"]
