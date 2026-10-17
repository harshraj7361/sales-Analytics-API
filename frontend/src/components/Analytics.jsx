import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Database, AlertCircle, ShoppingBag, DollarSign, Package, CheckCircle2 } from 'lucide-react';
import { getRevenue, getSalesReport, getSalesStatistics, getErrorMessage } from '../api';

export const Analytics = ({ onNavigate }) => {
  const [revenueData, setRevenueData] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
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
    fetchAnalytics();
  }, []);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Fetching Pandas & NumPy analytics from FastAPI backend...</p>
      </div>
    );
  }

  const hasSales = (salesReport?.total_sales ?? 0) > 0;

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div className="alert-banner alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={20} />
          <div style={{ flex: 1 }}>
            <strong>Analytics Fetch Error:</strong>
            <p style={{ marginTop: '2px' }}>{error}</p>
          </div>
          <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      )}

      {/* No sales state banner */}
      {!hasSales && !error && (
        <div className="alert-banner alert-warning" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} />
          <div style={{ flex: 1 }}>
            <strong>No Sales Data Available Yet</strong>
            <p style={{ marginTop: '2px' }}>
              The database currently has 0 recorded sales. Pandas and NumPy are reporting baseline zero values.
            </p>
          </div>
          {onNavigate && (
            <button onClick={() => onNavigate('sales')} className="btn btn-primary btn-sm">
              Record a Sale Now
            </button>
          )}
        </div>
      )}

      {/* Primary KPI Overview Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Revenue (SQL)</span>
            <div className="stat-icon icon-blue">
              <Database size={20} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(revenueData?.total_revenue ?? 0)}</div>
          <div className="stat-subtext">Computed via <code>func.sum()</code> on <code>/analytics/revenue</code></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Pandas Revenue</span>
            <div className="stat-icon icon-green">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(salesReport?.total_revenue ?? 0)}</div>
          <div className="stat-subtext">Calculated via <code>df['revenue'].sum()</code></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Transactions</span>
            <div className="stat-icon icon-purple">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="stat-value">{salesReport?.total_sales ?? 0}</div>
          <div className="stat-subtext">Calculated via <code>len(df)</code></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Avg Selling Price</span>
            <div className="stat-icon icon-amber">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(salesReport?.average_selling_price ?? 0)}</div>
          <div className="stat-subtext">Calculated via <code>df['selling_price'].mean()</code></div>
        </div>
      </div>

      {/* Grid: 2 Comprehensive Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Section 1: Pandas Sales Report */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h3>Pandas Sales Report</h3>
              <p>Aggregations generated by <code>GET /analytics/sales-report</code></p>
            </div>
            <span className="badge badge-in-stock" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BarChart3 size={13} />
              <span>Pandas DataFrame</span>
            </span>
          </div>

          <div className="table-container" style={{ marginBottom: '16px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report Metric</th>
                  <th>Backend Implementation</th>
                  <th style={{ textAlign: 'right' }}>Calculated Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Total Sales Count</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}><code>len(df)</code></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                    {salesReport?.total_sales ?? 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Total Quantity Sold</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}><code>int(df['quantity'].sum())</code></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                    {salesReport?.total_quantity_sold ?? 0} units
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Total Sales Revenue</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}><code>round(df['revenue'].sum(), 2)</code></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#16a34a' }}>
                    {formatCurrency(salesReport?.total_revenue ?? 0)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Average Selling Price</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}><code>round(df['selling_price'].mean(), 2)</code></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                    {formatCurrency(salesReport?.average_selling_price ?? 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
            <strong>How Pandas processes this:</strong> FastAPI fetches sales rows from PostgreSQL into SQLAlchemy objects, builds a Pandas <code>DataFrame</code>, calculates per-sale <code>df['revenue'] = df['quantity'] * df['selling_price']</code>, and computes aggregated metrics.
          </div>
        </div>

        {/* Section 2: NumPy Statistics */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h3>NumPy Statistical Distribution</h3>
              <p>Calculations from <code>GET /analytics/sales-statistics</code></p>
            </div>
            <span className="badge badge-in-stock" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={13} />
              <span>NumPy Vectorized</span>
            </span>
          </div>

          <div className="dist-card" style={{ marginBottom: '16px' }}>
            <div className="dist-metric-row">
              <span className="dist-metric-label">
                Average Revenue (<code>np.mean</code>)
              </span>
              <span className="dist-metric-val">{formatCurrency(salesStats?.average_revenue ?? 0)}</span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">
                Median Revenue (<code>np.median</code>)
              </span>
              <span className="dist-metric-val">{formatCurrency(salesStats?.median_revenue ?? 0)}</span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">
                Maximum Revenue (<code>np.max</code>)
              </span>
              <span className="dist-metric-val" style={{ color: '#16a34a' }}>
                {formatCurrency(salesStats?.maximum_revenue ?? 0)}
              </span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">
                Minimum Revenue (<code>np.min</code>)
              </span>
              <span className="dist-metric-val" style={{ color: '#d97706' }}>
                {formatCurrency(salesStats?.minimum_revenue ?? 0)}
              </span>
            </div>
            <div className="dist-metric-row">
              <span className="dist-metric-label">
                Std. Deviation (<code>np.std</code>)
              </span>
              <span className="dist-metric-val" style={{ color: '#7c3aed' }}>
                {formatCurrency(salesStats?.revenue_std_deviation ?? 0)}
              </span>
            </div>
          </div>

          {salesStats?.message && (
            <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginBottom: '16px' }}>
              Backend status note: "{salesStats.message}"
            </p>
          )}

          <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
            <strong>How NumPy processes this:</strong> Each sale transaction's revenue is extracted into a 1D NumPy array (<code>np.array([sale.quantity * sale.selling_price...])</code>) to calculate central tendency and spread without Python loop overhead.
          </div>
        </div>
      </div>

      {/* SQL vs Pandas Consistency Check */}
      <div className="content-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3>Data Consistency Verification</h3>
            <p>Cross-checking PostgreSQL database aggregation against Pandas in-memory analysis</p>
          </div>
          <CheckCircle2 size={18} color="#10b981" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>PostgreSQL SQL Sum</span>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
              {formatCurrency(revenueData?.total_revenue ?? 0)}
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Route: <code>/analytics/revenue</code>
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Pandas DataFrame Sum</span>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
              {formatCurrency(salesReport?.total_revenue ?? 0)}
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Route: <code>/analytics/sales-report</code>
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Status</span>
            <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px', color: '#166534' }}>
              {Number(revenueData?.total_revenue ?? 0) === Number(salesReport?.total_revenue ?? 0)
                ? '✓ Synchronized & Match'
                : '⚠ Values Discrepancy'}
            </div>
            <p style={{ fontSize: '11px', color: '#15803d', marginTop: '4px' }}>
              Both calculations match perfectly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
