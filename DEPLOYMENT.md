# Unity Units - Deployment Guide

## Docker & Coolify Deployment

This guide covers deploying Unity Units using Docker and Coolify with proper cross-origin request handling.

### 🚀 Quick Start

#### 1. Environment Setup

Copy the environment template:
```bash
cp docker.env.example .env
```

Fill in your environment variables in `.env`:
- Supabase credentials
- Stripe API keys
- Domain URL
- Other configuration values

#### 2. Development Deployment

For local development with Docker:
```bash
docker-compose up -d
```

#### 3. Production Deployment

For production deployment with optimized build:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 🔧 Coolify Deployment

#### Option 1: Using coolify.yaml
1. Push your code to a Git repository
2. In Coolify, create a new application
3. Point it to your repository
4. Coolify will automatically detect the `coolify.yaml` file
5. Set your environment variables in Coolify dashboard
6. Deploy!

#### Option 2: Manual Configuration
1. Create a new Docker application in Coolify
2. Use the production Dockerfile: `Dockerfile.production`
3. Set environment variables in Coolify
4. Configure domain and SSL
5. Deploy

### 🌐 Cross-Origin Configuration

The application is now configured to handle cross-origin requests properly:

#### Next.js Configuration (`next.config.js`)
- Added `allowedDevOrigins` for development
- CORS headers for all routes
- Standalone output for production builds

#### Docker Configuration
- Network configuration for service communication
- All necessary environment variables
- Health checks for reliability

#### Nginx Configuration (`nginx.conf`)
- CORS headers for static assets
- Proper proxy configuration
- Security headers
- OPTIONS request handling

### 📋 Environment Variables

Required environment variables for deployment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ACCESS_TOKEN=your_supabase_access_token

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
HOSTNAME=0.0.0.0
```

### 🔍 Troubleshooting

#### Cross-Origin Issues
If you see warnings about cross-origin requests:
1. Check that `allowedDevOrigins` includes your IP/domain
2. Verify CORS headers are properly set
3. Ensure nginx configuration includes CORS headers

#### Build Issues
1. Make sure all environment variables are set
2. Check that the build process completes successfully
3. Verify static assets are properly copied

#### Network Issues
1. Check Docker network configuration
2. Verify port mappings
3. Ensure health checks are passing

### 📁 File Structure

```
unity-units-clone/
├── Dockerfile              # Development Docker image
├── Dockerfile.production   # Production optimized image
├── docker-compose.yml      # Docker Compose configuration
├── coolify.yaml            # Coolify deployment configuration
├── nginx.conf              # Nginx reverse proxy configuration
├── docker.env.example      # Environment variables template
├── next.config.js          # Next.js configuration with CORS
└── DEPLOYMENT.md           # This file
```

### 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Domain name configured
- [ ] SSL certificate configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Email templates configured
- [ ] Health checks passing
- [ ] CORS headers working
- [ ] Static assets loading properly

### 📞 Support

For deployment issues, check:
1. Application logs in Coolify dashboard
2. Docker container logs
3. Nginx access/error logs
4. Network connectivity between services


