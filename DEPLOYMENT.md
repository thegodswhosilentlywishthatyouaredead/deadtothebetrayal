# Deployment Guide

## GitHub Pages (Frontend Only)

Your frontend is now ready for GitHub Pages deployment:

1. **Enable GitHub Pages:**
   - Go to your repository: https://github.com/thegodswhosilentlywishthatyouaredead/deadtothebetrayal
   - Click "Settings" → "Pages"
   - Source: "Deploy from a branch"
   - Branch: "gh-pages" → "/ (root)"
   - Click "Save"

2. **Access your live site:**
   - URL: `https://thegodswhosilentlywishthatyouaredead.github.io/deadtothebetrayal/public/index.html`
   - Field Portal: `https://thegodswhosilentlywishthatyouaredead.github.io/deadtothebetrayal/public/field-portal.html`

## Backend Deployment Options

Since GitHub Pages only hosts static files, you need to deploy the backend separately:

### Option 1: Heroku (Recommended)
```bash
# Install Heroku CLI
# Create Procfile
echo "web: python3 backend_server.py" > Procfile

# Create requirements.txt
echo "flask==2.3.3
flask-cors==4.0.0
python-docx==0.8.11
markdown2==2.4.10" > requirements.txt

# Deploy
heroku create your-app-name
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: Render
1. Connect your GitHub repository
2. Choose "Web Service"
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python3 backend_server.py`

## Update Configuration

After deploying the backend, update `client/src/config.js`:

```javascript
production: {
    API_BASE: 'https://your-backend-url.herokuapp.com/api'
}
```

## Full Stack Deployment

### Vercel (Frontend + Backend)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Configure API routes in `api/` folder

### Netlify (Frontend + Functions)
1. Connect GitHub repository
2. Build command: `echo "Static site"`
3. Publish directory: `client/public`
4. Add serverless functions for API

## Environment Variables

For production, set these environment variables:
- `FLASK_ENV=production`
- `PORT=5000` (or your platform's port)

## CORS Configuration

Update `backend_server.py` for production:
```python
CORS(app, origins=[
    "https://thegodswhosilentlywishthatyouaredead.github.io",
    "https://your-custom-domain.com"
])
```

## Custom Domain

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. Add CNAME record pointing to GitHub Pages
3. Update GitHub Pages settings with custom domain
4. Update CORS origins in backend

## SSL/HTTPS

- GitHub Pages: Automatic HTTPS
- Heroku: Automatic HTTPS
- Railway: Automatic HTTPS
- Render: Automatic HTTPS

## Monitoring

Add monitoring services:
- **Uptime**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Plausible
- **Error Tracking**: Sentry, LogRocket
