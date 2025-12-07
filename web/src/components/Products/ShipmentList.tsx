import React, { useState } from 'react';
import { Shipment } from '../../types';
import { ShipmentStatusUpdater } from './ShipmentStatusUpdater';
import { DocumentUpload } from '../Documents/DocumentUpload';
import { QRCodeGenerator } from '../Tracking/QRCodeGenerator'; 
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export type ShipmentListProps = {
  title?: string;
  shipments: Shipment[];
  onRefresh?: () => void;
};

const formatVN = (d: string | number | Date) => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('vi-VN');
  } catch {
    return 'Invalid Date';
  }
};

const renderStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    CREATED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-yellow-100 text-yellow-800',
    RECEIVED: 'bg-purple-100 text-purple-800',
    AUDITED: 'bg-indigo-100 text-indigo-800',
    FOR_SALE: 'bg-green-100 text-green-800',
  };
  const colorClass = colors[status] || 'bg-gray-100 text-gray-600';
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
      {status}
    </span>
  );
};

const ShipmentRow: React.FC<{ s: Shipment; onRefresh?: () => void }> = ({ s, onRefresh }) => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
        <td className="py-3 px-4 font-mono text-xs text-blue-600 font-bold">
          {s.shipmentId || s.transactionHash?.substring(0, 8)}
        </td>
        <td className="py-3 px-4 font-medium">{s.productName}</td>
        <td className="py-3 px-4">{renderStatusBadge(s.status)}</td>
        <td className="py-3 px-4 text-xs text-gray-500">{formatVN(s.updatedAt || s.createdAt)}</td>
        
        <td className="py-3 px-4 flex items-center gap-2">
          <ShipmentStatusUpdater 
            shipmentId={s.shipmentId || s.transactionHash}
            currentStatus={s.status}
            onStatusUpdated={onRefresh}
          />
          
          <button 
            onClick={() => setShowUpload(!showUpload)} 
            className={`p-1.5 rounded-full transition-colors ${showUpload ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-500'}`}
            title="Mở rộng: Upload tài liệu & QR Code"
          >
            {showUpload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>

      {showUpload && (
        <tr className="bg-blue-50/20 animate-in fade-in zoom-in duration-200">
          <td colSpan={5} className="p-0">
            <div className="border-b border-blue-100 p-6 bg-gradient-to-b from-blue-50/30 to-white">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    
                    <div className="flex-1 w-full">
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-full">
                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg mb-2">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Upload tài liệu
                                </span>
                            </div>
                            <DocumentUpload 
                                shipmentId={s.shipmentId || ""} 
                                onSuccess={() => {}} 
                            />
                        </div>
                    </div>
                <div className="flex-shrink-0 mx-auto md:mx-0">
                        <div className="relative">
                            <span className="absolute -top-3 -left-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                                TEM SẢN PHẨM
                            </span>
                            <QRCodeGenerator 
                                shipmentId={s.shipmentId || ""} 
                                productName={s.productName} 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                    <button 
                        onClick={() => setShowUpload(false)} 
                        className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1 hover:underline"
                    >
                        <ChevronUp className="w-3 h-3"/> Thu gọn
                    </button>
                </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const ShipmentList: React.FC<ShipmentListProps> = ({ title, shipments, onRefresh }) => {
  return (
    <div className="mt-6">
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>}
      
      {shipments.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Chưa có dữ liệu lô hàng.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="py-3 px-4 border-b">ID / Hash</th>
                <th className="py-3 px-4 border-b">Sản phẩm</th>
                <th className="py-3 px-4 border-b">Trạng thái</th>
                <th className="py-3 px-4 border-b">Ngày Tạo / Sửa</th>
                <th className="py-3 px-4 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <ShipmentRow 
                    key={s.shipmentId || s.transactionHash} 
                    s={s} 
                    onRefresh={onRefresh} 
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};