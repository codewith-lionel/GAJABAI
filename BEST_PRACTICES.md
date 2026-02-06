# Development Best Practices

This document outlines the best practices followed in the GAJABAI e-commerce platform.

## Code Organization

### Backend Structure
```
backend/
├── config/          # Configuration files (DB, etc.)
├── controllers/     # Request handlers (business logic)
├── models/          # Database schemas
├── routes/          # API route definitions
├── middleware/      # Custom middleware (auth, error handling)
├── utils/           # Helper functions and utilities
└── server.js        # Application entry point
```

### Frontend Structure
```
frontend/src/
├── components/      # Reusable UI components
├── pages/           # Page-level components
├── context/         # React Context for state management
├── services/        # API communication layer
└── utils/           # Helper functions
```

## Coding Standards

### JavaScript/Node.js

1. **Use const/let instead of var**
```javascript
// Good
const apiUrl = process.env.API_URL;
let count = 0;

// Bad
var apiUrl = process.env.API_URL;
```

2. **Use async/await over callbacks**
```javascript
// Good
const fetchData = async () => {
  try {
    const result = await api.getData();
    return result;
  } catch (error) {
    console.error(error);
  }
};

// Bad
const fetchData = (callback) => {
  api.getData((error, result) => {
    if (error) console.error(error);
    else callback(result);
  });
};
```

3. **Use arrow functions consistently**
```javascript
// Good
const calculateTotal = (price, quantity) => price * quantity;

// Also good for methods
exports.getProducts = async (req, res) => {
  // ...
};
```

4. **Proper error handling**
```javascript
// Good - Always use try-catch with async/await
try {
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ data: product });
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

### React Best Practices

1. **Use functional components with hooks**
```javascript
// Good
const ProductList = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  return <div>...</div>;
};
```

2. **Destructure props**
```javascript
// Good
const ProductCard = ({ name, price, onBargain }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>₹{price}</p>
      <button onClick={onBargain}>Bargain</button>
    </div>
  );
};
```

3. **Use Context for global state**
```javascript
// Good - Centralized authentication state
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

4. **Memoize expensive computations**
```javascript
const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
};
```

## API Design Principles

### RESTful Conventions

1. **Use proper HTTP methods**
```
GET    /api/products       - Get all products
GET    /api/products/:id   - Get single product
POST   /api/products       - Create product
PUT    /api/products/:id   - Update product
DELETE /api/products/:id   - Delete product
```

2. **Use meaningful status codes**
```javascript
200 - OK (success)
201 - Created (resource created)
400 - Bad Request (validation error)
401 - Unauthorized (not authenticated)
403 - Forbidden (not authorized)
404 - Not Found
500 - Internal Server Error
```

3. **Consistent response format**
```javascript
// Success
{
  "success": true,
  "data": { /* response data */ }
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

4. **Use query parameters for filtering**
```
GET /api/products?category=electronics&status=active
```

## Security Best Practices

### Password Security

```javascript
// Always hash passwords before storing
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Never log or expose passwords
// Bad
console.log('User password:', password);

// Never return passwords in API responses
// Use select: false in schema
password: {
  type: String,
  select: false
}
```

### JWT Security

```javascript
// Use strong secret keys
JWT_SECRET=use_a_long_random_string_at_least_32_characters

// Set appropriate expiration
JWT_EXPIRE=30d

// Verify tokens properly
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Input Validation

```javascript
// Always validate on server-side
const { offerAmount } = req.body;

if (!offerAmount || offerAmount < 0) {
  return res.status(400).json({ 
    error: 'Invalid offer amount' 
  });
}

// Validate against business rules
if (offerAmount < product.adminMinPrice) {
  return res.status(400).json({ 
    error: `Offer must be at least ${product.adminMinPrice}` 
  });
}
```

### Authorization Checks

```javascript
// Always verify resource ownership
if (product.seller.toString() !== req.user.id) {
  return res.status(403).json({ 
    error: 'Not authorized to update this product' 
  });
}
```

## Database Best Practices

### Schema Design

```javascript
// Use proper data types
price: {
  type: Number,
  required: true,
  min: 0
}

// Use enums for fixed values
status: {
  type: String,
  enum: ['active', 'inactive'],
  default: 'active'
}

// Use references for relationships
seller: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
}
```

### Indexing

```javascript
// Index frequently queried fields
userSchema.index({ email: 1 }, { unique: true });
productSchema.index({ seller: 1, status: 1 });
bargainSchema.index({ buyer: 1, status: 1 });
```

### Query Optimization

```javascript
// Good - Use select to limit fields
const products = await Product.find()
  .select('name price stock')
  .populate('seller', 'name')
  .lean();

// Good - Use pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const products = await Product.find()
  .skip(skip)
  .limit(limit);
```

### Validation

```javascript
// Use Mongoose validation
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  }
});

// Use custom validation
productSchema.pre('save', function(next) {
  if (this.displayPrice < this.adminMinPrice) {
    return next(new Error('Display price cannot be less than admin minimum'));
  }
  next();
});
```

## Testing Best Practices

### Unit Tests

```javascript
describe('validateBuyerOffer', () => {
  test('should reject offer below minimum price', async () => {
    const result = await validateBuyerOffer(productId, 50);
    expect(result.valid).toBe(false);
  });
  
  test('should accept valid offer', async () => {
    const result = await validateBuyerOffer(productId, 150);
    expect(result.valid).toBe(true);
  });
});
```

### Integration Tests

```javascript
describe('POST /api/bargains', () => {
  test('should create bargain with valid data', async () => {
    const response = await request(app)
      .post('/api/bargains')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        productId: testProduct._id,
        offerAmount: 150
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Error Handling

### Centralized Error Handler

```javascript
// middleware/error.js
const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};
```

### Async Error Handling

```javascript
// Use try-catch in async functions
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

## Environment Variables

### Development vs Production

```javascript
// Use different configs for different environments
if (process.env.NODE_ENV === 'development') {
  // Development-specific code
  console.log('Running in development mode');
} else {
  // Production-specific code
  console.log('Running in production mode');
}
```

### Sensitive Data

```javascript
// Never commit .env files
// Always use .env.example

// .env (not in git)
JWT_SECRET=actual_secret_key

// .env.example (in git)
JWT_SECRET=your_jwt_secret_key_here
```

## Git Workflow

### Commit Messages

```
Good commit messages:
- Add user authentication with JWT
- Fix bargain validation logic
- Update product schema with new fields
- Refactor seller controller for better error handling

Bad commit messages:
- fix bug
- update
- changes
```

### Branch Strategy

```
main          - Production-ready code
develop       - Development branch
feature/*     - New features
bugfix/*      - Bug fixes
hotfix/*      - Urgent production fixes
```

## Performance Optimization

### Backend

1. **Use caching**
```javascript
// Cache frequently accessed data
const cachedData = await redis.get(key);
if (cachedData) return JSON.parse(cachedData);

const data = await fetchFromDB();
await redis.set(key, JSON.stringify(data), 'EX', 300);
```

2. **Optimize queries**
```javascript
// Use lean() for read-only operations
const products = await Product.find().lean();

// Use select() to limit fields
const products = await Product.find().select('name price');
```

3. **Use connection pooling**
```javascript
mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  minPoolSize: 5
});
```

### Frontend

1. **Code splitting**
```javascript
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
```

2. **Memoization**
```javascript
const MemoizedComponent = React.memo(ExpensiveComponent);
```

3. **Debouncing**
```javascript
const debouncedSearch = useMemo(
  () => debounce((term) => search(term), 300),
  []
);
```

## Documentation

### Code Comments

```javascript
// Good - Explain why, not what
// Auto-accept bargain if offer meets seller's minimum price
if (offerAmount >= product.sellerMinPrice) {
  bargain.status = 'accepted';
}

// Bad - Obvious comment
// Set status to accepted
bargain.status = 'accepted';
```

### API Documentation

```javascript
/**
 * Create a new bargain
 * @route POST /api/bargains
 * @access Private/Buyer
 * @param {string} productId - Product ID
 * @param {number} offerAmount - Buyer's offer amount
 * @returns {Object} Created bargain
 */
```

## Monitoring & Logging

### Structured Logging

```javascript
// Use structured logs
console.log({
  level: 'info',
  message: 'Bargain created',
  bargainId: bargain._id,
  buyerId: buyer._id,
  productId: product._id,
  timestamp: new Date()
});
```

### Error Tracking

```javascript
// Use error tracking service (e.g., Sentry)
Sentry.captureException(error, {
  user: { id: req.user.id },
  tags: { endpoint: req.path }
});
```

## Conclusion

Following these best practices ensures:
- ✅ Maintainable and readable code
- ✅ Secure and reliable application
- ✅ Optimal performance
- ✅ Easy debugging and troubleshooting
- ✅ Scalable architecture
- ✅ Good developer experience

Always prioritize:
1. Security
2. Code quality
3. Performance
4. User experience
5. Documentation
