import React, { useEffect, useState } from 'react';
import { buyerService } from '../services';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await buyerService.getProducts();
      setProducts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleBargain = async (product) => {
    setSelectedProduct(product);
    setOfferAmount('');
    setMessage('');
  };

  const submitBargain = async (e) => {
    e.preventDefault();
    try {
      const response = await buyerService.createBargain({
        productId: selectedProduct._id,
        offerAmount: parseFloat(offerAmount)
      });
      setMessage(response.data.message || 'Bargain submitted successfully!');
      setTimeout(() => {
        setSelectedProduct(null);
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting bargain');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Browse Products</h1>
      
      <div style={styles.grid}>
        {products.map((product) => (
          <div key={product._id} style={styles.card}>
            <h3>{product.name}</h3>
            <p style={styles.description}>{product.description}</p>
            <p style={styles.price}>₹{product.displayPrice}</p>
            <p>Category: {product.category?.name}</p>
            <p>Seller: {product.seller?.name}</p>
            {product.bargainingEnabled ? (
              <button 
                onClick={() => handleBargain(product)}
                style={styles.button}
              >
                Make an Offer
              </button>
            ) : (
              <p style={styles.noBargain}>Bargaining not available</p>
            )}
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Make an Offer for {selectedProduct.name}</h2>
            <p>Display Price: ₹{selectedProduct.displayPrice}</p>
            <p>Min Price: ₹{selectedProduct.adminMinPrice}</p>
            
            {message && <div style={styles.message}>{message}</div>}
            
            <form onSubmit={submitBargain}>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter your offer"
                min={selectedProduct.adminMinPrice}
                max={selectedProduct.displayPrice}
                style={styles.input}
                required
              />
              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitButton}>
                  Submit Offer
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    marginBottom: '2rem'
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  description: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    marginBottom: '1rem'
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#27ae60',
    margin: '0.5rem 0'
  },
  button: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
    width: '100%'
  },
  noBargain: {
    color: '#e74c3c',
    marginTop: '1rem',
    fontStyle: 'italic'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%'
  },
  message: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginBottom: '1rem'
  },
  modalActions: {
    display: 'flex',
    gap: '1rem'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Products;
