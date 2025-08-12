# Local HTTPS Development Guide

## 🚨 SSL Error Fix

If you're getting `SSL_ERROR_NO_CYPHER_OVERLAP` or similar SSL errors, here are the solutions:

## Option 1: Use HTTP for Local Development (Recommended)

The easiest solution is to use HTTP locally and HTTPS only in production:

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend (HTTP)
cd frontend
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- No SSL errors, works perfectly for development

## Option 2: Setup Trusted HTTPS Certificates

For trusted HTTPS certificates that browsers accept:

### Step 1: Install mkcert (one-time setup)
```bash
# Windows (with Chocolatey)
choco install mkcert

# Windows (manual): Download from https://github.com/FiloSottile/mkcert/releases

# macOS
brew install mkcert

# Linux
sudo apt install mkcert
```

### Step 2: Setup certificates
```bash
cd frontend
npm run setup-https
```

### Step 3: Start with HTTPS
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend (HTTPS)
cd frontend
npm run dev:https
```

## Option 3: Firefox SSL Error Workaround

If you must use self-signed certificates and get SSL errors:

1. Type `about:config` in Firefox address bar
2. Search for `security.tls.version.min`
3. Set it to `1` (was probably `3`)
4. Search for `security.tls.version.max`
5. Set it to `4`
6. Restart Firefox

## Option 4: Use Chrome/Edge Instead

Chrome and Edge are more tolerant of self-signed certificates:
- Click "Advanced" → "Proceed to localhost (unsafe)"

## Current Configuration

Your app is currently configured to:
- ✅ Use HTTP by default (no SSL errors)
- ✅ Support HTTPS when certificates are available
- ✅ Work seamlessly in production with Azure HTTPS

## Testing Your Setup:

**HTTP (Recommended for local dev):**
1. Frontend: `http://localhost:3000`
2. Backend API: `http://localhost:3001/api`

**HTTPS (After certificate setup):**
1. Frontend: `https://localhost:3000`
2. Backend API: `http://localhost:3001/api`

## Production Deployment:

When you deploy to Azure, both frontend and backend will automatically use HTTPS without any certificate issues.
