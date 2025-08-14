# Fresh Dockerfile for development mode - Force rebuild
FROM node:18-alpine

# Add a unique layer to bust cache
RUN echo "Build timestamp: $(date)" > /build-info.txt

# Install dependencies for better compatibility
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Run in development mode
CMD ["npm", "run", "dev"]