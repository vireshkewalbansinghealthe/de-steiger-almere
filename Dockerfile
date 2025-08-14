# Use the official Node.js 18 image
FROM node:18-alpine

# Install dependencies for better compatibility
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for development)
RUN npm ci

# Copy all source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port 3000
EXPOSE 3000

# Use npm run dev for development mode (like Coolify expects)
CMD ["npm", "run", "dev"]
