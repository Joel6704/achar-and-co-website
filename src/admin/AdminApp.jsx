import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getCurrentAdmin, onAuthStateChange, signOutAdmin } from '../lib/api';

import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminProducts from './pages/AdminProducts';
import AdminProductEditor from './pages/AdminProductEditor';
import AdminProductCategories from './pages/AdminProductCategories';
import AdminSettings from './pages/AdminSettings';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AdminApp() {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Initial session check
    getCurrentAdmin().then(user => {
      setAdminUser(user);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const unsubscribe = onAuthStateChange(user => {
      setAdminUser(user);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOutAdmin();
    setAdminUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f8f6f0',
        color: '#12281a',
        fontFamily: 'Playfair Display, serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏺</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Achar &amp; Co. Kitchen CMS</h2>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px', color: '#645a4e', marginTop: '6px' }}>
            Verifying secure credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ adminUser, setAdminUser, handleLogout }}>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/admin/login" 
          element={adminUser ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={adminUser ? <AdminLayout /> : <Navigate to="/admin/login" state={{ from: location }} replace />}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          
          {/* Product Management Routes */}
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductEditor />} />
          <Route path="products/edit/:id" element={<AdminProductEditor />} />
          <Route path="categories" element={<AdminProductCategories />} />

          {/* Store Settings Route */}
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch all fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}
