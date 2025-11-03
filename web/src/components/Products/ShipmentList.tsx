import React from 'react';

export interface Shipment {
  productName: string;
  quantity: string;
  timestamp: string;
  txHash: string;
}

interface ShipmentListProps {
  shipments: Shipment[];
  title?: string;
  className?: string;
}

export const ShipmentList: React.FC<ShipmentListProps> = ({ 
  shipments, 
  title = "Danh Sách Lô Hàng",
  className = "" 
}) => {
  if (shipments.length === 0) return null;

  return (
    <div className={`mt-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-3">
        {shipments.map((shipment, index) => (
          <div 
            key={shipment.txHash} 
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{shipment.productName}</h4>
                <p className="text-sm text-gray-600">
                  Số lượng: {shipment.quantity} | Thời gian: {shipment.timestamp}
                </p>
              </div>
              <span className="text-xs text-gray-500">#{index + 1}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Transaction: <code className="bg-gray-100 px-1">{shipment.txHash}</code>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};