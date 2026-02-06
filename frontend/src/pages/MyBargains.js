import React, { useEffect, useState } from 'react';
import { buyerService } from '../services';

const MyBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBargains();
  }, []);

  const fetchBargains = async () => {
    try {
      const response = await buyerService.getMyBargains();
      setBargains(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bargains:', error);
      setLoading(false);
    }
  };

  const createOrder = async (bargainId) => {
    try {
      await buyerService.createOrder({ bargainId, quantity: 1 });
      alert('Order created successfully!');
      fetchBargains();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating order');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Bargains</h1>
      
      {bargains.length === 0 ? (
        <p style={styles.empty}>No bargains yet. Start browsing products!</p>
      ) : (
        <div style={styles.list}>
          {bargains.map((bargain) => (
            <div key={bargain._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{bargain.product?.name}</h3>
                <span style={getStatusStyle(bargain.status)}>
                  {bargain.status.toUpperCase()}
                </span>
              </div>
              
              <div style={styles.cardBody}>
                <p>Display Price: ₹{bargain.product?.displayPrice}</p>
                <p>Your Offer: ₹{bargain.currentOffer}</p>
                <p>Seller: {bargain.seller?.name}</p>
                <p>Attempts: {bargain.attemptCount} / {bargain.maxAttempts}</p>
                <p>Expires: {new Date(bargain.expiresAt).toLocaleString()}</p>
              </div>
              
              {bargain.offerHistory.length > 0 && (
                <div style={styles.history}>
                  <h4>Offer History:</h4>
                  {bargain.offerHistory.map((offer, index) => (
                    <div key={index} style={styles.historyItem}>
                      <span>{offer.offeredBy === 'buyer' ? 'You' : 'Seller'}</span>
                      <span>₹{offer.amount}</span>
                      <span>{new Date(offer.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {bargain.status === 'accepted' && (
                <button 
                  onClick={() => createOrder(bargain._id)}
                  style={styles.orderButton}
                >
                  Create Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  };
  
  const statusColors = {
    pending: { backgroundColor: '#f39c12', color: '#fff' },
    accepted: { backgroundColor: '#27ae60', color: '#fff' },
    rejected: { backgroundColor: '#e74c3c', color: '#fff' },
    expired: { backgroundColor: '#95a5a6', color: '#fff' },
    countered: { backgroundColor: '#3498db', color: '#fff' }
  };
  
  return { ...baseStyle, ...statusColors[status] };
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
  empty: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#7f8c8d'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #ecf0f1'
  },
  cardBody: {
    marginBottom: '1rem'
  },
  history: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem'
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e0e0e0'
  },
  orderButton: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem'
  }
};

export default MyBargains;
