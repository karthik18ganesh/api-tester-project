# API Tester Project - Docker Setup

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git (to clone the repository)

### Build and Run

1. **Build the Docker image:**

   ```bash
   docker build -t api-tester-project:prod .
   ```

2. **Run the container:**

   ```bash
   docker run --rm -p 8080:80 api-tester-project:prod
   ```

3. **Access the application:**
   Open `http://localhost:8080` in your browser

### Production Deployment

For production deployment, you can:

1. **Build with a specific tag:**

   ```bash
   docker build -t your-registry/api-tester-project:v1.0.0 .
   ```

2. **Push to a registry:**

   ```bash
   docker push your-registry/api-tester-project:v1.0.0
   ```

3. **Run in production:**
   ```bash
   docker run -d --name api-tester -p 80:80 your-registry/api-tester-project:v1.0.0
   ```

## Features

- ✅ Multi-stage Docker build (Node.js + Nginx)
- ✅ Optimized for production
- ✅ SPA routing support
- ✅ Asset caching
- ✅ Gzip compression
- ✅ PWA support

## Environment Variables

The application uses Vite environment variables with `VITE_` prefix. To set them:

```bash
# Example: Set API base URL
VITE_API_BASE=https://api.example.com docker build -t api-tester-project:prod .
```

## Troubleshooting

- **Docker not running**: Start Docker Desktop
- **Port conflicts**: Change the port mapping `-p 8080:80` to `-p 3000:80`
- **Build failures**: Ensure all dependencies are in `package.json`
