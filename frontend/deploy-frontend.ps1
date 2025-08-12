# Azure Static Web App Deployment Script for Frontend
# Run this script from the frontend directory

param(
    [Parameter(Mandatory=$true)]
    [string]$AppName,
    
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "hashtext-rg"
)

Write-Host "🚀 Preparing Frontend for Azure Static Web Apps..." -ForegroundColor Green

# Update environment file
Write-Host "⚙️ Configuring environment variables..."
$envContent = "VITE_API_URL=$BackendUrl/api"
$envContent | Out-File -FilePath ".env.production" -Encoding utf8

Write-Host "📦 Building application for production..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "📁 Built files are in the 'dist' directory" -ForegroundColor Cyan

Write-Host "`n🌐 Next Steps for Static Web App Deployment:" -ForegroundColor Yellow
Write-Host "1. Go to Azure Portal (https://portal.azure.com)" -ForegroundColor White
Write-Host "2. Create a Resource → Static Web Apps" -ForegroundColor White
Write-Host "3. Connect to your GitHub repository" -ForegroundColor White
Write-Host "4. Set the following build configuration:" -ForegroundColor White
Write-Host "   - App location: /frontend" -ForegroundColor Cyan
Write-Host "   - Output location: dist" -ForegroundColor Cyan
Write-Host "5. Deploy and note the URL" -ForegroundColor White

Write-Host "`n📋 Configuration Summary:" -ForegroundColor Green
Write-Host "Frontend build: ✅ Ready" -ForegroundColor Green
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan
Write-Host "Environment: Production" -ForegroundColor Cyan

Write-Host "`n🔄 After Static Web App is created, update backend CORS:" -ForegroundColor Yellow
Write-Host "Add your Static Web App URL to the allowedOrigins in main.js" -ForegroundColor White
