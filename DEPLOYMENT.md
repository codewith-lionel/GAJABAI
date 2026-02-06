# Deployment Guide

This guide covers deploying the GAJABAI e-commerce platform to production.

## Prerequisites

- Node.js 14+ installed
- MongoDB Atlas account (or MongoDB server)
- Domain name (optional)
- Git installed

## Production Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gajabai?retryWrites=true&w=majority
JWT_SECRET=generate_a_strong_random_secret_key_here
JWT_EXPIRE=30d
MAX_BARGAIN_ATTEMPTS=5
BARGAIN_EXPIRY_HOURS=24
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your application's IP addresses (or 0.0.0.0/0 for any IP)
5. Get your connection string and update MONGO_URI

## Backend Deployment

### Option 1: Railway

1. Create account at [Railway](https://railway.app/)
2. Create new project
3. Connect your GitHub repository
4. Select the backend directory
5. Add environment variables in Railway dashboard
6. Deploy

**Railway Configuration:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Option 2: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-secret"
heroku config:set JWT_EXPIRE=30d
heroku config:set MAX_BARGAIN_ATTEMPTS=5
heroku config:set BARGAIN_EXPIRY_HOURS=24
```

5. Create Procfile in backend directory:

```
web: node server.js
```

6. Deploy:

```bash
cd backend
git init
heroku git:remote -a your-app-name
git add .
git commit -m "Deploy backend"
git push heroku main
```

### Option 3: DigitalOcean App Platform

1. Create account at DigitalOcean
2. Navigate to App Platform
3. Create new app from GitHub repository
4. Select backend directory
5. Add environment variables
6. Deploy

### Option 4: VPS (Ubuntu Server)

1. SSH into your server
2. Install Node.js and MongoDB

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

3. Clone repository and setup

```bash
git clone https://github.com/codewith-lionel/GAJABAI.git
cd GAJABAI/backend
npm install
```

4. Create .env file with production variables

5. Install PM2 for process management

```bash
sudo npm install -g pm2
pm2 start server.js --name gajabai-backend
pm2 save
pm2 startup
```

6. Setup Nginx reverse proxy

```bash
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/gajabai
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gajabai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. Setup SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Frontend Deployment

### Option 1: Vercel (Recommended for React)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Follow the prompts
5. Set environment variables in Vercel dashboard

### Option 2: Netlify

1. Build the app: `npm run build`
2. Create account at [Netlify](https://www.netlify.com/)
3. Drag and drop the `build` folder to Netlify
4. Or connect GitHub repository for automatic deployments
5. Add environment variables in Netlify dashboard

### Option 3: Same VPS as Backend

1. Build the React app

```bash
cd frontend
npm install
REACT_APP_API_URL=https://your-api-domain.com/api npm run build
```

2. Copy build to Nginx directory

```bash
sudo cp -r build/* /var/www/html/gajabai/
```

3. Update Nginx configuration

```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /var/www/html/gajabai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Post-Deployment Checklist

### Security

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Update allowed origins
- [ ] Enable firewall rules
- [ ] Setup MongoDB user authentication
- [ ] Restrict MongoDB network access
- [ ] Regular security updates

### Monitoring

- [ ] Setup error logging (e.g., Sentry)
- [ ] Setup uptime monitoring (e.g., UptimeRobot)
- [ ] Monitor server resources
- [ ] Setup database backups
- [ ] Configure alerts for errors

### Performance

- [ ] Enable gzip compression
- [ ] Setup CDN for static assets
- [ ] Optimize images
- [ ] Enable caching
- [ ] Database indexing

### Testing

- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test bargaining workflow
- [ ] Test role-based access
- [ ] Load testing
- [ ] Mobile responsiveness

## Maintenance

### Backup Strategy

1. **Database Backups**
   - Daily automated backups via MongoDB Atlas
   - Or manual backups: `mongodump --uri="mongodb://..." --out=/backup/`

2. **Code Backups**
   - Use Git for version control
   - Regular commits to GitHub

### Updates

1. Pull latest changes
2. Install dependencies
3. Run tests
4. Restart services

```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart gajabai-backend
```

## Monitoring Commands

```bash
# Check backend status
pm2 status
pm2 logs gajabai-backend

# Check MongoDB status
sudo systemctl status mongod

# Check Nginx status
sudo systemctl status nginx

# Check disk space
df -h

# Check memory usage
free -h

# Monitor real-time logs
tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Check logs: `pm2 logs`
- Verify port availability: `sudo lsof -i :5000`

### Database connection errors
- Verify MongoDB is running
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Test connection: `mongosh "your-connection-string"`

### Frontend not loading
- Clear browser cache
- Check API URL in environment
- Verify CORS settings
- Check Nginx configuration

### Performance issues
- Monitor server resources
- Check database indexes
- Review slow query logs
- Optimize API responses

## Cost Estimates

### Free Tier Options
- **MongoDB Atlas**: 512MB storage (free)
- **Railway**: 500 execution hours/month (free)
- **Vercel**: Unlimited deployments (free)
- **Total**: $0/month for small projects

### Paid Options
- **MongoDB Atlas**: $9/month (M10 cluster)
- **DigitalOcean Droplet**: $5-12/month
- **Domain**: $10-15/year
- **Total**: ~$20-30/month

## Support

For issues or questions:
- Check documentation
- Review error logs
- Contact support
- Open GitHub issue

## Next Steps

After deployment:
1. Test all functionality
2. Monitor for errors
3. Gather user feedback
4. Plan feature updates
5. Regular maintenance
