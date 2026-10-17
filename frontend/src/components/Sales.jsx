import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { createSale, getErrorMessage } from '../api';

export const Sales = ({ products, onRefreshProducts, onNavigate }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [lastSale, setLastSale] = useState(null);

  // Find currently selected product object
  const currentProduct = products.find((p) => String(p.product_id) === String(selectedProductId));

  // Handle product selection change
  const handleProductChange = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);
    setServerError('');
    const prod = products.find((p) => String(p.product_id) === String(id));
    if (prod) {
      setSellingPrice(String(prod.price));
    } else {
      setSellingPrice('');
    }
  };

  // Calculations
  const qtyNum = parseInt(quantity, 10) || 0;
  const priceNum = parseFloat(sellingPrice) || 0;
  const totalAmount = qtyNum * priceNum;
  const currentStock = currentProduct ? currentProduct.stock : 0;
  const remainingStock = currentStock - qtyNum;

  // Submit sale to FastAPI POST /sales
  const handleRecordSale = async (e) => {
    e.preventDefault();
    setServerError('');
    setLastSale(null);

    // Client-side quick checks
    if (!selectedProductId) {
      setServerError('Please select a product to sell.');
      return;
    }
    if (qtyNum < 1) {
      setServerError('Quantity must be at least 1 unit.');
      return;
    }
    if (priceNum <= 0) {
      setServerError('Selling price must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createSale({
        product_id: parseInt(selectedProductId, 10),
        quantity: qtyNum,
        selling_price: priceNum,
      });

      // Show success transaction receipt
      setLastSale({
        ...response.data,
        product_name: currentProduct ? currentProduct.product_name : `Product #${selectedProductId}`,
        total: totalAmount,
        remaining_stock: remainingStock,
      });

      // Refresh global products list so updated stock is reflected immediately across the app
      await onRefreshProducts();

      // Reset quantity
      setQuantity(1);
    } catch (err) {
      // Show exact backend validation error (e.g. "Insufficient stock", "Product not found")
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Success Notification Banner */}
      {lastSale && (
        <div className="alert-banner alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 size={20} />
          <div style={{ flex: 1 }}>
            <strong>Sale Recorded Successfully!</strong>
            <p style={{ marginTop: '2px', fontSize: '12px' }}>
              Transaction ID #{lastSale.sale_id} for {lastSale.quantity}x {lastSale.product_name} at ${Number(lastSale.selling_price).toFixed(2)}/unit (Total: ${Number(lastSale.total).toFixed(2)}).
              Updated product stock is now <strong>{lastSale.remaining_stock} units</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Backend Error Banner */}
      {serverError && (
        <div className="alert-banner alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Backend Error:</strong>
            <p style={{ marginTop: '2px' }}>{serverError}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Sale Entry Form Card */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h3>Execute Sale</h3>
              <p>Posts to <code>/sales</code> with database stock deduction</p>
            </div>
            <ShoppingCart size={20} color="#2563eb" />
          </div>

          <form onSubmit={handleRecordSale}>
            {/* Product Selector */}
            <div className="form-group">
              <label className="form-label">
                Select Product <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={handleProductChange}
                className="form-select"
                required
              >
                <option value="">-- Choose a product from catalog --</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id} disabled={p.stock === 0}>
                    #{p.product_id} - {p.product_name} (${Number(p.price).toFixed(2)}) — Stock: {p.stock} units {p.stock === 0 ? '(OUT OF STOCK)' : ''}
                  </option>
                ))}
              </select>
              <p className="form-hint">
                {products.length === 0
                  ? 'No products available. Please add products first.'
                  : 'Products with 0 stock are disabled automatically.'}
              </p>
            </div>

            {/* Selling Price and Quantity */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Selling Price ($) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="form-input"
                  required
                />
                <p className="form-hint">Unit price for this sale</p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Quantity <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="form-input"
                  required
                />
                <p className="form-hint">Units to sell (min 1)</p>
              </div>
            </div>

            {/* Live Stock Calculation & Warning */}
            {currentProduct && (
              <div
                style={{
                  backgroundColor: remainingStock < 0 ? '#fef2f2' : '#f8fafc',
                  border: `1px solid ${remainingStock < 0 ? '#fecaca' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '18px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Current Available Stock:</span>
                  <span style={{ fontWeight: 700 }}>{currentStock} units</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Stock after this sale:</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: remainingStock < 0 ? '#dc2626' : remainingStock <= 5 ? '#d97706' : '#10b981',
                    }}
                  >
                    {remainingStock} units
                  </span>
                </div>

                {remainingStock < 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', marginTop: '8px', fontWeight: 600 }}>
                    <AlertTriangle size={16} />
                    <span>Warning: Requested quantity exceeds available stock ({currentStock}). The backend will reject this with "Insufficient stock".</span>
                  </div>
                )}
              </div>
            )}

            {/* Total Sale Value Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #bfdbfe',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af', textTransform: 'uppercase' }}>
                  Total Sale Amount
                </span>
                <p style={{ fontSize: '11px', color: '#3b82f6' }}>
                  {qtyNum} units × ${priceNum.toFixed(2)}
                </p>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>
                ${totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedProductId}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {submitting ? 'Recording Sale...' : 'Submit Sale Transaction'}
            </button>
          </form>
        </div>

        {/* Quick Reference: Current Inventory */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h3>Inventory Stock Reference</h3>
              <p>Verify current quantities before processing orders</p>
            </div>
            <Package size={20} color="#64748b" />
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <p>No products in database yet.</p>
              <button
                onClick={() => onNavigate('products')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '12px' }}
              >
                Go to Products
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Stock</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.product_id}>
                      <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>${Number(p.price).toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className={`badge ${
                            p.stock === 0 ? 'badge-out-stock' : p.stock <= 5 ? 'badge-low-stock' : 'badge-in-stock'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedProductId(String(p.product_id));
                            setSellingPrice(String(p.price));
                          }}
                          disabled={p.stock === 0}
                          className="btn btn-secondary btn-sm"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
