import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { getRevenue, getSalesReport, getSalesStatistics, getErrorMessage } from '../api';

export const Dashboard = ({ products, onNavigate }) => {
  const [revenueData, setRevenueData] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [revRes, reportRes, statsRes] = await Promise.all([
        getRevenue(),
        getSalesReport(),
        getSalesStatistics(),
      ]);
      setRevenueData(revRes.data);
      setSalesReport(reportRes.data);
      setSalesStats(statsRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Format currency helper
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Inventory calculations
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Loading dashboard metrics from FastAPI backend...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert-banner alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Summary Cards */}
      <div className="stat-grid">
        {/* Total Revenue */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Revenue</span>
            <div className="stat-icon icon-blue">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(revenueData?.total_revenue ?? salesReport?.total_revenue ?? 0)}
          </div>
          <div className="stat-subtext">Aggregated from all customer transactions</div>
        </div>

        {/* Total Sales Count */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Sales</span>
            <div className="stat-icon icon-green">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="stat-value">{salesReport?.total_sales ?? 0}</div>
          <div className="stat-subtext">Total recorded sales transactions</div>
        </div>

        {/* Units Sold */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Units Sold</span>
            <div className="stat-icon icon-purple">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{salesReport?.total_quantity_sold ?? 0}</div>
          <div className="stat-subtext">Sum of quantities across all sales</div>
        </div>

        {/* Average Selling Price */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Avg Selling Price</span>
            <div className="stat-icon icon-amber">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(salesReport?.average_selling_price ?? 0)}</div>
          <div className="stat-subtext">Pandas computed mean item price</div>
        </div>
      </div>

      {/* Grid: Revenue Statistics (NumPy) & Inventory Health */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* NumPy Statistical Breakdown */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h3>Revenue Statistics (NumPy)</h3>
              <p>Key distribution indicators computed server-side via NumPy</p>
            </div>
            <Activity size={18} color="#2563eb" />
          </div>

          <div className="dist-card">
            <div className="dist-metric-row">
              <span className="dist-metric-label">Average Revenue per Sale</span>
              <span className="dist-metric-val">{formatCurrency(salesStats?.average_revenue ?? 0)}</span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">Median Revenue per Sale</span>
              <span className="dist-metric-val">{formatCurrency(salesStats?.median_revenue ?? 0)}</span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">Maximum Sale Revenue</span>
              <span className="dist-metric-val">{formatCurrency(salesStats?.maximum_revenue ?? 0)}</span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">Minimum Sale Revenue</span>
              <span className="dist-metric-val">{formatCurrency(salesStats?.minimum_revenue ?? 0)}</span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">Revenue Standard Deviation (σ)</span>
              <span className="dist-metric-val">{formatCurrency(salesStats?.revenue_std_deviation ?? 0)}</span>
            </div>
          </div>

          {salesStats?.message && (
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
              Note: {salesStats.message}
            </p>
          )}
        </div>

        {/* Real-time Inventory Status */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h3>Inventory Health</h3>
              <p>Current stock status across catalog products</p>
            </div>
            <Package size={18} color="#10b981" />
          </div>

          <div className="dist-card" style={{ marginBottom: '16px' }}>
            <div className="dist-metric-row">
              <span className="dist-metric-label">Total Product Catalog</span>
              <span className="dist-metric-val">{totalProducts} items</span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">In Stock (Healthy &gt; 5)</span>
              <span className="dist-metric-val" style={{ color: '#10b981' }}>
                {products.filter((p) => p.stock > 5).length} items
              </span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">Low Stock (1 to 5 units)</span>
              <span className="dist-metric-val" style={{ color: '#d97706' }}>
                {lowStockProducts.length} items
              </span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">Out of Stock (0 units)</span>
              <span className="dist-metric-val" style={{ color: '#ef4444' }}>
                {outOfStockProducts.length} items
              </span>
            </div>
          </div>

          {/* Quick link to Products or Sales */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigate('products')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              Manage Products
            </button>
            <button
              onClick={() => onNavigate('sales')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              Record New Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
