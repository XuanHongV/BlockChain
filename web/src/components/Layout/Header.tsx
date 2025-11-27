import React, { useState, useRef, useEffect } from 'react';
import { ethers } from "ethers";
import { Bell, Search, User, Shield, LogOut, CheckCircle, XCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface HeaderProps {
  currentUser: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  
  const { notifications, clearNotifications } = useToast();

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setIsNotifOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAddress = (address: string) => {
    if (!address) return "Invalid Address";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnectWallet = async () => {
    setError(null); 
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts: string[] = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
        }
      } catch (err) {
        console.error("Lỗi khi kết nối ví:", err);
        setError("Kết nối thất bại. Vui lòng kiểm tra ví (MetaMask).");
        setWalletAddress(null);
      }
    } else {
      setError("Vui lòng cài đặt MetaMask hoặc ví Web3 tương thích.");
    }
  };
  
  const renderNotifIcon = (type: string) => {
      if (type === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
      if (type === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
      return <Loader2 className="w-4 h-4 text-blue-500" />;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-30">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SupplyTrust</h1>
            <p className="text-xs text-gray-500">Blockchain Quản lý chuỗi cung ứng</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm sản phẩm, nhà cung cấp, giao dịch..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Wallet Button */}
          {walletAddress ? (
            <div className="text-sm font-medium text-green-700 bg-green-100 px-4 py-2 rounded-lg cursor-default border border-green-200">
              {formatAddress(walletAddress)}
            </div>
          ) : (
            <button 
              onClick={handleConnectWallet}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Connect Wallet
            </button>
          )}

          <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                )}
            </button>
            
            {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-sm text-gray-700">Thông báo ({notifications.length})</h3>
                        {notifications.length > 0 && (
                            <button onClick={clearNotifications} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1">
                                <Trash2 className="w-3 h-3"/> Xóa
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Không có thông báo mới
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((item) => (
                                    <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {renderNotifIcon(item.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 font-medium break-words">
                                                    {item.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(item.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    {item.txHash && (
                                                        <a 
                                                            href={`https://amoy.polygonscan.com/tx/${item.txHash}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                                                        >
                                                            Hash <ExternalLink className="w-2 h-2"/>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
          
          {/* Thông tin người dùng */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser}</p>
              <p className="text-xs text-gray-500">Quản lý chuỗi cung ứng</p>
            </div>
            <div className="relative group">
              <button className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
                <User className="h-5 w-5 text-blue-600" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4" />
                    <span>Hồ sơ</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      if (onLogout) onLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-center text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </header>
  );
};