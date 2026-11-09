import React, { useState, useEffect } from 'react';
import { 
  fetchProductCategories, 
  createProductCategory, 
  updateProductCategory, 
  deleteProductCategory, 
  fetchProducts 
} from '../../lib/api';
import { 
  Tag, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Check, 
  Layers, 
  ShoppingBag,
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminProductCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add / Edit Modal / Inline form state
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');

  useEffect(() => {
    loadCategoriesAndProducts();
  }, []);

  const loadCategoriesAndProducts = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        fetchProductCategories(),
        fetchProducts()
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setErrorMessage('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryImageUrl(cat.image_url || '');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryImageUrl('');
    setErrorMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setErrorMessage('Please enter a category name.');
      return;
    }

    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingCategory) {
        const updated = await updateProductCategory(editingCategory.id, {
          name: categoryName.trim(),
          image_url: categoryImageUrl.trim() || null
        });
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? updated : c));
        setSuccessMessage(`Category "${updated.name}" updated successfully.`);
      } else {
        const created = await createProductCategory({
          name: categoryName.trim(),
          image_url: categoryImageUrl.trim() || null
        });
        setCategories(prev => [...prev, created]);
        setSuccessMessage(`Category "${created.name}" created successfully.`);
      }
      cancelEdit();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Save category error:', err);
      setErrorMessage(err.message || 'Error saving category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    // Check local product association first
    const assignedProducts = products.filter(p => p.category_id === cat.id);
    if (assignedProducts.length > 0) {
      alert(`Cannot delete category "${cat.name}". There are ${assignedProducts.length} product(s) assigned to it:\n${assignedProducts.map(p => `• ${p.name}`).join('\n')}\n\nPlease reassign these products before deleting this category.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    setActionLoading(true);
    setErrorMessage('');
    try {
      await deleteProductCategory(cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      setSuccessMessage(`Category "${cat.name}" was removed.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Page Title */}
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
            Product Categories
          </h1>
          <p style={{ fontSize: '13px', color: '#645a4e' }}>
            Organize Kerala pickles into collections (Mango, Lemon, Special, Seafood, etc.)
          </p>
        </div>

        <Link to="/admin/products" className="btn btn-outline btn-sm">
          <ShoppingBag size={15} />
          <span>View All Products</span>
        </Link>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div style={{
          background: '#fdf3f2',
          border: '1px solid #f5c2c0',
          color: '#c9302c',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          background: '#f0f9f4',
          border: '1px solid #c2e8d3',
          color: '#1d8a4a',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px'
        }}>
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 2fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Add / Edit Category Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '18px',
            color: '#12281a',
            marginBottom: '16px',
            paddingBottom: '10px',
            borderBottom: '1px solid #ede8dc',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {editingCategory ? <Edit3 size={18} color="#c78d1f" /> : <PlusCircle size={18} color="#c78d1f" />}
            {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Category Name <span style={{ color: '#c9302c' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mango Pickles, Seafood Pickles"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Banner / Cover Image URL (Optional)
              </label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={categoryImageUrl}
                onChange={e => setCategoryImageUrl(e.target.value)}
              />
              <small style={{ fontSize: '11px', color: '#8e8273', marginTop: '4px', display: 'block' }}>
                Optional image used in storefront category cards.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Existing Categories List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #ede8dc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <b style={{ fontSize: '13px', color: '#12281a' }}>
              Available Categories ({categories.length})
            </b>
            <span style={{ fontSize: '12px', color: '#8e8273' }}>
              {products.length} Total Pickle Items
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#645a4e' }}>
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8e8273' }}>
              No categories created yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Assigned Pickles</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const assignedProds = products.filter(p => p.category_id === cat.id);
                    return (
                      <tr key={cat.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: '#f2ece1',
                              overflow: 'hidden',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#12281a',
                              flexShrink: 0
                            }}>
                              {cat.image_url ? (
                                <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Tag size={16} />
                              )}
                            </div>
                            <span style={{ fontWeight: 600, color: '#12281a', fontSize: '13px' }}>
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontSize: '11px', color: '#7a7062', background: '#f5f0e8', padding: '2px 6px', borderRadius: '4px' }}>
                            {cat.slug}
                          </code>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: assignedProds.length > 0 ? '#12281a' : '#8a7d6e'
                          }}>
                            {assignedProds.length} product{assignedProds.length === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Edit Category"
                              style={{ padding: '6px 8px' }}
                              onClick={() => startEdit(cat)}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Delete Category"
                              style={{ padding: '6px 8px', color: '#c9302c', borderColor: '#f0d3d1' }}
                              onClick={() => handleDelete(cat)}
                              disabled={actionLoading}
                            >
                              <Trash2 size={13} />
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
    </div>
  );
}

