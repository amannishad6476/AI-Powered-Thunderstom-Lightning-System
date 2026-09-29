# ==============================================================================
# Stage 1: Build Environment (Vite + React + Tailwind CSS)
# ==============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependency lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

# Copy application source code and configuration files
COPY vite.config.js tailwind.config.js postcss.config.js index.html ./
COPY public/ ./public/
COPY src/ ./src/

# Build arguments for dynamic environment injection
ARG VITE_API_URL=/api/v1
ARG VITE_WS_URL=/ws/live-feed
ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL

# Build optimized production bundle
RUN npm run build


# ==============================================================================
# Stage 2: Production Web Server (High-Performance Nginx)
# ==============================================================================
FROM nginx:1.25-alpine AS production

# Remove default boilerplate configuration
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom reverse-proxy and SPA routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check verifying Nginx availability
HEALTHCHECK --interval=20s --timeout=4s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/healthz || exit 1

# Launch Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
