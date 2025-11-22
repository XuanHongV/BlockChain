import { useState } from 'react';
import { Header } from './components/Layout/Header';
import Login from "./components/Auth/Login";
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductTracking } from './components/Products/ProductTracking';
import { SupplierManagement } from './components/Suppliers/SupplierManagement';
import { BlockchainLog } from './components/Transactions/BlockchainLog';
import { ConsumerTracking } from './components/Tracking/Tracking'; 
import { ArrowLeft, Search } from 'lucide-react';

function App() {
  const [isAuthed, setIsAuthed] = useState<boolean>(!!localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [isPublicTracking, setIsPublicTracking] = useState(false);

  const savedUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const [user, setUser] = useState<any>(savedUser);

  if (!isAuthed) {
    if (isPublicTracking) {
      return (
        <div className="relative">
          <button 
            onClick={() => setIsPublicTracking(false)}
            className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-gray-600 hover:text-blue-600 hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Quay lại Đăng nhập</span>
          </button>
          
          <ConsumerTracking />
        </div>
      );
    }

    return (
      <div className="relative min-h-screen flex flex-col justify-center bg-gray-50">
        <Login
          onSuccess={() => {
            setIsAuthed(true);
            setActiveTab("dashboard");
            try {
              const raw = localStorage.getItem('user');
              setUser(raw ? JSON.parse(raw) : null);
            } catch {
              setUser(null);
            }
          }}
        />
        
        <div className="mt-6 text-center z-10">
          <p className="text-gray-500 mb-2">Bạn là khách hàng?</p>
          <button
            onClick={() => setIsPublicTracking(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
          >
            <Search size={18} />
            Tra cứu đơn hàng không cần đăng nhập
          </button>
        </div>
      </div>
    );
  }

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
        
      case 'tracking':
        return <ConsumerTracking />;
        
      case 'contracts':
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Contracts</h2>
                    <p className="text-gray-600">Giao diện quản lý hợp đồng thông minh đang phát triển...</p>
                </div>
            </div>
        );
      case 'analytics':
      case 'compliance':
      case 'reports':
      case 'settings':
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{activeTab}</h2>
                    <p className="text-gray-600">Tính năng đang được xây dựng...</p>
                </div>
            </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthed(false);
    setIsPublicTracking(false);
  };

  return (
        <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentUser={user?.email || 'Người dùng'} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;