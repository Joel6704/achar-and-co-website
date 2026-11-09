import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  fetchProductById, 
  createProduct, 
  updateProduct, 
  fetchProductCategories, 
  uploadProductImage 
} from '../../lib/api';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Trash2, 
  Star, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Info,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';

export default function AdminProductEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    regular_price: '',
    discount_price: '',
    pack_size: '250g',
    weight: '250g',
    short_description: '',
    description: '',
    ingredients: '',
    flavour_profile: '',
    storage_instructions: 'Store in a cool, dry place. Keep sealed and ensure oil covers surface.',
    shelf_life: '9 months from packaging date',
    allergen_information: 'Contains Sesame and Mustard seeds.',
    availability_status: 'In Stock',
    product_status: 'Active',
    is_featured: false
  });

  // Images state: Array of { id, image_url, storage_path, alt_text, is_primary }
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadCategoriesAndProduct();
  }, [id]);

  const loadCategoriesAndProduct = async () => {
    try {
      const cats = await fetchProductCategories();
      setCategories(cats);

      if (isEditing) {
        const prod = await fetchProductById(id);
        if (!prod) {
          setErrorMessage('Product not found.');
          setLoading(false);
          return;
        }

        setFormData({
          name: prod.name || '',
          slug: prod.slug || '',
          category_id: prod.category_id || (cats[0]?.id || ''),
          regular_price: prod.regular_price !== undefined ? prod.regular_price : '',
          discount_price: prod.discount_price !== undefined && prod.discount_price !== null ? prod.discount_price : '',
          pack_size: prod.pack_size || '250g',
          weight: prod.weight || prod.pack_size || '250g',
          short_description: prod.short_description || '',
          description: prod.description || '',
          ingredients: prod.ingredients || '',
          flavour_profile: prod.flavour_profile || '',
          storage_instructions: prod.storage_instructions || '',
          shelf_life: prod.shelf_life || '',
          allergen_information: prod.allergen_information || '',
          availability_status: prod.availability_status || 'In Stock',
          product_status: prod.product_status || 'Active',
          is_featured: Boolean(prod.is_featured)
        });

        // Set images
        if (prod.images && prod.images.length > 0) {
          setImages(prod.images.map((img, idx) => ({
            id: img.id || `img-${idx}`,
            image_url: img.image_url,
            storage_path: img.storage_path || null,
            alt_text: img.alt_text || prod.name,
            is_primary: Boolean(img.is_primary ?? idx === 0)
          })));
        } else if (prod.primary_image) {
          setImages([{
            id: 'primary-0',
            image_url: prod.primary_image,
            alt_text: prod.name,
            is_primary: true
          }]);
        }
      } else {
        // New Product defaults
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, category_id: cats[0].id }));
        }
      }
    } catch (err) {
      console.error('Error initializing form:', err);
      setErrorMessage('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Auto-generate slug when name changes (if slug not custom edited or was empty)
      if (name === 'name' && (!isEditing || !prev.slug)) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
      }

      return updated;
    });
  };

  // Image Upload Handler
  const handleImageFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    setUploadProgressText(`Uploading ${files.length} image(s)...`);
    setErrorMessage('');

    try {
      const uploadedResults = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading image ${i + 1} of ${files.length}: ${file.name}`);
        const result = await uploadProductImage(file);
        uploadedResults.push({
          id: 'temp-' + Date.now() + '-' + i,
          image_url: result.image_url,
          storage_path: result.storage_path,
          alt_text: formData.name || 'Kerala Pickle Product',
          is_primary: images.length === 0 && i === 0
        });
      }

      setImages(prev => {
        const next = [...prev, ...uploadedResults];
        // Ensure at least one image is marked primary
        if (!next.some(img => img.is_primary) && next.length > 0) {
          next[0].is_primary = true;
        }
        return next;
      });

      setSuccessMessage(`Successfully uploaded ${files.length} image(s).`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Error uploading image.');
    } finally {
      setUploadingImage(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  const setPrimaryImage = (index) => {
    setImages(prev => prev.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    })));
  };

  const removeImage = (index) => {
    setImages(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some(img => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const moveImage = (index, direction) => {
    setImages(prev => {
      const updated = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Submit Handler
  const handleSubmit = async (e, overrideStatus = null) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Please enter a Product Name.');
      return;
    }
    if (!formData.regular_price || Number(formData.regular_price) <= 0) {
      setErrorMessage('Please enter a valid Regular Price in Rupees.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        product_status: overrideStatus || formData.product_status,
        regular_price: Number(formData.regular_price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        images: images.map((img, idx) => ({
          image_url: img.image_url,
          storage_path: img.storage_path || null,
          alt_text: img.alt_text || formData.name,
          display_order: idx,
          is_primary: Boolean(img.is_primary)
        }))
      };

      if (isEditing) {
        await updateProduct(id, payload);
        setSuccessMessage('Product updated successfully!');
      } else {
        const created = await createProduct(payload);
        setSuccessMessage('Product created successfully!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 1200);
        return;
      }

      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      console.error('Save product error:', err);
      setErrorMessage('Failed to save product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#645a4e' }}>
        <p>Loading product information...</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      {/* Header and Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/products')}
            style={{ padding: '8px' }}
            title="Back to products list"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: '#12281a',
              fontWeight: 700,
              margin: 0
            }}>
              {isEditing ? `Edit: ${formData.name}` : 'Add New Kerala Pickle'}
            </h1>
            <p style={{ fontSize: '13px', color: '#645a4e', margin: '2px 0 0' }}>
              {isEditing ? 'Update pricing, images, ingredients and stock availability' : 'List a traditional Kerala pickle recipe into your storefront'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/products')}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={(e) => handleSubmit(e, 'Draft')}
            disabled={submitting}
            style={{ color: '#c78d1f', borderColor: '#e6c888' }}
          >
            Save as Draft
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting}
          >
            <Save size={15} />
            <span>{submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
          </button>
        </div>
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

      {/* Two Column Layout: Main Details (Left) + Sidebar Attributes & Media (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Core Product Info & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1: Basic Information */}
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
              <Package size={18} color="#c78d1f" />
              Basic Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Product Name <span style={{ color: '#c9302c' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Kerala Cut Mango Pickle"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    className="form-control"
                    placeholder="kerala-cut-mango-pickle"
                    value={formData.slug}
                    onChange={handleInputChange}
                  />
                  <small style={{ fontSize: '11px', color: '#8e8273', marginTop: '4px', display: 'block' }}>
                    Unique identifier used in URLs &amp; WhatsApp inquiries.
                  </small>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Product Category <span style={{ color: '#c9302c' }}>*</span>
                  </label>
                  <select
                    name="category_id"
                    className="form-control"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <small style={{ fontSize: '11px', color: '#8e8273', marginTop: '4px', display: 'block' }}>
                    <Link to="/admin/categories" style={{ color: '#c78d1f' }}>+ Manage Categories</Link>
                  </small>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Short Summary (Catalog &amp; Card Teaser)
                </label>
                <textarea
                  name="short_description"
                  className="form-control"
                  rows={2}
                  placeholder="Crisp green raw mango cubes cured with stone-pounded Kashmiri chilli and cold-pressed gingelly oil."
                  value={formData.short_description}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Full Heritage Description &amp; Recipe Lore
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={4}
                  placeholder="Our signature heirloom recipe inspired by traditional Central Travancore households..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Pack Variants */}
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
              <DollarSign size={18} color="#c78d1f" />
              Pricing &amp; Pack Variants
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Regular Price (₹) <span style={{ color: '#c9302c' }}>*</span>
                </label>
                <input
                  type="number"
                  name="regular_price"
                  min="0"
                  step="1"
                  className="form-control"
                  placeholder="190"
                  value={formData.regular_price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Discount / Sale Price (₹)
                </label>
                <input
                  type="number"
                  name="discount_price"
                  min="0"
                  step="1"
                  className="form-control"
                  placeholder="Leave empty if no discount"
                  value={formData.discount_price}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Pack Size
                </label>
                <input
                  type="text"
                  name="pack_size"
                  className="form-control"
                  placeholder="e.g. 250g, 500g, 1kg"
                  value={formData.pack_size}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Net Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  className="form-control"
                  placeholder="e.g. 250g"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div style={{
              background: '#f9f6ef',
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '16px',
              fontSize: '12px',
              color: '#645a4e',
              border: '1px solid #ede8dc'
            }}>
              <strong style={{ color: '#12281a' }}>Note on Pack Sizes:</strong> The public storefront allows customers to choose between standard 250g, 500g, and 1kg sizes on WhatsApp. The regular price above represents the primary baseline pack size.
            </div>
          </div>

          {/* Section 3: Authentic Kerala Product Details */}
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
              <Layers size={18} color="#c78d1f" />
              Ingredients &amp; Product Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Ingredients List
                </label>
                <textarea
                  name="ingredients"
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Raw Country Mangoes, Cold-Pressed Gingelly (Sesame) Oil, Kashmiri Chilli Powder, Fenugreek, Mustard Seeds, Asafoetida (Hing), Rock Salt."
                  value={formData.ingredients}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Flavour Profile
                  </label>
                  <input
                    type="text"
                    name="flavour_profile"
                    className="form-control"
                    placeholder="e.g. Crisp, tangy, balanced spice with roasted fenugreek aroma"
                    value={formData.flavour_profile}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                    Shelf Life
                  </label>
                  <input
                    type="text"
                    name="shelf_life"
                    className="form-control"
                    placeholder="e.g. 9 months from packaging date"
                    value={formData.shelf_life}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Storage Instructions
                </label>
                <input
                  type="text"
                  name="storage_instructions"
                  className="form-control"
                  placeholder="e.g. Store in a cool dry place. Use clean dry spoon. Keep oil layer intact."
                  value={formData.storage_instructions}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Allergen Information
                </label>
                <input
                  type="text"
                  name="allergen_information"
                  className="form-control"
                  placeholder="e.g. Contains Sesame and Mustard."
                  value={formData.allergen_information}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Images & Visibility Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 4: Visibility & Stock Status */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '18px',
              color: '#12281a',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid #ede8dc'
            }}>
              Product Visibility
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Publish Status
                </label>
                <select
                  name="product_status"
                  className="form-control"
                  value={formData.product_status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active (Live on website)</option>
                  <option value="Draft">Draft (Hidden from store)</option>
                  <option value="Inactive">Inactive (Archived)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Inventory / Stock Availability
                </label>
                <select
                  name="availability_status"
                  className="form-control"
                  value={formData.availability_status}
                  onChange={handleInputChange}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                {formData.availability_status === 'Out of Stock' && (
                  <small style={{ fontSize: '11px', color: '#c9302c', marginTop: '4px', display: 'block' }}>
                    Note: Product will show 'Out of Stock' badge and WhatsApp order button will be disabled on storefront.
                  </small>
                )}
              </div>

              {/* Featured Toggle */}
              <div style={{
                background: '#f9f6ef',
                border: '1px solid #ede8dc',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Star size={18} color="#c78d1f" fill={formData.is_featured ? '#c78d1f' : 'transparent'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#12281a' }}>Featured Product</div>
                    <div style={{ fontSize: '11px', color: '#7a7062' }}>Showcase in Home page featured gallery</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="is_featured"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#12281a' }}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Multi-Image Management & Supabase Storage */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid #ede8dc'
            }}>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '18px',
                color: '#12281a',
                margin: 0
              }}>
                Product Images
              </h2>
              <span style={{ fontSize: '12px', color: '#8e8273' }}>
                {images.length} Image{images.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Upload Zone */}
            <div style={{
              border: '2px dashed #d5cfc4',
              borderRadius: '8px',
              padding: '20px 16px',
              textAlign: 'center',
              background: '#fcfbf8',
              marginBottom: '18px'
            }}>
              <input
                type="file"
                id="product-image-uploader"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageFileSelect}
                style={{ display: 'none' }}
                disabled={uploadingImage}
              />
              <label 
                htmlFor="product-image-uploader" 
                style={{ cursor: uploadingImage ? 'not-allowed' : 'pointer', display: 'inline-block' }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(18, 40, 26, 0.06)',
                  margin: '0 auto 10px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#12281a'
                }}>
                  <Upload size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#12281a', marginBottom: '4px' }}>
                  {uploadingImage ? 'Uploading to Supabase...' : 'Click to Upload Images'}
                </div>
                <div style={{ fontSize: '11px', color: '#8a7d6e' }}>
                  JPG, JPEG, PNG, or WebP (Max 5MB each)
                </div>
              </label>

              {uploadingImage && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#c78d1f', fontWeight: 600 }}>
                  {uploadProgressText}
                </div>
              )}
            </div>

            {/* Uploaded Images List */}
            {images.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#8e8273', fontSize: '12px' }}>
                <ImageIcon size={24} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                No images uploaded yet. Primary image placeholder will be used.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', color: '#8e8273', marginBottom: '4px' }}>
                  ★ Select the star to set Primary Image. Use arrows to reorder.
                </div>

                {images.map((img, index) => (
                  <div
                    key={img.id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: img.is_primary ? '2px solid #c78d1f' : '1px solid #ede8dc',
                      background: img.is_primary ? 'rgba(199, 141, 31, 0.04)' : '#ffffff'
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#eee',
                      flexShrink: 0
                    }}>
                      <img
                        src={img.image_url}
                        alt={img.alt_text || 'Product image'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Metadata & Primary Badge */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#12281a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Image #{index + 1}
                        </span>
                        {img.is_primary && (
                          <span style={{
                            background: '#c78d1f',
                            color: '#fff',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            textTransform: 'uppercase'
                          }}>
                            Primary
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: '#8e8273', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {img.storage_path ? `Bucket: ${img.storage_path}` : 'Web image URL'}
                      </span>
                    </div>

                    {/* Actions: Primary Star, Reorder, Remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        title={img.is_primary ? 'Primary Image' : 'Make Primary'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: img.is_primary ? '#c78d1f' : '#b8ae9f',
                          padding: '4px'
                        }}
                      >
                        <Star size={16} fill={img.is_primary ? '#c78d1f' : 'transparent'} />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        title="Move Up"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: index === 0 ? 'default' : 'pointer',
                          color: index === 0 ? '#ddd' : '#645a4e',
                          padding: '4px'
                        }}
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        title="Move Down"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: index === images.length - 1 ? 'default' : 'pointer',
                          color: index === images.length - 1 ? '#ddd' : '#645a4e',
                          padding: '4px'
                        }}
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        title="Remove Image"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#c9302c',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

