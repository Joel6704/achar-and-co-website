import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchProductCategories, updateProduct, deleteProduct } from '../../lib/api';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Filter,
  Star,
  Edit3,
  Trash2,
  ExternalLink,
  Tag,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts({
          categoryId: categoryFilter,
          status: statusFilter === 'Draft' || statusFilter === 'Active' || statusFilter === 'Inactive' ? statusFilter : 'All',
          availability: statusFilter === 'Out of Stock' || statusFilter === 'In Stock' ? statusFilter : 'All',
          search: searchTerm,
          sortBy
        }),
        fetchProductCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleFeatured = async (product) => {
    try {
      setActionLoadingId(product.id);
      const updatedValue = !product.is_featured;
      await updateProduct(product.id, { is_featured: updatedValue });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: updatedValue } : p));
    } catch (err) {
      alert('Failed to update featured status: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      setActionLoadingId(product.id);
      const newStatus = product.product_status === 'Active' ? 'Draft' : 'Active';
      await updateProduct(product.id, { product_status: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, product_status: newStatus } : p));
    } catch (err) {
      alert('Failed to update product status: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"? This action cannot be reversed.`)) {
      return;
    }

    try {
      setActionLoadingId(product.id);
      await deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics calculation
  const totalCount = products.length;
  const activeCount = products.filter(p => p.product_status === 'Active').length;
  const outOfStockCount = products.filter(p => p.availability_status === 'Out of Stock').length;
  const draftCount = products.filter(p => p.product_status === 'Draft').length;

  return (
    <div>
      {/* Top Banner / Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '26px',
            color: '#12281a',
            fontWeight: 700,
            marginBottom: '4px'
          }}>
            Pickle Catalogue Management
          </h1>
          <p style={{ fontSize: '13px', color: '#645a4e' }}>
            Manage pricing, Kerala heritage pickle descriptions, pack sizes, images and stock availability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/categories" className="btn btn-outline btn-sm">
            <Tag size={15} />
            <span>Manage Categories</span>
          </Link>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Mini Overview Counters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(18, 40, 26, 0.08)',
            display: 'grid',
            placeItems: 'center',
            color: '#12281a'
          }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#7a7062', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Listed</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#12281a' }}>{totalCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(29, 138, 74, 0.1)',
            display: 'grid',
            placeItems: 'center',
            color: '#1d8a4a'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#7a7062', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active on Store</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d8a4a' }}>{activeCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(217, 83, 79, 0.1)',
            display: 'grid',
            placeItems: 'center',
            color: '#c9302c'
          }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#7a7062', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Out of Stock</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#c9302c' }}>{outOfStockCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(199, 141, 31, 0.1)',
            display: 'grid',
            placeItems: 'center',
            color: '#c78d1f'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#7a7062', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Drafts</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#c78d1f' }}>{draftCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flexGrow: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="search"
                className="form-control"
                style={{ paddingLeft: '34px', fontSize: '13px' }}
                placeholder="Search pickle name, spices, ingredients..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#8e8273' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} style={{ color: '#8e8273' }} />
              <select
                className="form-control"
                style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status / Stock Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: '#8e8273' }} />
              <select
                className="form-control"
                style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Draft">Draft Only</option>
                <option value="In Stock">In Stock Only</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Sort Order */}
            <select
              className="form-control"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '12px' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #ede8dc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <b style={{ fontSize: '13px', color: '#12281a' }}>
            Catalogue List ({products.length} product{products.length === 1 ? '' : 's'})
          </b>
          {(categoryFilter !== 'All' || statusFilter !== 'All' || searchTerm) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => {
                setCategoryFilter('All');
                setStatusFilter('All');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#645a4e' }}>
            <p>Loading pickle products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8e8273' }}>
            <ShoppingBag size={40} style={{ margin: '0 auto 12px', color: '#c78d1f' }} />
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#12281a', marginBottom: '6px' }}>
              No Products Found
            </h3>
            <p style={{ fontSize: '13px', marginBottom: '16px' }}>
              No pickles match your current filter or search criteria.
            </p>
            <Link to="/admin/products/new" className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>Add New Product</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>★</th>
                  <th style={{ width: '70px' }}>Image</th>
                  <th>Product Name &amp; Heritage</th>
                  <th>Category</th>
                  <th>Price &amp; Pack</th>
                  <th>Availability</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prod => {
                  const hasDiscount = prod.discount_price && Number(prod.discount_price) < Number(prod.regular_price);
                  const isOutOfStock = prod.availability_status === 'Out of Stock';

                  return (
                    <tr key={prod.id}>
                      {/* Featured Star Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          title={prod.is_featured ? 'Featured on Home (Click to remove)' : 'Click to feature on Home page'}
                          onClick={() => handleToggleFeatured(prod)}
                          disabled={actionLoadingId === prod.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: prod.is_featured ? '#c78d1f' : '#d5cfc4',
                            padding: '4px',
                            display: 'inline-flex',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <Star
                            size={18}
                            fill={prod.is_featured ? '#c78d1f' : 'transparent'}
                          />
                        </button>
                      </td>

                      {/* Product Thumbnail */}
                      <td>
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#f2ece1',
                          border: '1px solid #e5ded2',
                          position: 'relative'
                        }}>
                          <img
                            src={prod.primary_image || (prod.images && prod.images[0]?.image_url) || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300'}
                            alt={prod.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300';
                            }}
                          />
                          {prod.images && prod.images.length > 1 && (
                            <span style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              background: 'rgba(18,40,26,0.85)',
                              color: '#fff',
                              fontSize: '9px',
                              padding: '1px 3px',
                              borderRadius: '3px',
                              fontWeight: 600
                            }}>
                              +{prod.images.length}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product Name & Details */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#12281a', fontSize: '14px', marginBottom: '2px' }}>
                          <Link
                            to={`/admin/products/edit/${prod.id}`}
                            style={{ color: '#12281a', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#c78d1f'}
                            onMouseLeave={e => e.currentTarget.style.color = '#12281a'}
                          >
                            {prod.name}
                          </Link>
                          {prod.is_featured && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              marginLeft: '6px',
                              fontSize: '10px',
                              color: '#c78d1f',
                              fontWeight: 600,
                              background: 'rgba(199, 141, 31, 0.12)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              <Sparkles size={10} /> Featured
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8a7d6e', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.short_description || 'Authentic Kerala heirloom pickle preparation'}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          color: '#12281a',
                          background: '#f2ece1',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontWeight: 500
                        }}>
                          {prod.category_name || 'Pickle'}
                        </span>
                      </td>

                      {/* Pricing & Pack */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          {hasDiscount ? (
                            <>
                              <span style={{ fontWeight: 700, color: '#12281a', fontSize: '14px' }}>
                                ₹{prod.discount_price}
                              </span>
                              <span style={{ fontSize: '12px', color: '#998d7f', textDecoration: 'line-through' }}>
                                ₹{prod.regular_price}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontWeight: 700, color: '#12281a', fontSize: '14px' }}>
                              ₹{prod.regular_price || 0}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#8a7d6e', marginTop: '2px' }}>
                          Pack: <strong>{prod.pack_size || '250g'}</strong>
                        </div>
                      </td>

                      {/* Stock Availability */}
                      <td>
                        <span className={`status-pill ${isOutOfStock ? 'pill-rejected' : 'pill-completed'
                          }`}>
                          {prod.availability_status || 'In Stock'}
                        </span>
                      </td>

                      {/* Visibility Status */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(prod)}
                          title={`Click to switch to ${prod.product_status === 'Active' ? 'Draft' : 'Active'}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <span className={`status-pill ${prod.product_status === 'Active' ? 'pill-completed' : 'pill-in-progress'
                            }`}>
                            {prod.product_status || 'Active'}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Edit Product"
                            style={{ padding: '6px 8px' }}
                            onClick={() => navigate(`/admin/products/edit/${prod.id}`)}
                          >
                            <Edit3 size={14} />
                          </button>

                          <a
                            href={`/products.html#${prod.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            title="View on Storefront"
                            style={{ padding: '6px 8px', color: '#645a4e' }}
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Delete Product"
                            style={{ padding: '6px 8px', color: '#c9302c', borderColor: '#f0d3d1' }}
                            onClick={() => handleDeleteProduct(prod)}
                            disabled={actionLoadingId === prod.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

}

