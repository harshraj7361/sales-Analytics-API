import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Search, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { createProduct, updateProduct, deleteProduct, getErrorMessage } from '../api';

export const Products = ({ products, loading, onRefreshProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', product: null });
  const [deleteState, setDeleteState] = useState({ isOpen: false, product: null });
  const [formData, setFormData] = useState({ product_name: '', price: '', stock: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Search filter
  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Clear feedback after 4 seconds
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setFormData({ product_name: '', price: '', stock: '' });
    setFormErrors({});
    setModalState({ isOpen: true, mode: 'create', product: null });
  };

  // Open Edit Product Modal
  const handleOpenEdit = (product) => {
    setFormData({
      product_name: product.product_name,
      price: String(product.price),
      stock: String(product.stock),
    });
    setFormErrors({});
    setModalState({ isOpen: true, mode: 'edit', product });
  };

  // Validate form matching backend Pydantic schemas (schemas.py)
  const validateForm = () => {
    const errors = {};
    const name = formData.product_name.trim();

    if (!name) {
      errors.product_name = 'Product name is required';
    } else if (name.length > 50) {
      errors.product_name = 'Product name must not exceed 50 characters';
    }

    const price = parseFloat(formData.price);
    if (formData.price === '' || isNaN(price)) {
      errors.price = 'Price is required';
    } else if (price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    const stock = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stock)) {
      errors.stock = 'Stock is required';
    } else if (stock < 0) {
      errors.stock = 'Stock cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add or Edit
  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (modalState.mode === 'create') {
        await createProduct({
          product_name: formData.product_name.trim(),
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
        });
        showFeedback('success', `Product "${formData.product_name}" created successfully!`);
      } else {
        await updateProduct(modalState.product.product_id, {
          product_name: formData.product_name.trim(),
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
        });
        showFeedback('success', `Product "${formData.product_name}" updated successfully!`);
      }

      setModalState({ isOpen: false, mode: 'create', product: null });
      await onRefreshProducts();
    } catch (err) {
      showFeedback('error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteState.product) return;
    setSubmitting(true);
    try {
      // Calls exact FastAPI route: DELETE /delete/{product_id}
      await deleteProduct(deleteState.product.product_id);
      showFeedback('success', `Product "${deleteState.product.product_name}" was deleted successfully.`);
      setDeleteState({ isOpen: false, product: null });
      await onRefreshProducts();
    } catch (err) {
      showFeedback('error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format currency
  const formatPrice = (val) => `$${Number(val).toFixed(2)}`;

  return (
    <div>
      {/* Feedback banner */}
      {feedback && (
        <div className={`alert-banner ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Action Header Card */}
      <div className="content-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search product by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Add Product Button */}
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="content-card">
        <div className="card-header">
          <div>
            <h3>Product Catalog ({filteredProducts.length})</h3>
            <p>Live inventory synchronized directly with PostgreSQL database</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Loading products from database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={36} color="#94a3b8" />
            <h4 style={{ marginTop: '12px', fontWeight: 600 }}>No products found</h4>
            <p>
              {searchTerm
                ? `No products match the search query "${searchTerm}".`
                : 'Your product catalog is empty. Click "+ Add New Product" to get started.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Product Name</th>
                  <th style={{ width: '130px' }}>Unit Price</th>
                  <th style={{ width: '130px' }}>Stock Level</th>
                  <th style={{ width: '140px' }}>Status</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  let badgeClass = 'badge-in-stock';
                  let statusText = 'In Stock';

                  if (product.stock === 0) {
                    badgeClass = 'badge-out-stock';
                    statusText = 'Out of Stock';
                  } else if (product.stock <= 5) {
                    badgeClass = 'badge-low-stock';
                    statusText = 'Low Stock';
                  }

                  return (
                    <tr key={product.product_id}>
                      <td style={{ fontWeight: 600, color: '#64748b' }}>
                        #{product.product_id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{product.product_name}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {formatPrice(product.price)}
                      </td>
                      <td style={{ fontWeight: 600 }}>{product.stock} units</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{statusText}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteState({ isOpen: true, product })}
                            className="btn btn-danger btn-sm"
                            title="Delete Product"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
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

      {/* Add / Edit Product Modal */}
      {modalState.isOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{modalState.mode === 'create' ? 'Add New Product' : 'Edit Product'}</h3>
              <button
                onClick={() => setModalState({ isOpen: false, mode: 'create', product: null })}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitModal}>
              <div className="modal-body">
                {/* Product Name */}
                <div className="form-group">
                  <label className="form-label">
                    Product Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="e.g. Wireless Mouse"
                    maxLength={50}
                    className="form-input"
                  />
                  {formErrors.product_name ? (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.product_name}
                    </p>
                  ) : (
                    <p className="form-hint">Max 50 characters</p>
                  )}
                </div>

                {/* Price and Stock row */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Unit Price ($) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="form-input"
                    />
                    {formErrors.price && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Stock Quantity <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className="form-input"
                    />
                    {formErrors.stock && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.stock}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'create', product: null })}
                  disabled={submitting}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting
                    ? 'Saving...'
                    : modalState.mode === 'create'
                    ? 'Create Product'
                    : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteState.isOpen && deleteState.product && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button
                onClick={() => setDeleteState({ isOpen: false, product: null })}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#475569' }}>
                Are you sure you want to delete product{' '}
                <strong style={{ color: '#0f172a' }}>"{deleteState.product.product_name}"</strong> (ID #{deleteState.product.product_id})?
              </p>
              <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '10px' }}>
                This will invoke FastAPI endpoint <code>DELETE /delete/{deleteState.product.product_id}</code>.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteState({ isOpen: false, product: null })}
                disabled={submitting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="btn btn-danger"
              >
                {submitting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
