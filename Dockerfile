# Multi-stage build for Vite React app served by Nginx

# 1) Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage Docker layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps

# Copy source and build
COPY . .
ENV NODE_ENV=production
RUN npm run build

# 2) Runtime stage (Nginx)
FROM nginx:1.27-alpine AS runtime

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# If you want to expose a healthcheck page, you can keep index.html
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]


