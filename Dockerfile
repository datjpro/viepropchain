# ============================================================================
# Optimized Frontend Dockerfile - React Application
# ============================================================================

FROM node:18-alpine as dependencies

WORKDIR /app

# Copy package files only
COPY package*.json ./

# Install dependencies (cached if package.json unchanged)
RUN npm install --only=production && npm cache clean --force

# ============================================================================
# Builder stage
# ============================================================================
FROM node:18-alpine as builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy source code
COPY public/ ./public/
COPY src/ ./src/

# Build the React app
RUN npm run build

# ============================================================================
# Production stage with Nginx
# ============================================================================
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
