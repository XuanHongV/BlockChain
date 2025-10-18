import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductTracking } from './components/Products/ProductTracking';
import { SupplierManagement } from './components/Suppliers/SupplierManagement';
import { BlockchainLog } from './components/Transactions/BlockchainLog';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductTracking />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'transactions':
        return <BlockchainLog />;
      case 'contracts':
        return <div className="p-6 bg-gray-50 min-h-screen">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Contracts</h2>
            <p className="text-gray-600">Smart contract management interface coming soon...</p>
          </div>
        </div>;
      case 'analytics':
        return <div className="p-6 bg-gray-50 min-h-screen">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Reporting</h2>
            <p className="text-gray-600">Advanced analytics dashboard coming soon...</p>
          </div>
        </div>;
      case 'compliance':
        return <div className="p-6 bg-gray-50 min-h-screen">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance Monitoring</h2>
            <p className="text-gray-600">Compliance tracking and reporting tools coming soon...</p>
          </div>
        </div>;
      case 'reports':
        return <div className="p-6 bg-gray-50 min-h-screen">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
            <p className="text-gray-600">Comprehensive reporting system coming soon...</p>
          </div>
        </div>;
      case 'settings':
        return <div className="p-6 bg-gray-50 min-h-screen">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">System configuration and preferences coming soon...</p>
          </div>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentUser="Alex Johnson" />
        <main className="flex-1 overflow-y-auto">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;