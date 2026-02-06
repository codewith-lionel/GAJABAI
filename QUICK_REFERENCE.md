# Quick Reference Guide

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Clone repository
git clone https://github.com/codewith-lionel/GAJABAI.git
cd GAJABAI

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start
```

### Environment Configuration

**Backend .env**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/gajabai
JWT_SECRET=your_strong_secret_key_min_32_chars
JWT_EXPIRE=30d
MAX_BARGAIN_ATTEMPTS=5
BARGAIN_EXPIRY_HOURS=24
```

**Frontend .env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📡 API Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Required
All protected routes need this header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### User Roles
```javascript
'admin'  - Full system access
'seller' - Product management and bargain handling
'buyer'  - Product browsing and bargaining
```

## 🔑 Test Users (After Registration)

Create test users with different roles:

```bash
# Admin User
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "admin"
}

# Seller User
POST /api/auth/register
{
  "name": "John Seller",
  "email": "seller@test.com",
  "password": "seller123",
  "role": "seller"
}

# Buyer User
POST /api/auth/register
{
  "name": "Jane Buyer",
  "email": "buyer@test.com",
  "password": "buyer123",
  "role": "buyer"
}
```

## 📋 Common Workflows

### 1. Admin: Setup Categories & Price Rules

```bash
# Create category
POST /api/admin/categories
Authorization: Bearer ADMIN_TOKEN
{
  "name": "Electronics",
  "description": "Electronic devices"
}

# Set product price rules (after seller creates product)
PUT /api/admin/products/:productId/pricing
Authorization: Bearer ADMIN_TOKEN
{
  "adminMinPrice": 80000,
  "adminMaxPrice": 120000,
  "bargainingEnabled": true
}
```

### 2. Seller: List Product

```bash
POST /api/seller/products
Authorization: Bearer SELLER_TOKEN
{
  "name": "iPhone 14 Pro",
  "description": "Latest iPhone",
  "category": "CATEGORY_ID",
  "images": ["https://example.com/image.jpg"],
  "adminMinPrice": 80000,
  "adminMaxPrice": 120000,
  "displayPrice": 110000,
  "sellerMinPrice": 95000,
  "stock": 10,
  "bargainingEnabled": true
}
```

### 3. Buyer: Browse & Bargain

```bash
# Browse products
GET /api/products

# Make offer
POST /api/bargains
Authorization: Bearer BUYER_TOKEN
{
  "productId": "PRODUCT_ID",
  "offerAmount": 90000
}

# View my bargains
GET /api/bargains/my-bargains
Authorization: Bearer BUYER_TOKEN
```

### 4. Seller: Handle Bargains

```bash
# Accept bargain
PUT /api/seller/bargains/:bargainId/accept
Authorization: Bearer SELLER_TOKEN

# Counter offer
PUT /api/seller/bargains/:bargainId/counter
Authorization: Bearer SELLER_TOKEN
{
  "counterOffer": 105000
}
```

### 5. Buyer: Create Order

```bash
POST /api/orders
Authorization: Bearer BUYER_TOKEN
{
  "bargainId": "BARGAIN_ID",
  "quantity": 1
}
```

## 🔍 Common Validations

### Price Validation Rules
```javascript
// Buyer offer constraints
offerAmount >= product.adminMinPrice
offerAmount <= product.displayPrice

// Seller price constraints
displayPrice >= product.adminMinPrice
displayPrice <= product.adminMaxPrice
sellerMinPrice >= product.adminMinPrice
sellerMinPrice <= displayPrice

// Auto-accept condition
offerAmount >= product.sellerMinPrice
```

### Bargain Status Values
```javascript
'pending'   - Waiting for seller response
'accepted'  - Offer accepted
'rejected'  - Offer rejected
'countered' - Seller countered with new price
'expired'   - Time limit or max attempts reached
```

## 🛠️ Development Commands

### Backend
```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Run tests
npm test
```

### Frontend
```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test
```

## 🐛 Debugging

### Check MongoDB Connection
```bash
mongosh "mongodb://localhost:27017/gajabai"
```

### View Backend Logs
```bash
# If using PM2
pm2 logs gajabai-backend

# If running directly
# Check console output
```

### Common Issues

**Issue: Can't connect to MongoDB**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**Issue: CORS errors**
- Ensure backend CORS is configured
- Check frontend API_URL in .env
- Verify backend is running

**Issue: 401 Unauthorized**
- Check if token is expired
- Verify Authorization header format
- Ensure user has correct role

## 📊 Database Quick Reference

### Collections
```javascript
users       - User accounts (admin, seller, buyer)
categories  - Product categories
products    - Product listings
bargains    - Negotiation records
orders      - Completed transactions
```

### Key Indexes
```javascript
users: { email: 1 } (unique)
products: { seller: 1, category: 1, status: 1 }
bargains: { buyer: 1, seller: 1, product: 1, status: 1 }
orders: { buyer: 1, seller: 1, status: 1 }
```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS in production
- [ ] Configure CORS for specific origins
- [ ] Enable MongoDB authentication
- [ ] Set secure password requirements
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor error logs
- [ ] Setup automated backups

## 📈 Monitoring

### Key Metrics
```javascript
// Application metrics
- Response time
- Error rate
- Active users
- Request count

// Business metrics
- Total bargains
- Acceptance rate
- Average discount
- Products listed
- Orders created
```

### Logs to Monitor
```bash
# Application logs
pm2 logs gajabai-backend

# Nginx logs (if using)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## 🎯 Testing Checklist

- [ ] Register users with all three roles
- [ ] Admin creates categories
- [ ] Seller lists products
- [ ] Test price validation (below min, above max)
- [ ] Buyer makes valid offer
- [ ] Test auto-accept logic
- [ ] Seller counters offer
- [ ] Buyer counters back
- [ ] Test max attempts limit
- [ ] Test bargain expiration
- [ ] Create order from accepted bargain
- [ ] Verify stock decrements

## 📚 Documentation Files

```
README.md            - Main documentation
API_TESTING.md       - API testing examples
SECURITY.md          - Security analysis
DEPLOYMENT.md        - Deployment guide
ARCHITECTURE.md      - System design
BEST_PRACTICES.md    - Coding standards
PROJECT_SUMMARY.md   - Project overview
QUICK_REFERENCE.md   - This file
```

## 🆘 Getting Help

1. Check relevant documentation file
2. Review error messages carefully
3. Check console/logs for details
4. Verify environment variables
5. Test with API testing guide examples
6. Review security documentation

## 💡 Pro Tips

1. **Use MongoDB Compass** for database visualization
2. **Use Postman** for API testing (import cURL commands)
3. **Enable MongoDB logging** for query debugging
4. **Use React DevTools** for frontend debugging
5. **Test with different user roles** to verify access control
6. **Monitor network tab** in browser for API issues
7. **Check JWT expiration** if getting 401 errors
8. **Verify stock availability** before testing orders
9. **Use .env.example** as template for configuration
10. **Keep this guide handy** for quick reference

## 🔄 Update Workflow

```bash
# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm install

# Update frontend dependencies
cd ../frontend
npm install

# Restart services
pm2 restart gajabai-backend  # or npm run dev
npm start  # for frontend
```

---

**Keep this guide bookmarked for quick access!**

For detailed information, refer to the specific documentation files listed above.
