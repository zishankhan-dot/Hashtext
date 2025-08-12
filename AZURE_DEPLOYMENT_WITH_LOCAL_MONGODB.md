# Azure Deployment Guide with Local MongoDB

## Prerequisites

1. **Azure Account**: Active Azure subscription
2. **Local MongoDB**: Running on your local machine
3. **Network Configuration**: Your local machine accessible from internet
4. **Azure CLI**: Install from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

## Step 1: Prepare Your Local MongoDB for External Access

### 1.1 Configure MongoDB for External Access

Edit your MongoDB configuration file (`mongod.conf`):

```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0  # Allow connections from any IP

# Security
security:
  authorization: enabled  # Enable authentication
```

### 1.2 Create MongoDB User for Azure App

```bash
# Connect to MongoDB
mongo

# Switch to your database
use your_database_name

# Create a user for Azure access
db.createUser({
  user: "azure_user",
  pwd: "your_secure_password",
  roles: [
    { role: "readWrite", db: "your_database_name" }
  ]
})
```

### 1.3 Configure Your Router/Firewall

1. **Port Forwarding**: Forward port 27017 to your local machine
2. **Firewall**: Allow incoming connections on port 27017
3. **Get Your Public IP**: Visit https://whatismyipaddress.com/

### 1.4 Update Connection String

Your MongoDB connection string for Azure will be:
```
mongodb://azure_user:your_secure_password@YOUR_PUBLIC_IP:27017/your_database_name
```

## Step 2: Prepare Application for Deployment

### 2.1 Update Backend Environment Variables

Create `.env.production` in Backend folder:

```env
# MongoDB Connection (Your Public IP)
URI=mongodb://azure_user:your_secure_password@YOUR_PUBLIC_IP:27017/your_database_name

# Server Configuration
PORT=80
NODE_ENV=production

# Frontend URL (will be updated after frontend deployment)
FRONTEND_URL=https://your-frontend-app.azurewebsites.net

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Other environment variables as needed
```

### 2.2 Create Package.json Scripts for Production

Update `Backend/package.json`:

```json
{
  "scripts": {
    "start": "node main.js",
    "dev": "node main.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2.3 Create Deployment Files

Create `Backend/.deployment`:
```
[config]
command = deploy.cmd
```

Create `Backend/deploy.cmd`:
```cmd
@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.15
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

echo Handling node.js deployment.

:: 1. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_SOURCE%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)

:: 2. Select node version
call :SelectNodeVersion

:: 3. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  pushd "%DEPLOYMENT_TARGET%"
  call :ExecuteCmd !NPM_CMD! install --production
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.

:SelectNodeVersion

IF DEFINED KUDU_SELECT_NODE_VERSION_CMD (
  call %KUDU_SELECT_NODE_VERSION_CMD% "%DEPLOYMENT_SOURCE%" "%DEPLOYMENT_TARGET%" "%DEPLOYMENT_TEMP%"
  IF !ERRORLEVEL! NEQ 0 goto error

  IF EXIST "%DEPLOYMENT_TEMP%\__nodeVersion.tmp" (
    SET /p NODE_EXE=<"%DEPLOYMENT_TEMP%\__nodeVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )
  
  IF EXIST "%DEPLOYMENT_TEMP%\__npmVersion.tmp" (
    SET /p NPM_CMD=<"%DEPLOYMENT_TEMP%\__npmVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )

  IF NOT DEFINED NODE_EXE (
    SET NODE_EXE=node
  )

  SET NPM_CMD="!NODE_EXE!" "!NPM_FULL_PATH!"
)

goto :EOF
```

## Step 3: Deploy Backend to Azure App Service

### 3.1 Create Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name hashtext-rg --location "East US"

# Create App Service plan
az appservice plan create --name hashtext-plan --resource-group hashtext-rg --sku B1 --is-linux

# Create App Service for backend
az webapp create --resource-group hashtext-rg --plan hashtext-plan --name your-backend-app-name --runtime "NODE|18-lts"
```

### 3.2 Configure Environment Variables

```bash
# Set environment variables
az webapp config appsettings set --resource-group hashtext-rg --name your-backend-app-name --settings \
  URI="mongodb://azure_user:your_secure_password@YOUR_PUBLIC_IP:27017/your_database_name" \
  NODE_ENV="production" \
  JWT_SECRET="your_super_secure_jwt_secret_key_here" \
  FRONTEND_URL="https://your-frontend-app.azurewebsites.net"
```

### 3.3 Deploy Backend Code

**Option A: Using Git Deployment**

```bash
# Enable Git deployment
az webapp deployment source config-local-git --resource-group hashtext-rg --name your-backend-app-name

# Add Azure remote to your git repository
cd Backend
git init
git add .
git commit -m "Initial backend deployment"
git remote add azure https://your-backend-app-name.scm.azurewebsites.net:443/your-backend-app-name.git
git push azure main
```

**Option B: Using ZIP Deployment**

```bash
# Create deployment package
cd Backend
zip -r backend-deployment.zip . -x "node_modules/*" ".git/*"

# Deploy using ZIP
az webapp deployment source config-zip --resource-group hashtext-rg --name your-backend-app-name --src backend-deployment.zip
```

### 3.4 Enable HTTPS Only

```bash
az webapp update --resource-group hashtext-rg --name your-backend-app-name --https-only true
```

## Step 4: Deploy Frontend to Azure Static Web Apps

### 4.1 Build Frontend for Production

```bash
cd frontend

# Create production environment file
echo "VITE_API_URL=https://your-backend-app-name.azurewebsites.net/api" > .env.production

# Build the application
npm run build
```

### 4.2 Create Static Web App

```bash
# Create Static Web App
az staticwebapp create --name your-frontend-app-name --resource-group hashtext-rg --source https://github.com/zishankhan-dot/Hashtext --branch main --app-location "/frontend" --output-location "dist"
```

**Alternative: Manual Static Web App Creation**

1. Go to Azure Portal → Create Resource → Static Web Apps
2. Choose your GitHub repository
3. Set build details:
   - App location: `/frontend`
   - Output location: `dist`
4. Deploy

### 4.3 Configure Custom Domain (Optional)

```bash
# Add custom domain
az staticwebapp hostname set --name your-frontend-app-name --resource-group hashtext-rg --hostname your-domain.com
```

## Step 5: Update CORS Configuration

Update your backend's `main.js` to include the actual frontend URL:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    'https://your-frontend-app-name.azurewebsites.net', // Your actual frontend URL
    process.env.FRONTEND_URL,
];
```

## Step 6: Security Considerations

### 6.1 MongoDB Security

```bash
# Create firewall rule for Azure IPs (get these from your App Service)
# In your router, allow only specific Azure datacenter IP ranges
# Consider using MongoDB Atlas for better security
```

### 6.2 Application Security

1. **HTTPS Only**: Both apps redirect HTTP to HTTPS
2. **Environment Variables**: Stored securely in Azure
3. **CORS**: Restricted to your frontend domain
4. **Authentication**: Implement proper JWT validation

## Step 7: Testing and Monitoring

### 7.1 Test Your Deployment

1. **Frontend**: Visit `https://your-frontend-app-name.azurewebsites.net`
2. **Backend**: Test API at `https://your-backend-app-name.azurewebsites.net/api`
3. **Database**: Verify data operations work

### 7.2 Monitor Applications

```bash
# View backend logs
az webapp log tail --resource-group hashtext-rg --name your-backend-app-name

# View frontend deployment logs
az staticwebapp show --name your-frontend-app-name --resource-group hashtext-rg
```

## Step 8: Alternative: Using MongoDB Atlas (Recommended)

For better security and reliability, consider using MongoDB Atlas:

1. **Create MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: Free tier available
3. **Whitelist Azure IPs**: Add Azure datacenter IPs to Atlas
4. **Update Connection String**: Use Atlas connection string instead of local MongoDB

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Fails**: 
   - Check firewall settings
   - Verify port forwarding
   - Test connection from Azure

2. **CORS Errors**:
   - Update CORS origins with actual domain
   - Redeploy backend

3. **Environment Variables**:
   - Verify all variables are set in Azure App Service
   - Check for typos in variable names

### Useful Commands:

```bash
# Restart backend app
az webapp restart --resource-group hashtext-rg --name your-backend-app-name

# View environment variables
az webapp config appsettings list --resource-group hashtext-rg --name your-backend-app-name

# Delete resource group (cleanup)
az group delete --name hashtext-rg --yes
```

## Production URLs

After deployment, your application will be available at:

- **Frontend**: `https://your-frontend-app-name.azurewebsites.net`
- **Backend API**: `https://your-backend-app-name.azurewebsites.net/api`
- **Database**: Your local MongoDB (accessible via public IP)

## Security Warning

⚠️ **Important**: Exposing your local MongoDB to the internet has security risks. For production, strongly consider:

1. Using MongoDB Atlas (cloud database)
2. Setting up VPN connection between Azure and your local network
3. Implementing additional security measures (IP whitelisting, strong authentication)

This setup is suitable for development/testing but may not be ideal for production environments with sensitive data.
