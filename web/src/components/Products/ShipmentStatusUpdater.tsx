import React, { useState, useRef, useEffect } from 'react';
import { callUpdateStatus, ShipmentStatus } from '../../services/blockchainService';
import { RefreshCw, AlertCircle, Truck, PackageCheck, ShieldCheck, Tag, Edit, X } from 'lucide-react';
import { IntegrationDev } from '../../services/integrationService';

interface Props {
  shipmentId: string | number;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

export const ShipmentStatusUpdater: React.FC<Props> = ({ shipmentId, currentStatus, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateBackendStatus = async (shipmentId: string | number, statusName: string, txHash: string) => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusName,
          transactionHash: txHash
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Lỗi khi cập nhật trạng thái backend.');
      }

      return await response.json();
    } catch (err: any) {
      console.error('Backend update error:', err);
      throw err;
    }
  };


  const handleUpdate = async (newStatusEnum: number, statusName: string) => {
    setIsOpen(false);
    if (!confirm(`Bạn có chắc muốn đổi trạng thái thành "${statusName}"?`)) return;

    setLoading(true);
    setError('');

    try {
      const tx = await callUpdateStatus(shipmentId, newStatusEnum);

      console.log("Hash nhận được:", tx.hash);

      await tx.wait();

      await updateBackendStatus(shipmentId, statusName, tx.hash);

      await IntegrationDev.updateStatus({
        shipmentId: shipmentId,
        status: statusName,
        transactionHash: tx.hash
      });

      alert(`Cập nhật thành công!\nTrạng thái: ${statusName}\nHash: ${tx.hash.substring(0, 10)}...`);

      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center text-blue-600 text-xs">
        <RefreshCw className="animate-spin h-3 w-3 mr-1" />
        Updating...
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
        title="Hành động"
      >
        <Edit className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="py-1">
            <button
              onClick={() => handleUpdate(ShipmentStatus.SHIPPED, 'SHIPPED')}
              disabled={currentStatus === 'SHIPPED'}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50
                ${currentStatus === 'SHIPPED' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
              `}
            >
              <Truck className="w-4 h-4 text-yellow-600" />
              Ship (Giao hàng)
            </button>

            <button
              onClick={() => handleUpdate(ShipmentStatus.RECEIVED, 'RECEIVED')}
              disabled={currentStatus === 'RECEIVED'}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50
                ${currentStatus === 'RECEIVED' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
              `}
            >
              <PackageCheck className="w-4 h-4 text-purple-600" />
              Receive (Đã nhận)
            </button>

            <button
              onClick={() => handleUpdate(ShipmentStatus.AUDITED, 'AUDITED')}
              disabled={currentStatus === 'AUDITED'}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50
                ${currentStatus === 'AUDITED' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
              `}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Audit (Kiểm định)
            </button>

            <button
              onClick={() => handleUpdate(ShipmentStatus.FOR_SALE, 'FOR_SALE')}
              disabled={currentStatus === 'FOR_SALE'}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 border-t border-gray-100
                ${currentStatus === 'FOR_SALE' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
              `}
            >
              <Tag className="w-4 h-4 text-green-600" />
              Sell (Bán hàng)
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-64 bg-red-50 text-red-600 text-xs p-2 rounded border border-red-200 z-40 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  );
};