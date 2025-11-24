import React, { useState, useRef, useEffect } from 'react';
import { callUpdateStatus, ShipmentStatus } from '../../services/blockchainService';
import { RefreshCw, AlertCircle, Truck, PackageCheck, ShieldCheck, Tag, Edit, X, Check, Copy } from 'lucide-react';
import axios from "axios";

interface Props {
  shipmentId: string | number;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

export const ShipmentStatusUpdater: React.FC<Props> = ({ shipmentId, currentStatus, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'broadcast' | 'confirming' | 'sendingBackend'>('idle');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // State lưu hash
  const [successHash, setSuccessHash] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(successHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async (newStatusEnum: number, statusName: string) => {
    setIsOpen(false);
    if (!confirm(`Bạn có chắc muốn đổi trạng thái thành "${statusName}"?`)) return;

    setLoading(true);
    setPhase('broadcast');
    setError('');
    setSuccessHash('');

    try {
      // 1. Gọi Blockchain
      const tx = await callUpdateStatus(shipmentId, newStatusEnum);
      console.log("Hash nhận được:", tx.hash);
      setPhase('confirming');

      await tx.wait();
      setPhase('sendingBackend');
      setSuccessHash(tx.hash);

      await axios.patch(`${import.meta.env.VITE_API_URL}/shipments/status`, {
        shipmentId,
        newStatus: statusName,
        transactionHash: tx.hash
      });
      setPhase('idle');
      // 3. Cập nhật UI (Load lại danh sách)
      if (onStatusUpdated) onStatusUpdated();

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra.");
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    const label =
      phase === 'broadcast' ? 'Gửi giao dịch...' :
        phase === 'confirming' ? 'Đang chờ xác nhận trên blockchain...' :
          phase === 'sendingBackend' ? 'Ghi trạng thái lên server...' :
            'Đang xử lý...';

    return (
      <div className="flex items-center text-blue-600 text-xs animate-pulse">
        <RefreshCw className="animate-spin h-3 w-3 mr-1" />
        {label}
      </div>
    );
  }

  if (successHash) {
    return (
      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in zoom-in duration-300 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-green-700 flex items-center gap-1">
            <Check className="w-3 h-3" /> Thành công!
          </span>
          <button onClick={() => setSuccessHash('')}><X className="w-3 h-3 text-gray-400 hover:text-gray-600" /></button>
        </div>

        <p className="text-xs text-gray-600 mb-2">Hash giao dịch:</p>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-gray-300 mb-1">
          <code className="text-[10px] text-gray-800 font-mono truncate flex-1" title={successHash}>
            {successHash}
          </code>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors"
            title="Copy Hash"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 text-center italic">Transaction hash</p>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
        title="Cập nhật trạng thái"
      >
        <Edit className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="p-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Chọn hành động
          </div>
          <div className="py-1">
            <button
              onClick={() => handleUpdate(ShipmentStatus.SHIPPED, 'SHIPPED')}
              disabled={currentStatus === 'SHIPPED'}
              className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                ${currentStatus === 'SHIPPED' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
              `}
            >
              <Truck className={`w-4 h-4 ${currentStatus === 'SHIPPED' ? 'text-gray-400' : 'text-yellow-600'}`} />
              <span>Giao hàng (Ship)</span>
              {currentStatus === 'SHIPPED' && <Check className="w-3 h-3 ml-auto" />}
            </button>

            <button
              onClick={() => handleUpdate(ShipmentStatus.RECEIVED, 'RECEIVED')}
              disabled={currentStatus === 'RECEIVED'}
              className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                ${currentStatus === 'RECEIVED' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
              `}
            >
              <PackageCheck className={`w-4 h-4 ${currentStatus === 'RECEIVED' ? 'text-gray-400' : 'text-purple-600'}`} />
              <span>Đã nhận (Receive)</span>
              {currentStatus === 'RECEIVED' && <Check className="w-3 h-3 ml-auto" />}
            </button>

            <button
              onClick={() => handleUpdate(ShipmentStatus.AUDITED, 'AUDITED')}
              disabled={currentStatus === 'AUDITED'}
              className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                ${currentStatus === 'AUDITED' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
              `}
            >
              <ShieldCheck className={`w-4 h-4 ${currentStatus === 'AUDITED' ? 'text-gray-400' : 'text-indigo-600'}`} />
              <span>Kiểm định (Audit)</span>
              {currentStatus === 'AUDITED' && <Check className="w-3 h-3 ml-auto" />}
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={() => handleUpdate(ShipmentStatus.FOR_SALE, 'FOR_SALE')}
              disabled={currentStatus === 'FOR_SALE'}
              className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 hover:bg-blue-50 transition-colors
                ${currentStatus === 'FOR_SALE' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700'}
              `}
            >
              <Tag className={`w-4 h-4 ${currentStatus === 'FOR_SALE' ? 'text-gray-400' : 'text-green-600'}`} />
              <span>Bán hàng (Sell)</span>
              {currentStatus === 'FOR_SALE' && <Check className="w-3 h-3 ml-auto" />}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-64 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </div>
  );
};