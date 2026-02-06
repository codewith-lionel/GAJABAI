import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Products from './pages/Products';
import MyBargains from './pages/MyBargains';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/admin" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/seller" 
              element={
                <PrivateRoute requiredRole="seller">
                  <SellerDashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/products" 
              element={
                <PrivateRoute requiredRole="buyer">
                  <Products />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/my-bargains" 
              element={
                <PrivateRoute requiredRole="buyer">
                  <MyBargains />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
