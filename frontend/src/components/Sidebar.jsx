import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Server } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, productCount, backendStatus }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: productCount },
    { id: 'sales', label: 'Record Sale', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <BarChart3 size={20} />
        </div>
        <div className="brand-text">
          <h2>Sales Analytics</h2>
          <p>FastAPI + PostgreSQL</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Backend Status Footer */}
      <div className="sidebar-footer">
        <div className="status-badge">
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span
              className={`status-indicator ${
                backendStatus === 'online'
                  ? 'status-online'
                  : backendStatus === 'offline'
                  ? 'status-offline'
                  : ''
              }`}
            />
            {backendStatus === 'online' ? 'Backend Connected' : backendStatus === 'offline' ? 'Backend Offline' : 'Connecting...'}
          </span>
          <Server size={14} color="#64748b" />
        </div>
        <p className="backend-url">{import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
