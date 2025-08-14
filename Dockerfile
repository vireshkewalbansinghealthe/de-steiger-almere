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

# Copy source code (including public directory with images)
COPY . .

# Ensure public directory permissions are correct
RUN chmod -R 755 public/

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3000

# Run in development mode with host binding
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]