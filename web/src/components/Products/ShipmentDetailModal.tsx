import React, { useEffect } from 'react';
import type { Shipment } from '../../types';
import { QRCodeSVG } from 'qrcode.react';

type Props = {
  open: boolean;
  shipment: Shipment | null;              
  onClose: () => void;                    
};


const badgeClass = (s: Shipment['status']) =>
  s === 'CREATED' ? 'bg-blue-100 text-blue-800' :
  s === 'SHIPPED' ? 'bg-yellow-100 text-yellow-800' :
  s === 'RECEIVED' ? 'bg-purple-100 text-purple-800' :
  s === 'AUDITED' ? 'bg-indigo-100 text-indigo-800' :
  s === 'FOR_SALE' ? 'bg-green-100 text-green-800' :
  'bg-gray-100 text-gray-700';

export const ShipmentDetailModal: React.FC<Props> = ({
  open,
  shipment,
  onClose,
}) => {

  // ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !shipment) return null;

  const qrLink = `${import.meta.env.VITE_API_URL}/shipments/${shipment.shipmentId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal content */}
      <div className="relative bg-white w-[520px] max-w-[92vw] rounded-xl shadow-xl p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Chi tiết lô hàng</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Header status pill */}
        <div className="mt-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass(shipment.status)}`}>
            {shipment.status}
          </span>
        </div>

        <div className="mt-4 flex flex-col items-center border rounded p-4 bg-gray-50">
          <h3 className="text-base font-medium mb-2">Quét mã để theo dõi lô hàng</h3>
          <QRCodeSVG value={qrLink} size={120} level="H" />
          <p className="mt-2 text-xs text-gray-500">ID: {shipment.shipmentId}</p>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><b>Mã lô hàng:</b> {shipment.shipmentId}</div>
          <div><b>Tên sản phẩm:</b> {shipment.productName}</div>
          <div><b>Số lượng:</b> {shipment.quantity}</div>
          <div><b>Ngày sản xuất:</b> {new Date(shipment.manufacturingDate).toLocaleString('vi-VN')}</div>
          <div className="sm:col-span-2">
            <b>Hash giao dịch:</b> <code className="break-all">{shipment.transactionHash}</code>
          </div>
          <div className="sm:col-span-2">
            <b>Producer:</b> {shipment.producerAddress}
          </div>
          <div><b>Tạo lúc:</b> {new Date(shipment.createdAt).toLocaleString('vi-VN')}</div>
          <div><b>Cập nhật:</b> {new Date(shipment.updatedAt).toLocaleString('vi-VN')}</div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-1 border rounded hover:bg-gray-100" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailModal;
