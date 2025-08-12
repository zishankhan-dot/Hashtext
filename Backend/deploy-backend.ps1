# Azure Deployment Script for Backend
# Run this script from the Backend directory

param(
    [Parameter(Mandatory=$true)]
    [string]$AppName,
    
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup = "hashtext-rg",
    
    [Parameter(Mandatory=$true)]
    [string]$MongodbUri
)

Write-Host "🚀 Deploying Backend to Azure..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    az --version | Out-Null
    Write-Host "✅ Azure CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    exit 1
}

# Login check
Write-Host "🔐 Checking Azure login status..."
$loginStatus = az account show 2>$null
if (-not $loginStatus) {
    Write-Host "Please login to Azure:"
    az login
}

# Create resource group if it doesn't exist
Write-Host "📁 Creating resource group: $ResourceGroup"
az group create --name $ResourceGroup --location "East US"

# Create App Service plan if it doesn't exist
Write-Host "📋 Creating App Service plan..."
az appservice plan create --name "hashtext-plan" --resource-group $ResourceGroup --sku B1 --is-linux

# Create App Service
Write-Host "🌐 Creating App Service: $AppName"
az webapp create --resource-group $ResourceGroup --plan "hashtext-plan" --name $AppName --runtime "NODE|18-lts"

# Set environment variables
Write-Host "⚙️ Setting environment variables..."
az webapp config appsettings set --resource-group $ResourceGroup --name $AppName --settings `
    URI="$MongodbUri" `
    NODE_ENV="production" `
    JWT_SECRET="$(Get-Random -Minimum 10000000 -Maximum 99999999)$(Get-Date -Format 'yyyyMMddHHmmss')" `
    FRONTEND_URL="https://$AppName-frontend.azurewebsites.net"

# Enable HTTPS only
Write-Host "🔒 Enabling HTTPS only..."
az webapp update --resource-group $ResourceGroup --name $AppName --https-only true

# Create deployment package
Write-Host "📦 Creating deployment package..."
if (Test-Path "backend-deploy.zip") {
    Remove-Item "backend-deploy.zip"
}

# Create zip excluding node_modules and .git
$exclude = @("node_modules", ".git", "*.zip", ".env")
Compress-Archive -Path * -DestinationPath "backend-deploy.zip" -Force

# Deploy using ZIP
Write-Host "🚀 Deploying application..."
az webapp deployment source config-zip --resource-group $ResourceGroup --name $AppName --src "backend-deploy.zip"

# Clean up
Remove-Item "backend-deploy.zip"

Write-Host "✅ Backend deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your backend is available at: https://$AppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "📊 Monitor logs with: az webapp log tail --resource-group $ResourceGroup --name $AppName" -ForegroundColor Yellow

# Test the deployment
Write-Host "🧪 Testing deployment..."
Start-Sleep -Seconds 30
try {
    $response = Invoke-WebRequest -Uri "https://$AppName.azurewebsites.net" -Method GET -TimeoutSec 30
    Write-Host "✅ Backend is responding!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Backend might still be starting up. Check logs if issues persist." -ForegroundColor Yellow
}
