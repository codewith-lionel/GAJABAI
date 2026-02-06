import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Welcome to GAJABAI</h1>
        <p style={styles.subtitle}>E-commerce Platform with Smart Bargaining System</p>
        
        {!isAuthenticated ? (
          <div style={styles.actions}>
            <Link to="/register" style={{ ...styles.button, ...styles.primaryButton }}>
              Get Started
            </Link>
            <Link to="/login" style={{ ...styles.button, ...styles.secondaryButton }}>
              Login
            </Link>
          </div>
        ) : (
          <div style={styles.dashboard}>
            <h2 style={styles.welcomeText}>Welcome back, {user?.name}!</h2>
            <div style={styles.dashboardLinks}>
              {user?.role === 'admin' && (
                <Link to="/admin" style={styles.dashboardLink}>
                  Go to Admin Dashboard →
                </Link>
              )}
              {user?.role === 'seller' && (
                <Link to="/seller" style={styles.dashboardLink}>
                  Go to Seller Dashboard →
                </Link>
              )}
              {user?.role === 'buyer' && (
                <Link to="/products" style={styles.dashboardLink}>
                  Browse Products →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>Key Features</h2>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <h3>Smart Bargaining</h3>
            <p>Negotiate prices directly with sellers within admin-defined limits</p>
          </div>
          <div style={styles.featureCard}>
            <h3>Role-Based Access</h3>
            <p>Separate dashboards for Admin, Seller, and Buyer users</p>
          </div>
          <div style={styles.featureCard}>
            <h3>Price Controls</h3>
            <p>Admin-controlled minimum and maximum pricing for all products</p>
          </div>
          <div style={styles.featureCard}>
            <h3>Secure Platform</h3>
            <p>JWT authentication and role-based authorization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  hero: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    color: '#ecf0f1'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem'
  },
  button: {
    padding: '1rem 2rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: '500',
    transition: 'transform 0.2s'
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: '#fff'
  },
  secondaryButton: {
    backgroundColor: '#fff',
    color: '#2c3e50'
  },
  dashboard: {
    marginTop: '2rem'
  },
  welcomeText: {
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  dashboardLinks: {
    marginTop: '1.5rem'
  },
  dashboardLink: {
    color: '#3498db',
    backgroundColor: '#fff',
    padding: '1rem 2rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '1.1rem',
    display: 'inline-block'
  },
  features: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '4rem 2rem'
  },
  featuresTitle: {
    textAlign: 'center',
    fontSize: '2rem',
    color: '#2c3e50',
    marginBottom: '2rem'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem'
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  }
};

export default Home;
