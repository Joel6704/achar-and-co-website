import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchEnquiries, updateProduct } from '../../lib/api';
import {
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  Inbox,
  PlusCircle,
  PenTool,
  Eye,
  Star,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prods, enqs] = await Promise.all([
        fetchProducts(),
        fetchEnquiries()
      ]);
      setProducts(prods);
      setEnquiries(enqs);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dashboard Overview Cards specified by prompt:
  // 1. Total Products
  // 2. Active Products
  // 3. Out of Stock Products
  // 4. Draft Products
  // 5. Total Enquiries
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.product_status === 'Active' && p.availability_status !== 'Out of Stock').length;
  const outOfStockProducts = products.filter(p => p.availability_status === 'Out of Stock').length;
  const draftProducts = products.filter(p => p.product_status === 'Draft').length;
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter(e => e.status === 'New').length;

  const recentProducts = products.slice(0, 6);
  const recentEnquiries = enquiries.slice(0, 4);

  const toggleFeatured = async (product) => {
    const updated = !product.is_featured;
    await updateProduct(product.id, { is_featured: updated });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: updated } : p));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#645a4e' }}>
        <p>Loading product management overview...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #12281a 0%, #193824 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '24px 28px',
        marginBottom: '28px',
        border: '1px solid rgba(199, 141, 31, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#f2b545', fontWeight: 700 }}>
            Kitchen Catalogue &bull; Achar &amp; Co.
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
            Product Management &amp; Inventory Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: '#c9d6ce', margin: '4px 0 0', maxWidth: '620px' }}>
            Manage Kerala heritage pickle batches, customize pack sizes and pricing, track availability, and process customer WhatsApp orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/products/new" className="btn btn-gold btn-sm">
            <PlusCircle size={15} />
            <span>Add New Product</span>
          </Link>
          <Link to="/admin/categories" className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            <Tag size={14} />
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* 5 Product Management Dashboard Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon gold">
            <ShoppingBag size={22} />
          </div>
          <div className="metric-info">
            <h4>Total Products</h4>
            <div className="metric-value">{totalProducts}</div>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid #16a34a' }}>
          <div className="metric-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-info">
            <h4>Active Products</h4>
            <div className="metric-value" style={{ color: '#166534' }}>{activeProducts}</div>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: outOfStockProducts > 0 ? '3px solid #dc2626' : '1px solid #e6dfd1' }}>
          <div className="metric-icon red">
            <AlertTriangle size={22} />
          </div>
          <div className="metric-info">
            <h4>Out of Stock</h4>
            <div className="metric-value" style={{ color: outOfStockProducts > 0 ? '#991b1b' : '#12281a' }}>
              {outOfStockProducts}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon blue">
            <FileEdit size={22} />
          </div>
          <div className="metric-info">
            <h4>Draft Products</h4>
            <div className="metric-value">{draftProducts}</div>
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: newEnquiries > 0 ? '3px solid #d97706' : '1px solid #e6dfd1' }}>
          <div className="metric-icon gold" style={{ background: '#fef3c7', color: '#92400e' }}>
            <Inbox size={22} />
          </div>
          <div className="metric-info">
            <h4>Total Enquiries</h4>
            <div className="metric-value">
              {totalEnquiries} {newEnquiries > 0 && <small style={{ fontSize: '12px', color: '#b45309' }}>({newEnquiries} new)</small>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recently Added Products & Recent Enquiries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Products Table Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#12281a' }}>
                Recently Added / Active Products
              </h3>
              <p style={{ fontSize: '12px', color: '#645a4e', margin: 0 }}>
                Showing current pickle varieties in the catalogue
              </p>
            </div>
            <Link to="/admin/products" className="btn btn-outline btn-sm">
              <span>View All ({totalProducts})</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map(prod => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={prod.primary_image || prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100'}
                          alt={prod.name}
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ede8dc' }}
                        />
                        <div>
                          <b style={{ color: '#12281a', display: 'block', fontSize: '13px' }}>
                            {prod.name}
                          </b>
                          <small style={{ color: '#8e8273', fontSize: '10px' }}>
                            {prod.pack_size} &bull; /{prod.slug}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '11px', color: '#645a4e', fontWeight: 600, background: '#f8f6f0', padding: '2px 8px', borderRadius: '4px' }}>
                        {prod.category_name}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#12281a' }}>
                        ₹{prod.discount_price || prod.regular_price}
                        {prod.discount_price && (
                          <small style={{ color: '#8e8273', textDecoration: 'line-through', marginLeft: '5px', fontWeight: 400 }}>
                            ₹{prod.regular_price}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`status-pill ${prod.availability_status === 'Out of Stock' ? 'rejected' : 'completed'}`} style={{ fontSize: '10px' }}>
                        {prod.availability_status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          onClick={() => toggleFeatured(prod)}
                          title={prod.is_featured ? 'Featured Product (Click to unfeature)' : 'Mark as Featured'}
                          style={{ color: prod.is_featured ? '#c78d1f' : '#8e8273' }}
                        >
                          <Star size={14} fill={prod.is_featured ? '#c78d1f' : 'none'} />
                        </button>
                        <Link
                          to={`/admin/products/edit/${prod.id}`}
                          className="btn-icon"
                          title="Edit Product"
                        >
                          <PenTool size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enquiries Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#12281a' }}>
                Recent Customer Enquiries
              </h3>
              <p style={{ fontSize: '12px', color: '#645a4e', margin: 0 }}>
                Latest requests from contact &amp; bulk order forms
              </p>
            </div>
            <Link to="/admin/enquiries" className="btn btn-outline btn-sm">
              <span>All Enquiries</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#8e8273', textAlign: 'center', padding: '30px 0' }}>
              No customer enquiries received yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentEnquiries.map(enq => (
                <div
                  key={enq.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #ede8dc',
                    borderRadius: '6px',
                    background: '#fbfaf8',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
                      <b style={{ color: '#12281a', fontSize: '13px' }}>{enq.full_name}</b>
                      <span className={`status-pill ${enq.status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {enq.status}
                      </span>
                    </div>
                    <small style={{ color: '#645a4e', display: 'block', fontSize: '11px' }}>
                      📞 {enq.phone} &bull; {enq.subject || 'Enquiry'}
                    </small>
                    <p style={{
                      fontSize: '11px',
                      color: '#8e8273',
                      margin: '3px 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '300px'
                    }}>
                      "{enq.message}"
                    </p>
                  </div>
                  <Link to="/admin/enquiries" className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '11px', flexShrink: 0 }}>
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
