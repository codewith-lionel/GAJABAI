import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>GAJABAI</Link>
        
        <div style={styles.menu}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
            </>
          ) : (
            <>
              <span style={styles.userName}>Welcome, {user?.name}</span>
              {user?.role === 'admin' && (
                <Link to="/admin" style={styles.link}>Admin Dashboard</Link>
              )}
              {user?.role === 'seller' && (
                <Link to="/seller" style={styles.link}>Seller Dashboard</Link>
              )}
              {user?.role === 'buyer' && (
                <>
                  <Link to="/products" style={styles.link}>Products</Link>
                  <Link to="/my-bargains" style={styles.link}>My Bargains</Link>
                </>
              )}
              <button onClick={logout} style={styles.button}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#2c3e50',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem'
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none'
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  userName: {
    color: '#ecf0f1',
    fontSize: '0.9rem'
  },
  button: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default Navbar;
