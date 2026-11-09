import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AdminApp';
import { isConfigured } from '../../lib/supabase';
import { fetchEnquiries } from '../../lib/api';
import { 
  LayoutDashboard, 
  Inbox, 
  ShoppingBag, 
  PlusCircle, 
  Tag, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X
} from 'lucide-react';

export default function AdminLayout() {
  const { adminUser, handleLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newEnquiryCount, setNewEnquiryCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Load new enquiries badge count
  useEffect(() => {
    fetchEnquiries({ status: 'New' })
      .then(list => setNewEnquiryCount(list.length))
      .catch(() => {});
  }, [location.pathname]);

  // Determine page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/enquiries')) return 'Customer Enquiries';
    if (path.includes('/products/new')) return 'Add New Kerala Pickle';
    if (path.includes('/products/edit')) return 'Edit Product Details';
    if (path.includes('/products')) return 'Product Catalogue Management';
    if (path.includes('/categories')) return 'Product Categories';
    if (path.includes('/settings')) return 'Store & Supabase Settings';
    return 'Admin Dashboard';
  };

  const onLogoutClick = async () => {
    if (window.confirm('Are you sure you want to sign out of the Achar & Co. Admin panel?')) {
      await handleLogout();
      navigate('/admin/login');
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">a.</div>
          <div className="sidebar-brand-text">
            <h2>achar &amp; co.</h2>
            <span>Product CMS &bull; Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/enquiries" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Inbox size={18} />
            <span>Enquiries</span>
            {newEnquiryCount > 0 && (
              <span className="nav-badge">{newEnquiryCount} new</span>
            )}
          </NavLink>

          <NavLink 
            to="/admin/products" 
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink 
            to="/admin/products/new" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <PlusCircle size={18} />
            <span>Add New Product</span>
          </NavLink>

          <NavLink 
            to="/admin/categories" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Tag size={18} />
            <span>Product Categories</span>
          </NavLink>

          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">
              {(adminUser?.username || adminUser?.email || 'J')[0].toUpperCase()}
            </div>
            <div className="user-details">
              <b>{adminUser?.username || adminUser?.email || 'joel@123'}</b>
              <span>Authorized Admin</span>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-outline btn-sm" 
            style={{ width: '100%', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
            onClick={onLogoutClick}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="menu-btn" 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="admin-title-crumb">
              <h1>{getPageTitle()}</h1>
            </div>
          </div>

          <div className="header-right">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              background: isConfigured ? '#dcfce7' : '#fef3c7',
              color: isConfigured ? '#166534' : '#92400e'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isConfigured ? '#16a34a' : '#d97706',
                display: 'inline-block'
              }} />
              <span>{isConfigured ? 'Supabase Live' : 'Demo Local Storage'}</span>
            </div>

            <a 
              href="/products.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-public-site"
              title="View Public Storefront"
            >
              <span>View Storefront</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
