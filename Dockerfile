# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production

# Copy custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 256; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml; \
    \
    # Cache static assets \
    location /assets/ { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
    } \
    \
    # SPA fallback - all routes to index.html \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Copy build output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
