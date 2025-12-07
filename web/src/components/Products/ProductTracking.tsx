import React, { useEffect, useState, useMemo } from 'react';
import { ethers } from 'ethers';
import api from '../../services/apiService';
import { getBlockchainContract } from '../../services/blockchainService';
import { CreateShipmentForm } from './CreateShipmentForm';
import { ShipmentList } from './ShipmentList';
import { Search, Filter, RefreshCw, Link2 } from 'lucide-react';
import { Shipment } from '../../types'; 

const upsertShipment = (list: Shipment[], s: Shipment) => {
  const id = s.shipmentId || s.transactionHash;       
  const i = list.findIndex(x => (x.shipmentId && x.shipmentId === s.shipmentId) || (x.transactionHash && x.transactionHash === s.transactionHash));
  let newList = [...list];
  if (i >= 0) newList[i] = { ...newList[i], ...s };
  else newList = [s, ...list];
  return newList.sort((a, b) => (new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()));
};

export const ProductTracking: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/shipments');
      let data: Shipment[] = [];
      if (Array.isArray(response.data)) data = response.data;
      else if (Array.isArray(response.data?.shipments)) data = response.data.shipments;
      else data = response.data?.data || [];
      setShipments(data || []);
      setError('');
    } catch (err: any) {
      setError('Không tải được dữ liệu lô hàng');
    } finally {
      setLoading(false);
    }
  };

  const syncWithBlockchain = async () => {
    if (!window.ethereum) return alert("Cần ví MetaMask!");
    setIsSyncing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getBlockchainContract(provider);
      
      const statusMap = ["CREATED", "SHIPPED", "RECEIVED", "AUDITED", "FOR_SALE"];
      let updateCount = 0;

      const updatedList = await Promise.all(shipments.map(async (s) => {
        if (!s.shipmentId || s.shipmentId.toString().startsWith('SHP-')) return s; 

        try {
          const data = await contract.shipments(s.shipmentId);
          const realStatusEnum = Number(data[5]);
          const realStatus = statusMap[realStatusEnum];

          if (realStatus && realStatus !== s.status) {
             console.log(`Lô ${s.shipmentId}: Web(${s.status}) -> Chain(${realStatus})`);
             updateCount++;
             return { ...s, status: realStatus };
          }
        } catch (e) {
          console.error(`Lỗi check lô ${s.shipmentId}`, e);
        }
        return s;
      }));

      setShipments(updatedList as Shipment[]);
      if (updateCount > 0) alert(`Đã đồng bộ xong! Cập nhật ${updateCount} lô hàng.`);
      else alert("Dữ liệu đã khớp, không có gì thay đổi.");

    } catch (err) {
      console.error(err);
      alert("Lỗi khi kết nối Blockchain.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const parseNum = (id?: string) => {
    const m = /^SHP-(\d+)$/.exec(id ?? '');
    return m ? parseInt(m[1], 10) : NaN;
  };

  const nextShipmentId = useMemo(() => {
    if (shipments.length === 0) return 'SHP-1001';
    const max = shipments.reduce((mx, s) => {
      const n = parseNum(s.shipmentId);
      return Number.isFinite(n) ? Math.max(mx, n) : mx;
    }, 1000);
    return `SHP-${max + 1}`;
  }, [shipments]);

  const handleCreated = (created: Shipment) => setShipments(prev => upsertShipment(prev, created));

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (s.productName || '').toLowerCase().includes(searchLower) ||
                            (s.shipmentId || '').toLowerCase().includes(searchLower);
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, filterStatus]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Theo dõi sản phẩm</h2>
          <p className="text-gray-600">Giám sát chuỗi cung ứng trên Blockchain</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchShipments}
            className="p-2 bg-white border rounded hover:bg-gray-100 text-gray-600"
            title="Tải lại"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <CreateShipmentForm onCreated={handleCreated} getNextShipmentId={() => nextShipmentId} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="CREATED">ĐÃ TẠO</option>
                <option value="SHIPPED">ĐÃ GỬI</option>
                <option value="RECEIVED">ĐÃ NHẬN</option>
                <option value="AUDITED">ĐÃ KIỂM DUYỆT</option>
                <option value="FOR_SALE">ĐANG BÁN</option>
              </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <ShipmentList 
            title={`Danh sách lô hàng (${filteredShipments.length})`}
            shipments={filteredShipments}
            onRefresh={fetchShipments} 
        />
      </div>
    </div>
  );
};