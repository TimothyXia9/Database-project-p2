# ============================================================================
# Multi-stage Dockerfile for React Frontend
# Optimized for production with nginx serving
# ============================================================================

# Stage 1: Builder
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies (all deps needed for build)
RUN npm ci

# Copy application code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
