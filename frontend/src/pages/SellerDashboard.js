import React, { useEffect, useState } from 'react';
import { sellerService } from '../services';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, bargainsRes] = await Promise.all([
        sellerService.getProducts(),
        sellerService.getBargains()
      ]);
      setProducts(productsRes.data.data);
      setBargains(bargainsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (bargainId) => {
    try {
      await sellerService.acceptBargain(bargainId);
      fetchData();
    } catch (error) {
      console.error('Error accepting bargain:', error);
    }
  };

  const handleReject = async (bargainId) => {
    try {
      await sellerService.rejectBargain(bargainId);
      fetchData();
    } catch (error) {
      console.error('Error rejecting bargain:', error);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Seller Dashboard</h1>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Products ({products.length})</h2>
        <div style={styles.grid}>
          {products.map((product) => (
            <div key={product._id} style={styles.card}>
              <h3>{product.name}</h3>
              <p>Display Price: ₹{product.displayPrice}</p>
              <p>Stock: {product.stock}</p>
              <p>Status: {product.status}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Bargain Requests ({bargains.length})</h2>
        <div style={styles.list}>
          {bargains.map((bargain) => (
            <div key={bargain._id} style={styles.bargainCard}>
              <div>
                <strong>{bargain.product?.name}</strong>
                <p>Buyer: {bargain.buyer?.name}</p>
                <p>Offer: ₹{bargain.currentOffer}</p>
                <p>Status: {bargain.status}</p>
              </div>
              {bargain.status === 'pending' && (
                <div style={styles.actions}>
                  <button 
                    onClick={() => handleAccept(bargain._id)}
                    style={{ ...styles.button, ...styles.acceptButton }}
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleReject(bargain._id)}
                    style={{ ...styles.button, ...styles.rejectButton }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
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
  section: {
    marginBottom: '3rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#34495e',
    marginBottom: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  bargainCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actions: {
    display: 'flex',
    gap: '0.5rem'
  },
  button: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#fff'
  },
  acceptButton: {
    backgroundColor: '#27ae60'
  },
  rejectButton: {
    backgroundColor: '#e74c3c'
  }
};

export default SellerDashboard;
