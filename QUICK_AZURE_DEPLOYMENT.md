# Quick Azure Deployment Steps

## 🚀 Quick Deployment Checklist

### 1. Prepare Local MongoDB (5 minutes)

```bash
# Edit mongod.conf
net:
  bindIp: 0.0.0.0  # Allow external connections

# Create Azure user
mongo
use your_database_name
db.createUser({
  user: "azure_user",
  pwd: "secure_password123",
  roles: [{ role: "readWrite", db: "your_database_name" }]
})
```

### 2. Get Your Public IP
Visit: https://whatismyipaddress.com/
Note: YOUR_PUBLIC_IP

### 3. Configure Router
- Forward port 27017 to your local machine
- Allow incoming connections on port 27017

### 4. Deploy Backend (10 minutes)

```bash
# Login to Azure
az login

# Create resources
az group create --name hashtext-rg --location "East US"
az appservice plan create --name hashtext-plan --resource-group hashtext-rg --sku B1 --is-linux
az webapp create --resource-group hashtext-rg --plan hashtext-plan --name your-backend-name --runtime "NODE|18-lts"

# Set environment variables (replace with your values)
az webapp config appsettings set --resource-group hashtext-rg --name your-backend-name --settings \
  URI="mongodb://azure_user:secure_password123@YOUR_PUBLIC_IP:27017/your_database_name" \
  NODE_ENV="production" \
  JWT_SECRET="your_jwt_secret_here" \
  FRONTEND_URL="https://your-frontend-name.azurewebsites.net"

# Enable HTTPS
az webapp update --resource-group hashtext-rg --name your-backend-name --https-only true
```

### 5. Deploy Backend Code

**Option A: ZIP Deployment (Easiest)**
```bash
cd Backend
# Create zip file excluding node_modules
powershell Compress-Archive -Path * -DestinationPath backend.zip -Force
az webapp deployment source config-zip --resource-group hashtext-rg --name your-backend-name --src backend.zip
```

**Option B: Git Deployment**
```bash
cd Backend
git init
git add .
git commit -m "Deploy to Azure"
az webapp deployment source config-local-git --resource-group hashtext-rg --name your-backend-name
# Follow the git remote instructions shown
```

### 6. Deploy Frontend (5 minutes)

```bash
cd frontend

# Create production environment
echo "VITE_API_URL=https://your-backend-name.azurewebsites.net/api" > .env.production

# Build
npm run build

# Deploy to Static Web App (via Azure Portal)
# 1. Go to Azure Portal → Create Resource → Static Web Apps
# 2. Connect your GitHub repo
# 3. Set app location: "/frontend"
# 4. Set output location: "dist"
```

### 7. Update CORS (Final Step)

Update `Backend/main.js` to include your actual frontend URL:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://your-frontend-name.azurewebsites.net', // Add this line
    process.env.FRONTEND_URL,
];
```

Redeploy backend after this change.

### 8. Test Your App

- Frontend: `https://your-frontend-name.azurewebsites.net`
- Backend: `https://your-backend-name.azurewebsites.net/api`

### 🔧 Troubleshooting

**MongoDB Connection Issues:**
```bash
# Test from Azure console
az webapp ssh --resource-group hashtext-rg --name your-backend-name
# Then test: telnet YOUR_PUBLIC_IP 27017
```

**View Logs:**
```bash
az webapp log tail --resource-group hashtext-rg --name your-backend-name
```

**Restart App:**
```bash
az webapp restart --resource-group hashtext-rg --name your-backend-name
```

### 💡 Pro Tips

1. **Use unique names**: Azure app names must be globally unique
2. **Save your URLs**: Note down your app URLs for future reference
3. **Monitor costs**: Use B1 pricing tier for development
4. **Consider MongoDB Atlas**: For production, use cloud database instead of local

### 🛡️ Security Notes

- Your local MongoDB is exposed to the internet
- Consider IP whitelisting in your router
- For production, use MongoDB Atlas or Azure Cosmos DB
- Regularly update your MongoDB credentials

### 📝 Replace These Values

Before running commands, replace:
- `your-backend-name` → Your chosen backend app name
- `your-frontend-name` → Your chosen frontend app name  
- `YOUR_PUBLIC_IP` → Your actual public IP address
- `your_database_name` → Your MongoDB database name
- `secure_password123` → A strong password
- `your_jwt_secret_here` → A secure JWT secret
