# GAJABAI - E-Commerce Platform with Bargaining System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce platform that enables buyers to bargain with sellers before purchasing products, with admin-controlled pricing rules.

## 🚀 Features

### 👥 User Roles

1. **Admin**
   - Create and manage product categories
   - Set minimum and maximum price limits for products
   - Enable/disable bargaining per product
   - View bargaining analytics and monitor activity

2. **Seller**
   - List products within admin-defined price limits
   - Set display price and minimum acceptable price
   - Receive, accept, reject, or counter buyer bargain offers
   - Manage product inventory

3. **Buyer**
   - Browse products with listed prices
   - Initiate bargain requests on eligible products
   - Submit counter-offers within allowed price range
   - View bargain status and history
   - Create orders for accepted bargains

## 🔧 Tech Stack

- **Frontend**: React.js with Hooks and Context API
- **Backend**: Node.js + Express.js (REST APIs)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based role authentication
- **Security**: Helmet, CORS, Rate Limiting, bcrypt password hashing

## 📁 Project Structure

```
/backend
  /config          # Database configuration
  /controllers     # Request handlers
  /models          # Database schemas
  /routes          # API routes
  /middleware      # Auth and error handling
  /utils           # Helper functions
  server.js        # Express server setup

/frontend
  /public          # Static files
  /src
    /components    # Reusable components
    /pages         # Page components
    /context       # React Context for state
    /services      # API service layer
    /utils         # Utility functions
    App.js         # Main app component
    index.js       # Entry point
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/gajabai
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
MAX_BARGAIN_ATTEMPTS=5
BARGAIN_EXPIRY_HOURS=24
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend application:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Admin Routes (Protected - Admin only)
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/products` - Get all products
- `PUT /api/admin/products/:id/pricing` - Update product pricing
- `GET /api/admin/bargains/analytics` - Get bargain analytics

### Seller Routes (Protected - Seller only)
- `GET /api/seller/products` - Get seller's products
- `POST /api/seller/products` - Create product
- `PUT /api/seller/products/:id` - Update product
- `DELETE /api/seller/products/:id` - Delete product
- `GET /api/seller/bargains` - Get bargain requests
- `PUT /api/seller/bargains/:id/accept` - Accept bargain
- `PUT /api/seller/bargains/:id/reject` - Reject bargain
- `PUT /api/seller/bargains/:id/counter` - Counter bargain offer

### Buyer Routes (Protected - Buyer only)
- `GET /api/products` - Get all active products
- `GET /api/products/:id` - Get single product
- `POST /api/bargains` - Create bargain
- `GET /api/bargains/my-bargains` - Get buyer's bargains
- `PUT /api/bargains/:id/counter` - Counter seller offer
- `POST /api/orders` - Create order

## 🔐 Security Features

1. **Password Security**: Passwords hashed using bcrypt
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access**: Middleware for role authorization
4. **Rate Limiting**: Prevents API abuse
5. **Input Validation**: Server-side price and data validation
6. **CORS Protection**: Configured CORS policies
7. **Security Headers**: Helmet.js for secure HTTP headers

## 🎯 Bargaining Logic

1. **Buyer Offer Requirements**:
   - Must be ≥ Admin Minimum Price
   - Must be ≤ Seller Display Price

2. **Seller Response Options**:
   - Accept offer
   - Reject offer
   - Counter with new price

3. **Auto-Accept**: 
   - If buyer offer ≥ seller minimum acceptable price

4. **Limitations**:
   - Maximum bargaining attempts (default: 5)
   - Time expiration (default: 24 hours)

5. **Validation**:
   - All prices validated server-side
   - Cannot bypass admin price rules

## 💾 Database Schema

### User
- name, email, password (hashed), role, createdAt

### Category
- name, description, createdBy, createdAt

### Product
- name, description, category, seller, images
- adminMinPrice, adminMaxPrice, bargainingEnabled
- displayPrice, sellerMinPrice
- stock, status, createdAt, updatedAt

### Bargain
- product, buyer, seller
- offerHistory, currentOffer, status
- attemptCount, maxAttempts, expiresAt
- createdAt, updatedAt

### Order
- buyer, seller, product, bargain
- finalPrice, quantity, totalAmount
- status, createdAt, updatedAt

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```

## 🚀 Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Set environment variables in production
- Use MongoDB Atlas for production database

### Frontend Deployment
- Build the React app: `npm run build`
- Deploy to Vercel, Netlify, or similar platforms
- Update API URL to production backend

## 🔄 Edge Cases Handled

1. ✅ Seller tries to set prices outside admin limits
2. ✅ Buyer offers below admin minimum or above display price
3. ✅ Bargaining on products with bargaining disabled
4. ✅ Expired bargaining sessions
5. ✅ Product stock changes during bargaining
6. ✅ Concurrent bargaining attempts on same product
7. ✅ Seller deletes product during active bargaining
8. ✅ Maximum attempt limit reached
9. ✅ User authentication token expiration

## 📝 License

MIT

## 👨‍💻 Author

GAJABAI Team

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!