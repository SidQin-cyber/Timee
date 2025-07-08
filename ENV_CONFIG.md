# Timee Project Environment Variables Configuration

This document provides all the environment variables needed for the Timee project.

## 📋 Environment Variables Template

Create a `.env` file in your project root with the following variables:

```bash
# ==============================================
# Timee Project Environment Variables
# ==============================================

# Node Environment
NODE_ENV=development

# ==============================================
# Backend API Configuration
# ==============================================

# API Server Port
PORT=3000
API_PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres

# JWT Configuration
JWT_SECRET=timee-super-secure-jwt-secret-2024

# CORS Configuration
CORS_ORIGIN=https://wmxkwzbmhflj.sealoshzh.site
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:5174,http://localhost:8080,https://wmxkwzbmhflj.sealoshzh.site

# External API URL
EXTERNAL_API_URL=https://wmxkwzbmhflj.sealoshzh.site

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_MAX=200
RATE_LIMIT_WINDOW_MS=900000

# ==============================================
# Frontend Configuration
# ==============================================

# EmailJS Configuration (for frontend)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# ==============================================
# Proxy Server Configuration
# ==============================================

# Proxy Server Port
PROXY_PORT=8080

# ==============================================
# Optional Services
# ==============================================

# Redis (optional)
# REDIS_URL=redis://localhost:6379

# Health Check
HEALTH_CHECK_ENABLED=true
```

## 🔧 Environment-Specific Configurations

### Development Environment
```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_MAX=200
CORS_ORIGIN=*
```

### Production Environment
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
RATE_LIMIT_MAX=50
CORS_ORIGIN=https://wmxkwzbmhflj.sealoshzh.site
```

## 📝 Setup Instructions

1. **Create Environment File**:
   ```bash
   cp ENV_CONFIG.md .env
   # Edit .env file with your actual values
   ```

2. **Backend Environment Variables**:
   - Place `.env` file in `timee-api/` directory
   - Or export variables in your shell

3. **Frontend Environment Variables**:
   - Place `.env` file in `timee-frontend/apps/web/` directory
   - Variables prefixed with `VITE_` are exposed to the frontend

4. **Proxy Server Environment Variables**:
   - Uses `PROXY_PORT` from environment or defaults to 8080

## 🚀 Quick Setup Commands

```bash
# For development
export NODE_ENV=development
export PORT=3000
export DATABASE_URL="postgresql://postgres:Qinguoqg123@timee-postgresql.ns-upg0e2qv.svc:5432/postgres"

# For production
export NODE_ENV=production
export PORT=3000
export CORS_ORIGIN="https://wmxkwzbmhflj.sealoshzh.site"
```

## ⚠️ Important Notes

- Never commit `.env` files to version control
- Use strong, unique values for `JWT_SECRET` in production
- Update `DATABASE_URL` with your actual database credentials
- Configure EmailJS variables for email functionality
- Adjust `ALLOWED_ORIGINS` based on your deployment setup 