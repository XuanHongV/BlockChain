import React, { useState, useEffect } from 'react';
import { getShipmentStatusOnChain, ChainShipmentData } from '../../services/blockchainService';
import { Search, User, Calendar, Box, ShieldCheck, AlertTriangle } from 'lucide-react';

export const ConsumerTracking: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [data, setData] = useState<ChainShipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (id: string) => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await getShipmentStatusOnChain(id);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Không tìm thấy thông tin lô hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    fetchData(searchId);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');

    if (idParam) {
      setSearchId(idParam);
      fetchData(idParam);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CREATED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-yellow-100 text-yellow-800',
      RECEIVED: 'bg-purple-100 text-purple-800',
      AUDITED: 'bg-indigo-100 text-indigo-800',
      FOR_SALE: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-full mb-4 shadow-lg animate-bounce">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Tra Cứu Nguồn Gốc</h1>
        <p className="text-gray-500 mt-2">Kiểm tra thông tin minh bạch trực tiếp từ Blockchain</p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-md bg-white p-2 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập ID lô hàng (VD: 12 hoặc SHP-12)"
            className="flex-1 px-4 py-3 rounded-xl border-none focus:ring-0 text-gray-700 placeholder-gray-400 outline-none"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-70 flex items-center"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Search className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-md bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result Card */}
      {data && (
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-4 duration-500">


          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">ID Lô Hàng</p>
                  <h2 className="text-3xl font-mono font-bold">{data.id}</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30`}>
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{data.productName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(data.status)}`}>
                  {data.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Số lượng</p>
                    <p className="font-medium text-gray-900">{data.quantity}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Ngày SX</p>
                    <p className="font-medium text-gray-900">{data.manufactureDate}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Nhà sản xuất (Ví)</p>
                    <p className="font-mono text-xs text-gray-600 truncate bg-gray-50 p-2 rounded mt-1 select-all" title={data.producer}>
                      {data.producer}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
              <p className="text-[10px] text-gray-400">
                Dữ liệu được xác thực bởi Polygon Amoy Network
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};