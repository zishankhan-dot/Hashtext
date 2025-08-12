# Master Azure Deployment Script
# This script will deploy both frontend and backend to Azure

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendAppName,
    
    [Parameter(Mandatory=$true)]
    [string]$FrontendAppName,
    
    [Parameter(Mandatory=$true)]
    [string]$MongoDbConnectionString,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "hashtext-rg"
)

Write-Host "🚀 Starting Full Azure Deployment for Hashtext App" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Validate inputs
if (-not $BackendAppName -or -not $FrontendAppName -or -not $MongoDbConnectionString) {
    Write-Host "❌ Missing required parameters!" -ForegroundColor Red
    Write-Host "Usage: .\deploy-full.ps1 -BackendAppName 'your-backend' -FrontendAppName 'your-frontend' -MongoDbConnectionString 'mongodb://...'" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "Backend App: $BackendAppName" -ForegroundColor White
Write-Host "Frontend App: $FrontendAppName" -ForegroundColor White
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "MongoDB: $(if($MongoDbConnectionString.Length -gt 50) { $MongoDbConnectionString.Substring(0,50) + '...' } else { $MongoDbConnectionString })" -ForegroundColor White

# Step 1: Deploy Backend
Write-Host "`n🔧 Step 1: Deploying Backend..." -ForegroundColor Yellow
Set-Location "Backend"

try {
    & ".\deploy-backend.ps1" -AppName $BackendAppName -ResourceGroup $ResourceGroup -MongodbUri $MongoDbConnectionString
    $backendUrl = "https://$BackendAppName.azurewebsites.net"
    Write-Host "✅ Backend deployed successfully at: $backendUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy Frontend
Write-Host "`n🎨 Step 2: Preparing Frontend..." -ForegroundColor Yellow
Set-Location "..\frontend"

try {
    & ".\deploy-frontend.ps1" -AppName $FrontendAppName -BackendUrl $backendUrl -ResourceGroup $ResourceGroup
    Write-Host "✅ Frontend prepared for deployment" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend preparation failed: $_" -ForegroundColor Red
    exit 1
}

# Final instructions
Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "✅ Backend: $backendUrl" -ForegroundColor Green
Write-Host "✅ Frontend: Built and ready for Static Web Apps" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create Azure Static Web App for frontend:" -ForegroundColor White
Write-Host "   - Go to: https://portal.azure.com" -ForegroundColor Cyan
Write-Host "   - Create Resource → Static Web Apps" -ForegroundColor Cyan
Write-Host "   - Connect to GitHub repo" -ForegroundColor Cyan
Write-Host "   - App location: /frontend" -ForegroundColor Cyan
Write-Host "   - Output location: dist" -ForegroundColor Cyan

Write-Host "`n2. Update CORS after frontend deployment:" -ForegroundColor White
Write-Host "   - Add your Static Web App URL to Backend/main.js" -ForegroundColor Cyan
Write-Host "   - Redeploy backend" -ForegroundColor Cyan

Write-Host "`n🔍 Monitoring Commands:" -ForegroundColor Yellow
Write-Host "Backend logs: az webapp log tail --resource-group $ResourceGroup --name $BackendAppName" -ForegroundColor Cyan
Write-Host "Restart backend: az webapp restart --resource-group $ResourceGroup --name $BackendAppName" -ForegroundColor Cyan

Write-Host "`n🌟 Your Hashtext app will be live soon!" -ForegroundColor Green

# Return to original directory
Set-Location ".."
