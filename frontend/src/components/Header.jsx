import React from 'react';
import { RefreshCw, PlusCircle, ShoppingCart } from 'lucide-react';

export const Header = ({ activeTab, setActiveTab, onRefresh, isRefreshing, onOpenAddProduct }) => {
  const titles = {
    dashboard: {
      title: 'Executive Dashboard',
      subtitle: 'Overview of total revenue, sales volume, and statistical distributions',
    },
    products: {
      title: 'Product Inventory',
      subtitle: 'Manage items, track real-time stock levels, and update catalog prices',
    },
    sales: {
      title: 'Record New Sale',
      subtitle: 'Execute customer sales transactions with instant database stock validation',
    },
    analytics: {
      title: 'Sales Analytics & Statistics',
      subtitle: 'Deep-dive reports computed directly by Pandas and NumPy in FastAPI',
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="top-header">
      <div className="page-title">
        <h1>{current.title}</h1>
        <p>{current.subtitle}</p>
      </div>

      <div className="header-actions">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn btn-secondary btn-sm"
          title="Refresh data from FastAPI"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spinner' : ''} style={{ animationDuration: '1s' }} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        {/* Quick action buttons */}
        {activeTab !== 'sales' && (
          <button
            onClick={() => setActiveTab('sales')}
            className="btn btn-secondary btn-sm"
          >
            <ShoppingCart size={14} />
            <span>New Sale</span>
          </button>
        )}

        {onOpenAddProduct && (
          <button
            onClick={onOpenAddProduct}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={14} />
            <span>Add Product</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
