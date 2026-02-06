const {
  validateBuyerOffer,
  validateSellerCounter,
  shouldAutoAccept,
  calculateExpiryDate
} = require('../utils/validation');

// Mock Product model
jest.mock('../models/Product');
const Product = require('../models/Product');

describe('Validation Utils', () => {
  describe('validateBuyerOffer', () => {
    test('should reject offer below admin minimum price', async () => {
      const mockProduct = {
        _id: 'product1',
        adminMinPrice: 100,
        adminMaxPrice: 200,
        displayPrice: 180,
        bargainingEnabled: true
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await validateBuyerOffer('product1', 50);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 100');
    });

    test('should reject offer above display price', async () => {
      const mockProduct = {
        _id: 'product1',
        adminMinPrice: 100,
        adminMaxPrice: 200,
        displayPrice: 180,
        bargainingEnabled: true
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await validateBuyerOffer('product1', 250);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('cannot exceed display price');
    });

    test('should reject offer on product with bargaining disabled', async () => {
      const mockProduct = {
        _id: 'product1',
        adminMinPrice: 100,
        adminMaxPrice: 200,
        displayPrice: 180,
        bargainingEnabled: false
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await validateBuyerOffer('product1', 150);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('not enabled');
    });

    test('should accept valid offer', async () => {
      const mockProduct = {
        _id: 'product1',
        adminMinPrice: 100,
        adminMaxPrice: 200,
        displayPrice: 180,
        bargainingEnabled: true
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await validateBuyerOffer('product1', 150);
      
      expect(result.valid).toBe(true);
      expect(result.product).toBeDefined();
    });
  });

  describe('validateSellerCounter', () => {
    test('should reject counter below seller minimum price', async () => {
      const mockProduct = {
        _id: 'product1',
        sellerMinPrice: 120,
        displayPrice: 180
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await validateSellerCounter('product1', 100);
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 120');
    });

    test('should accept valid counter', async () => {
      const mockProduct = {
        _id: 'product1',
        sellerMinPrice: 120,
        displayPrice: 180
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await validateSellerCounter('product1', 150);
      
      expect(result.valid).toBe(true);
      expect(result.product).toBeDefined();
    });
  });

  describe('shouldAutoAccept', () => {
    test('should auto-accept offer at or above seller minimum', async () => {
      const mockProduct = {
        _id: 'product1',
        sellerMinPrice: 120
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await shouldAutoAccept('product1', 120);
      expect(result).toBe(true);
      
      const result2 = await shouldAutoAccept('product1', 150);
      expect(result2).toBe(true);
    });

    test('should not auto-accept offer below seller minimum', async () => {
      const mockProduct = {
        _id: 'product1',
        sellerMinPrice: 120
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      
      const result = await shouldAutoAccept('product1', 100);
      expect(result).toBe(false);
    });
  });

  describe('calculateExpiryDate', () => {
    test('should calculate expiry date correctly', () => {
      const originalEnv = process.env.BARGAIN_EXPIRY_HOURS;
      process.env.BARGAIN_EXPIRY_HOURS = '24';
      
      const expiryDate = calculateExpiryDate();
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Allow 1 second difference for test execution time
      expect(Math.abs(expiryDate - expectedExpiry)).toBeLessThan(1000);
      
      process.env.BARGAIN_EXPIRY_HOURS = originalEnv;
    });

    test('should use default 24 hours if not configured', () => {
      const originalEnv = process.env.BARGAIN_EXPIRY_HOURS;
      delete process.env.BARGAIN_EXPIRY_HOURS;
      
      const expiryDate = calculateExpiryDate();
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      expect(Math.abs(expiryDate - expectedExpiry)).toBeLessThan(1000);
      
      process.env.BARGAIN_EXPIRY_HOURS = originalEnv;
    });
  });
});
