import React, { useState } from 'react';
import { ethers } from "ethers";
import { Bell, Search, User, Shield, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  // 1. STATE: Quản lý địa chỉ ví và lỗi
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm rút gọn địa chỉ ví (ví dụ: 0x1234...abcd)
   */
  const formatAddress = (address: string) => {
    if (!address) return "Invalid Address";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  /**
   * 2. LOGIC: Hàm xử lý kết nối ví MetaMask
   */
  const handleConnectWallet = async () => {
    setError(null); // Xóa lỗi cũ khi thử kết nối lại
    
    // Kiểm tra xem trình duyệt có cài đặt ví (MetaMask) không
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Tạo một Provider từ đối tượng ethereum của ví
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Yêu cầu người dùng cấp quyền truy cập tài khoản
        const accounts: string[] = await provider.send("eth_requestAccounts", []);
        
        // Cập nhật state với địa chỉ ví đầu tiên
        if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
        }
      } catch (err) {
        // Xử lý khi người dùng từ chối hoặc có lỗi khác
        console.error("Lỗi khi kết nối ví:", err);
        setError("Kết nối thất bại. Vui lòng kiểm tra ví (MetaMask).");
        setWalletAddress(null);
      }
    } else {
      // Nếu không tìm thấy MetaMask
      setError("Vui lòng cài đặt MetaMask hoặc ví Web3 tương thích.");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">

        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SupplyTrust</h1>
            <p className="text-xs text-gray-500">Blockchain Supply Chain</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products, suppliers, transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User Actions & Connect Wallet Button */}
        <div className="flex items-center space-x-4">
          
          {/* 3. NÚT CONNECT WALLET MỚI */}
          {walletAddress ? (
            // Trạng thái: Đã kết nối
            <div className="text-sm font-medium text-green-700 bg-green-100 px-4 py-2 rounded-lg cursor-default">
              {formatAddress(walletAddress)}
            </div>
          ) : (
            // Trạng thái: Chưa kết nối
            <button 
              onClick={handleConnectWallet}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}

          {/* Nút chuông thông báo */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Thông tin người dùng */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser}</p>
              <p className="text-xs text-gray-500">Supply Chain Manager</p>
            </div>
            <div className="relative group">
              <button className="bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition-colors">
                <User className="h-5 w-5 text-blue-600" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      // Clear token in localStorage and call optional callback to update app state
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      if (onLogout) onLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
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