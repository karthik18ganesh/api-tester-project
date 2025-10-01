# API Tester Project - Docker Image Instructions

## 📦 What You Received

- `api-tester-project.tar` (22MB) - Complete Docker image
- This is a **production-ready containerized application**

## 🚀 How to Run the Application

### Prerequisites

- Docker Desktop installed and running
- The `api-tester-project.tar` file

### Step 1: Load the Docker Image

```bash
docker load -i api-tester-project.tar
```

### Step 2: Run the Application

```bash
docker run --rm -p 8080:80 api-tester-project:prod
```

### Step 3: Access the Application

Open your browser and go to: **http://localhost:8080**

## 🔧 Alternative: Run with Custom Port

```bash
# Run on port 3000 instead of 8080
docker run --rm -p 3000:80 api-tester-project:prod
# Then access: http://localhost:3000
```

## 🏢 Production Deployment

```bash
# Run in background (detached mode)
docker run -d --name api-tester -p 80:80 api-tester-project:prod

# Stop the application
docker stop api-tester

# Remove the container
docker rm api-tester
```

## ✅ What's Included

- ✅ Complete React application
- ✅ Nginx web server
- ✅ SPA routing
- ✅ Asset optimization
- ✅ PWA support
- ✅ Production-ready configuration

## 🆘 Troubleshooting

- **Docker not running**: Start Docker Desktop
- **Port already in use**: Change the port mapping (e.g., `-p 3000:80`)
- **Permission denied**: Run as administrator (Windows) or with sudo (Linux/Mac)

## 📞 Support

If you encounter any issues, please contact the development team.
