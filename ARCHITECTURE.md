# GAJABAI Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAJABAI Platform                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                 │         │                  │         │              │
│  React Client   │◄────────┤  Express Server  │◄────────┤   MongoDB    │
│   (Frontend)    │   API   │    (Backend)     │   ODM   │   Database   │
│                 │         │                  │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
        │                            │
        │                            │
        ├────────────────────────────┤
        │  JWT Authentication Token  │
        └────────────────────────────┘
```

## Technology Stack

### Frontend Layer
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.10.0
- **HTTP Client**: Axios 1.4.0
- **State Management**: React Context API
- **Styling**: Inline CSS (can be upgraded to styled-components or Tailwind)

### Backend Layer
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database ODM**: Mongoose 7.0.3
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Security**: 
  - bcryptjs 2.4.3 (password hashing)
  - helmet 7.0.0 (security headers)
  - cors 2.8.5 (CORS protection)
  - express-rate-limit 6.7.0 (rate limiting)
  - express-validator 7.0.1 (input validation)

### Database Layer
- **Database**: MongoDB
- **Schema**: 5 collections (Users, Categories, Products, Bargains, Orders)

## Database Schema Design

### Collections and Relationships

```
┌───────────────┐
│     Users     │
│  - admin      │
│  - seller     │──┐
│  - buyer      │  │
└───────────────┘  │
                   │
┌───────────────┐  │  ┌─────────────────┐
│  Categories   │◄─┼──┤    Products     │
└───────────────┘  │  │ - adminMinPrice │
                   │  │ - adminMaxPrice │
                   │  │ - displayPrice  │
                   └──┤ - sellerMinPrice│
                      └─────────────────┘
                               │
                               │
                      ┌────────▼─────────┐
                      │    Bargains      │
                      │ - currentOffer   │
                      │ - offerHistory   │
                      │ - status         │
                      └──────────────────┘
                               │
                               │
                      ┌────────▼─────────┐
                      │     Orders       │
                      │ - finalPrice     │
                      │ - totalAmount    │
                      └──────────────────┘
```

### Relationships
- User (seller) → Products (1:N)
- User (admin) → Categories (1:N)
- Category → Products (1:N)
- Product → Bargains (1:N)
- User (buyer) → Bargains (1:N)
- User (seller) → Bargains (1:N)
- Bargain → Order (1:1)

## API Architecture

### Layered Architecture

```
┌──────────────────────────────────────────┐
│            Client Layer                   │
│  React Components + Context API           │
└──────────────────────────────────────────┘
                    │
                    │ HTTP/HTTPS
                    ▼
┌──────────────────────────────────────────┐
│          API Gateway Layer                │
│  Express Server + Middleware              │
│  - CORS                                   │
│  - Rate Limiting                          │
│  - Security Headers (Helmet)              │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│       Authentication Layer                │
│  JWT Verification + Role Authorization    │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│          Controller Layer                 │
│  Business Logic + Validation              │
│  - authController                         │
│  - adminController                        │
│  - sellerController                       │
│  - buyerController                        │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│          Model Layer                      │
│  Mongoose Models + Schema Validation      │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│          Database Layer                   │
│  MongoDB (Atlas or Local)                 │
└──────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                           ┌──────────┐
│  Client  │                           │  Server  │
└────┬─────┘                           └────┬─────┘
     │                                      │
     │  1. POST /api/auth/login             │
     │  { email, password }                 │
     ├──────────────────────────────────────>
     │                                      │
     │                           2. Validate credentials
     │                              Hash comparison
     │                                      │
     │  3. Return JWT token                 │
     │  { token, user }                     │
     │◄──────────────────────────────────────
     │                                      │
     │  4. Store token in localStorage      │
     │                                      │
     │  5. GET /api/protected               │
     │  Authorization: Bearer <token>       │
     ├──────────────────────────────────────>
     │                                      │
     │                           6. Verify JWT
     │                              Decode & validate
     │                                      │
     │  7. Return protected data            │
     │◄──────────────────────────────────────
     │                                      │
```

## Bargaining Workflow

```
┌─────────┐              ┌─────────┐              ┌─────────┐
│  Buyer  │              │  System │              │ Seller  │
└────┬────┘              └────┬────┘              └────┬────┘
     │                        │                        │
     │ 1. Browse products     │                        │
     ├───────────────────────>│                        │
     │                        │                        │
     │ 2. Make offer          │                        │
     │ (within min-max range) │                        │
     ├───────────────────────>│                        │
     │                        │                        │
     │                   3. Validate offer             │
     │                   Check admin limits            │
     │                   Check bargaining enabled      │
     │                        │                        │
     │                   4. Auto-accept?               │
     │                   (offer >= seller min)         │
     │                        │                        │
     │         YES            │           NO           │
     │                        │                        │
     │ 5a. Accept & notify    │    5b. Notify seller   │
     │◄───────────────────────┤───────────────────────>│
     │                        │                        │
     │                        │    6. Seller action    │
     │                        │    (accept/reject/     │
     │                        │     counter)           │
     │                        │◄───────────────────────┤
     │                        │                        │
     │ 7. If countered,       │                        │
     │    buyer can counter   │                        │
     │    again               │                        │
     ├───────────────────────>│                        │
     │                        │                        │
     │    (Loop until accepted, rejected, or expired)  │
     │                        │                        │
     │ 8. Create order        │                        │
     │    (if accepted)       │                        │
     ├───────────────────────>│                        │
     │                        │                        │
     │                   9. Update stock               │
     │                   Create order record           │
     │                        │                        │
```

## Security Architecture

### Defense Layers

```
┌──────────────────────────────────────────────────┐
│           Layer 1: Network Security              │
│  - HTTPS/SSL                                     │
│  - Firewall rules                                │
│  - DDoS protection                               │
└──────────────────────────────────────────────────┘
                    │
┌──────────────────────────────────────────────────┐
│        Layer 2: Application Security             │
│  - Helmet (security headers)                     │
│  - CORS configuration                            │
│  - Rate limiting                                 │
└──────────────────────────────────────────────────┘
                    │
┌──────────────────────────────────────────────────┐
│       Layer 3: Authentication Security           │
│  - JWT tokens                                    │
│  - Password hashing (bcrypt)                     │
│  - Token expiration                              │
└──────────────────────────────────────────────────┘
                    │
┌──────────────────────────────────────────────────┐
│       Layer 4: Authorization Security            │
│  - Role-based access control                     │
│  - Resource ownership validation                 │
│  - Action permission checks                      │
└──────────────────────────────────────────────────┘
                    │
┌──────────────────────────────────────────────────┐
│          Layer 5: Data Security                  │
│  - Input validation                              │
│  - Schema validation                             │
│  - Price validation                              │
│  - Business logic validation                     │
└──────────────────────────────────────────────────┘
                    │
┌──────────────────────────────────────────────────┐
│        Layer 6: Database Security                │
│  - MongoDB authentication                        │
│  - Network restrictions                          │
│  - Encrypted connections                         │
│  - Regular backups                               │
└──────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
                    ┌──────────────┐
                    │ Load Balancer│
                    └───────┬──────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼─────┐   ┌─────▼──────┐   ┌────▼───────┐
    │ Server 1   │   │ Server 2   │   │ Server 3   │
    │ (Node.js)  │   │ (Node.js)  │   │ (Node.js)  │
    └──────┬─────┘   └─────┬──────┘   └────┬───────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                    ┌───────▼──────┐
                    │   MongoDB    │
                    │   Cluster    │
                    └──────────────┘
```

### Caching Strategy

```
┌─────────┐         ┌──────────┐         ┌──────────┐
│ Client  │────────>│  Redis   │────────>│  Server  │
│         │         │  Cache   │         │          │
└─────────┘         └──────────┘         └─────┬────┘
                                               │
                                         ┌─────▼────┐
                                         │ MongoDB  │
                                         └──────────┘

Cache Strategy:
- Product listings (5 min TTL)
- Categories (15 min TTL)
- User sessions (30 min TTL)
```

## Performance Optimization

### Database Optimization
- **Indexes**: Created on frequently queried fields
  - Users: email (unique)
  - Products: seller, category, status
  - Bargains: buyer, seller, product, status
  - Orders: buyer, seller, status

### API Optimization
- Pagination for list endpoints
- Field selection to reduce payload
- Response compression (gzip)
- Efficient queries (populate only needed fields)

### Frontend Optimization
- Code splitting
- Lazy loading of routes
- Memoization of expensive computations
- Debouncing of search inputs

## Monitoring & Logging

### Key Metrics to Monitor

```
Application Metrics:
├── Response time
├── Error rate
├── Request rate
└── Active users

Business Metrics:
├── Total bargains
├── Accepted bargain rate
├── Average discount
├── Products listed
└── Orders created

System Metrics:
├── CPU usage
├── Memory usage
├── Database connections
├── Disk space
└── Network I/O
```

## Deployment Architecture

### Production Environment

```
                    ┌──────────────┐
                    │     CDN      │
                    │  (Vercel)    │
                    └───────┬──────┘
                            │
                    ┌───────▼──────┐
                    │   Frontend   │
                    │    (React)   │
                    └───────┬──────┘
                            │
                         HTTPS
                            │
                    ┌───────▼──────┐
                    │    Backend   │
                    │  (Railway/   │
                    │   Heroku)    │
                    └───────┬──────┘
                            │
                    ┌───────▼──────┐
                    │   MongoDB    │
                    │    Atlas     │
                    └──────────────┘
```

## Future Enhancements

### Phase 2 Features
1. Real-time notifications (Socket.IO)
2. Product reviews and ratings
3. Image upload functionality
4. Advanced search and filters
5. Payment gateway integration
6. Order tracking
7. Email notifications
8. Admin analytics dashboard
9. Seller analytics
10. Bulk product upload

### Phase 3 Features
1. AI-powered price suggestions
2. Chatbot for customer support
3. Mobile app (React Native)
4. Multi-language support
5. Multi-currency support
6. Advanced reporting
7. Inventory management
8. Shipping integration
9. Wishlist functionality
10. Social media integration

## Conclusion

The GAJABAI platform is built with a solid, scalable architecture that prioritizes:
- **Security**: Multiple layers of protection
- **Maintainability**: Clear separation of concerns
- **Scalability**: Horizontal scaling capabilities
- **Performance**: Optimized queries and caching
- **Reliability**: Error handling and validation

The modular design allows for easy feature additions and modifications while maintaining code quality and security standards.
