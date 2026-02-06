import React, { useEffect, useState } from 'react';
import { adminService } from '../services';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, categoriesRes] = await Promise.all([
        adminService.getBargainAnalytics(),
        adminService.getCategories()
      ]);
      setAnalytics(analyticsRes.data.data);
      setCategories(categoriesRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Bargain Analytics</h2>
        {analytics && (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3>Total Bargains</h3>
              <p style={styles.stat}>{analytics.totalBargains}</p>
            </div>
            <div style={styles.card}>
              <h3>Accepted</h3>
              <p style={styles.stat}>{analytics.acceptedBargains}</p>
            </div>
            <div style={styles.card}>
              <h3>Rejected</h3>
              <p style={styles.stat}>{analytics.rejectedBargains}</p>
            </div>
            <div style={styles.card}>
              <h3>Avg Discount</h3>
              <p style={styles.stat}>{analytics.avgDiscountPercentage}%</p>
            </div>
          </div>
        )}
      </div>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Categories</h2>
        <div style={styles.list}>
          {categories.map((category) => (
            <div key={category._id} style={styles.listItem}>
              <strong>{category.name}</strong>
              <p>{category.description}</p>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  stat: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3498db',
    margin: '0.5rem 0'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  listItem: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }
};

export default AdminDashboard;
