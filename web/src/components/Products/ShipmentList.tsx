import React, { useState } from 'react';
import { Shipment } from '../../types';
import { ShipmentStatusUpdater } from './ShipmentStatusUpdater';
import ShipmentDetailModal from './ShipmentDetailModal';

export type ShipmentListProps = {
  title?: string;
  shipments: Shipment[];
  onRefresh?: () => void; // Thêm prop này để reload lại list sau khi update xong
};

export const ShipmentList: React.FC<ShipmentListProps> = ({ title, shipments, onRefresh }) => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [open, setOpen] = useState(false);

  const formatVN = (d: string | number | Date | undefined) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('vi-VN');
  };

  // Helper để render trạng thái có màu sắc (Badge)
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
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  const handleClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setOpen(true);
  };

  return (
    <div className="mt-6">
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>}

      {shipments.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Chưa có dữ liệu lô hàng.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="py-3 px-4 border-b">ID / Hash</th>
                <th className="py-3 px-4 border-b">Sản phẩm</th>
                <th className="py-3 px-4 border-b">Trạng thái</th>
                <th className="py-3 px-4 border-b">Ngày tạo/Sửa</th>
                <th className="py-3 px-4 border-b text-center">Cập nhật</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {shipments.map((s) => (
                <tr
                  key={s.shipmentId || s.transactionHash}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td
                    className="py-3 px-4 font-mono text-xs cursor-pointer"
                    onClick={() => handleClick(s)}
                    title={s.transactionHash || s.shipmentId}
                  >
                    {/* Ưu tiên hiển thị ShipmentID, nếu không có thì hiện Hash cắt ngắn */}
                    {s.shipmentId ? (
                      <span className="font-bold text-blue-600">{s.shipmentId}</span>
                    ) : (
                      <span>
                        {s.transactionHash ? `${s.transactionHash.substring(0, 10)}...` : '-'}
                      </span>
                    )}
                  </td>

                  <td
                    className="py-3 px-4 font-medium cursor-pointer"
                    onClick={() => handleClick(s)}
                  >
                    {s.productName || '-'}
                  </td>

                  <td className="py-3 px-4">
                    {renderStatusBadge(s.status)}
                  </td>

                  <td
                    className="py-3 px-4 text-gray-500 cursor-pointer"
                    onClick={() => handleClick(s)}
                  >
                    {formatVN(s.updatedAt || s.createdAt)}
                  </td>

                  {/* --- TÍCH HỢP NÚT CẬP NHẬT --- */}
                  <td className="py-3 px-4 text-center">
                    <ShipmentStatusUpdater
                      shipmentId={s.shipmentId || s.transactionHash}
                      currentStatus={s.status}
                      onStatusUpdated={() => {
                        // gọi onRefresh nếu parent truyền để reload data
                        if (onRefresh) onRefresh();
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal hiển thị chi tiết lô hàng */}
          <ShipmentDetailModal
            open={open}
            shipment={selectedShipment}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
