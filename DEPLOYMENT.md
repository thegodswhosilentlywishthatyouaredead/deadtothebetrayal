# 🚀 Deployment Guide - Intelligent Field Assignment System

## 🌐 Cloud Deployment Options

### Option 1: Railway (Recommended)
Railway is a modern cloud platform that's perfect for this microservices architecture.

#### Steps:
1. **Sign up at [Railway](https://railway.app)**
2. **Connect your GitHub repository**
3. **Deploy automatically**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

#### Environment Variables for Railway:
```
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
CORS_ORIGINS=*
OPENAI_API_KEY=your-openai-key
```

### Option 2: Render
Render provides easy deployment with automatic scaling.

#### Steps:
1. **Sign up at [Render](https://render.com)**
2. **Connect your GitHub repository**
3. **Use the provided `render.yaml` configuration**

#### Environment Variables for Render:
```
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
CORS_ORIGINS=*
OPENAI_API_KEY=your-openai-key
```

### Option 3: DigitalOcean App Platform
DigitalOcean provides robust cloud infrastructure.

#### Steps:
1. **Sign up at [DigitalOcean](https://digitalocean.com)**
2. **Create a new App**
3. **Connect your GitHub repository**
4. **Configure environment variables**

### Option 4: AWS/GCP/Azure
For enterprise deployments, use major cloud providers.

#### AWS Elastic Beanstalk:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

## 🐳 Docker Deployment

### Local Production Build:
```bash
# Build production image
docker build -t intelligent-field-assignment .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Production Environment Variables:
```bash
# Copy environment file
cp env.example .env

# Edit with your production values
nano .env
```

## 🔧 Configuration

### Database Setup:
1. **Create PostgreSQL database**
2. **Run migrations** (automatic on startup)
3. **Seed initial data** (automatic on startup)

### Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGINS`: Allowed CORS origins
- `OPENAI_API_KEY`: OpenAI API key for AI features

### Security Considerations:
- Use strong JWT secrets
- Configure CORS properly
- Use HTTPS in production
- Set up monitoring and logging

## 📊 Monitoring

### Health Checks:
- **Main endpoint**: `GET /health`
- **Database**: Automatic health checks
- **Services**: Individual service health endpoints

### Logging:
- **Application logs**: Available in cloud platform
- **Database logs**: PostgreSQL logs
- **Error tracking**: Built-in error handling

## 🚀 Quick Deploy Commands

### Railway:
```bash
railway login
railway link
railway up
```

### Render:
```bash
# Just push to GitHub - Render auto-deploys
git push origin main
```

### Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Post-Deployment

### Verify Deployment:
1. **Check health endpoint**: `https://your-app.railway.app/health`
2. **Test API endpoints**: `https://your-app.railway.app/api/teams`
3. **Access frontend**: `https://your-app.railway.app/`

### Database Management:
- **pgAdmin**: Available at `/pgadmin` (if enabled)
- **Direct connection**: Use provided DATABASE_URL

### Monitoring:
- **Railway**: Built-in metrics and logs
- **Render**: Dashboard with metrics
- **Custom**: Add monitoring tools as needed

## 🛠️ Troubleshooting

### Common Issues:
1. **Database connection**: Check DATABASE_URL
2. **CORS errors**: Verify CORS_ORIGINS
3. **JWT errors**: Check JWT_SECRET
4. **AI features**: Verify OPENAI_API_KEY

### Debug Commands:
```bash
# Check logs
railway logs

# Check status
railway status

# Restart services
railway restart
```

## 📈 Scaling

### Automatic Scaling:
- **Railway**: Automatic scaling based on traffic
- **Render**: Auto-scaling with resource limits
- **Docker**: Manual scaling with docker-compose

### Manual Scaling:
```bash
# Scale services
docker-compose -f docker-compose.prod.yml up --scale gateway=3
```

## 🔒 Security

### Production Security:
- Use strong passwords
- Enable HTTPS
- Configure firewall rules
- Regular security updates
- Monitor access logs

### Environment Security:
- Never commit secrets
- Use environment variables
- Rotate keys regularly
- Monitor for breaches

---

## 🎯 Recommended Deployment: Railway

**Why Railway?**
- ✅ Easy GitHub integration
- ✅ Automatic deployments
- ✅ Built-in PostgreSQL
- ✅ Environment management
- ✅ Monitoring and logs
- ✅ Free tier available

**Quick Start:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Connect this repository
5. Deploy automatically!

Your Intelligent Field Assignment System will be live on the internet! 🌐