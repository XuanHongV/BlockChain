import React, { useEffect, useState } from 'react';
import api from '../../services/apiService';
import { CreateShipmentForm } from './CreateShipmentForm';
import { Search, Filter} from 'lucide-react';

type Shipment = {
  shipmentId: string;
  productName: string;
  quantity: number;
  manufacturingDate: string | Date;
  status: 'CREATED' | 'SHIPPED' | 'RECEIVED' | 'AUDITED' | 'FOR_SALE';
  transactionHash: string;
  producerAddress: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export const ProductTracking: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get('/shipments');
        let shipmentsData: any[] = [];
        if (Array.isArray(response.data)) {
          shipmentsData = response.data;
        } else if (Array.isArray(response.data?.shipments)) {
          shipmentsData = response.data.shipments;
        } else if (Array.isArray(response.data?.data)) {
          shipmentsData = response.data.data;
        } else {
          shipmentsData = response.data?.shipmentsList || response.data?.items || [];
        }
        setShipments(shipmentsData || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không tải được dữ liệu lô hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatVN = (d: string | number | Date) =>
    new Date(d).toLocaleString('vi-VN');

  if (loading) return <div className="p-6">Đang tải dữ liệu từ blockchain...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Tracking</h2>
        <p className="text-gray-600">Monitor products throughout the supply chain with blockchain verification</p>
      </div>

      {/* Form tạo lô hàng */}
      <div className="mb-6">
        <CreateShipmentForm />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by product name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="in-transit">In Transit</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách lô hàng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lô hàng</h3>
        {shipments.length === 0 ? (
          <div className="text-gray-500">Chưa có lô hàng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Tên sản phẩm</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shipments.map((s) => (
                  <tr key={s.shipmentId || s.transactionHash}>
                    <td className="py-3 px-4 font-medium">{s.shipmentId || s.transactionHash}</td>
                    <td className="py-3 px-4">{s.productName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          s.status === 'CREATED'
                            ? 'bg-green-100 text-green-800'
                            : s.status === 'SHIPPED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : s.status === 'FOR_SALE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatVN(s.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  </div>
  );
};
