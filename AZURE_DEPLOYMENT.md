# Azure Deployment Guide

## Backend Deployment (Node.js App Service)

1. Create a new App Service in Azure Portal
2. Choose Node.js runtime
3. Deploy your backend code to the App Service

### Environment Variables to set in Azure App Service:
```
URI=your_mongodb_connection_string
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.azurewebsites.net
JWT_SECRET=your_jwt_secret_key
PORT=80
```

### Deployment Options:
- GitHub Actions (recommended)
- Azure DevOps
- Local Git
- FTP

## Frontend Deployment (Static Web App or App Service)

### Option 1: Static Web App (Recommended)
1. Build the frontend locally: `npm run build`
2. Deploy the `dist` folder to Azure Static Web Apps
3. Configure custom domain if needed

### Option 2: App Service
1. Create another App Service for frontend
2. Deploy the built frontend files

## Security Considerations

1. **HTTPS Only**: Both apps will automatically redirect HTTP to HTTPS
2. **CORS**: Backend is configured to only allow requests from your frontend domain
3. **Security Headers**: Added via web.config for additional protection
4. **Environment Variables**: Keep sensitive data in Azure App Service configuration

## Post-Deployment Steps

1. Update CORS origins in backend to include your actual Azure domain
2. Test all API endpoints
3. Verify HTTPS redirects are working
4. Test frontend-backend communication

## Local Development

For local HTTPS development, you can use:
```bash
# Backend
npm start

# Frontend  
npm run dev
```
