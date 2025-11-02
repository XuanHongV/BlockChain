import React, { useState } from 'react';
import { ethers } from 'ethers'; 
import { callCreateShipment } from '../../services/blockchainService';
import { IntegrationDev } from '../../services/integrationService';

export const CreateShipmentForm: React.FC = () => {

  const [productName, setProductName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    
    if (!productName || !quantity || !timestamp) {
      setStatusMessage("Lỗi: Vui lòng nhập đầy đủ thông tin (Tên, Số lượng, Thời gian).");
      return;
    }

    
    const quantityNum = parseInt(quantity, 10);
    const manufacturingDateISO = new Date(timestamp).toISOString();
    const manufactureTimestampUnix = Math.floor(new Date(timestamp).getTime() / 1000); 

    if (isNaN(quantityNum) || quantityNum <= 0 || isNaN(manufactureTimestampUnix)) {
      setStatusMessage("Lỗi: Số lượng hoặc Thời gian không hợp lệ.");
      return;
    }

    setIsLoading(true);
    setStatusMessage('Đang mở ví MetaMask. Vui lòng xác nhận giao dịch...');

    let producerAddress = ''; 

    try {
      
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        producerAddress = await signer.getAddress(); 
      } else {
        throw new Error("MetaMask chưa được cài đặt!");
      }
      
      // 1. GỌI CONTRACT
      const tx = await callCreateShipment({
        productName: productName,
        quantity: quantityNum,
        manufactureTimestamp: manufactureTimestampUnix
      });

      setStatusMessage('Đang gửi giao dịch, vui lòng chờ xác nhận (mined)...');

      // 2. CHỜ ĐÀO VÀ LẤY HASH
      const receipt = await tx.wait(); 
      const txHash = receipt.hash;

      // 3. GỌI BACKEND
      setStatusMessage(`Giao dịch thành công! Đang gửi Hash ${txHash} tới backend...`);
      await IntegrationDev.sendToBackend({
          productName: productName,
          quantity: quantityNum,
          manufacturingDate: manufacturingDateISO,
          transactionHash: txHash,
          producerAddress: producerAddress
      });

      // 4. HOÀN TẤT
      setStatusMessage(`Thành công! Lô hàng "${productName}" đã tạo và gửi lên backend. Tx: ${txHash}`);
      setProductName(''); 
      setQuantity('');
      setTimestamp('');

    } catch (error: any) {
      console.error("Chi tiết lỗi:", error);
      let friendlyMessage = "Lỗi: Có lỗi không xác định xảy ra.";

      if (error.code === 'ACTION_REJECTED') { 
        friendlyMessage = "Lỗi: Bạn đã từ chối giao dịch trên MetaMask.";
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        friendlyMessage = "Lỗi: Không đủ tiền (ví dụ: tBNB) trong ví để trả phí gas.";
      } else if (error.code === 'NETWORK_ERROR') {
        friendlyMessage = "Lỗi: Mất kết nối mạng. Vui lòng kiểm tra Internet.";
      } else if (error.code === 'CALL_EXCEPTION' || error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        friendlyMessage = "Lỗi: Giao dịch bị từ chối bởi Smart Contract (kiểm tra dữ liệu đầu vào).";
      } else if (error.message && error.message.includes("MetaMask chưa được cài đặt")) {
        friendlyMessage = "Lỗi: Vui lòng cài đặt MetaMask!";
      }
      setStatusMessage(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Tạo Lô Hàng Mới</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
            Tên Sản Phẩm
          </label>
          <input
            type="text" id="productName" value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Ví dụ: Vắc-xin Lô A123"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Số Lượng
          </label>
          <input
            type="number" id="quantity" value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ví dụ: 1000"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>


        <div>
          <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
            Thời Gian Sản Xuất
          </label>
          <input
            type="datetime-local" id="timestamp" value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        
        
        <button
          type="submit"
          className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo Lô Hàng'}
        </button>
      </form>


      {statusMessage && (
        <p className={`mt-4 text-sm ${statusMessage.startsWith('Lỗi:') ? 'text-red-600' : 'text-green-600'}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
};