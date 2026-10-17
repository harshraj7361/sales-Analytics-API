import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Analytics from './components/Analytics';
import { checkHealth, getProducts, getErrorMessage } from './api';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [backendError, setBackendError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check FastAPI backend connection
  const verifyBackendHealth = useCallback(async () => {
    try {
      await checkHealth();
      setBackendStatus('online');
      setBackendError('');
      return true;
    } catch (err) {
      setBackendStatus('offline');
      setBackendError(getErrorMessage(err));
      return false;
    }
  }, []);

  // Fetch product catalog from GET /products
  const fetchProductsList = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await getProducts();
      setProducts(response.data);
      setBackendStatus('online');
      setBackendError('');
    } catch (err) {
      setBackendStatus('offline');
      setBackendError(getErrorMessage(err));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      await verifyBackendHealth();
      await fetchProductsList();
    };
    initialize();
  }, [verifyBackendHealth, fetchProductsList]);

  // Manual refresh handler passed to Header
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await verifyBackendHealth();
    await fetchProductsList();
    setIsRefreshing(false);
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        productCount={products.length}
        backendStatus={backendStatus}
      />

      {/* Main content view */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="page-content">
          {/* Backend Offline Notice */}
          {backendStatus === 'offline' && (
            <div className="alert-banner alert-error" style={{ marginBottom: '24px' }}>
              <div>
                <strong>Backend Connection Notice:</strong>
                <p style={{ marginTop: '2px', fontSize: '12px' }}>
                  {backendError || 'Unable to connect to FastAPI backend at http://127.0.0.1:8000.'}
                </p>
                <p style={{ marginTop: '4px', fontSize: '11px', color: '#991b1b' }}>
                  Make sure your backend server is running: <code>uvicorn main:app --reload --port 8000</code>
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Section views */}
          {activeTab === 'dashboard' && (
            <Dashboard products={products} onNavigate={setActiveTab} />
          )}

          {activeTab === 'products' && (
            <Products
              products={products}
              loading={loadingProducts}
              onRefreshProducts={fetchProductsList}
            />
          )}

          {activeTab === 'sales' && (
            <Sales
              products={products}
              onRefreshProducts={fetchProductsList}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics onNavigate={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
