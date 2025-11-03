import React, { useState } from 'react';
import { ethers } from 'ethers';
import { callCreateShipment } from '../../services/blockchainService';
import { IntegrationDev } from '../../services/integrationService';
import { ShipmentList, Shipment } from './ShipmentList';

// ===== Spinner nho nhỏ =====
const Spinner = () => (
  <div
    className="inline-block animate-spin h-4 w-4 border-[2px] border-current border-t-transparent text-blue-600 rounded-full"
    role="status"
    aria-label="loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

// ===== Các bước hiển thị tiến trình =====
type Step = 'init' | 'connecting' | 'signing' | 'mining' | 'backend' | 'done';
const stepMessages: Record<Step, string> = {
  init: '',
  connecting: 'Đang kết nối MetaMask...',
  signing: 'Vui lòng ký giao dịch trên MetaMask...',
  mining: 'Đang chờ xác nhận giao dịch trên blockchain...',
  backend: 'Đang gửi dữ liệu lên hệ thống...',
  done: 'Hoàn tất!'
};

// ===== Helpers: nhận diện lỗi tạm thời & retry có kiểm soát =====

// Lỗi tạm thời nên retry: circuit breaker / 429 / 503 / timeout / network
const isTransientRpcError = (err: any) => {
  const msg = (err?.message || err?.reason || err?.shortMessage || '').toLowerCase();
  const code = err?.code || err?.status || err?.response?.status;

  const brokenCircuit =
    err?.data?.cause?.isBrokenCircuitError === true ||
    msg.includes('circuit breaker is open') ||
    msg.includes('breaker is open');

  const rateLimited = code === 429 || msg.includes('rate limit') || msg.includes('too many requests');
  const overloaded = code === 503 || msg.includes('overloaded') || msg.includes('service unavailable');
  const timeout = msg.includes('timeout') || msg.includes('timed out');

  const network =
    err?.code === 'NETWORK_ERROR' ||
    msg.includes('network error') ||
    msg.includes('fetch failed');

  return brokenCircuit || rateLimited || overloaded || timeout || network;
};

// Map lỗi RPC → thông điệp rõ ràng
const mapRpcErrorToMessage = (err: any): string => {
  const msg = (err?.message || err?.reason || err?.shortMessage || '').toLowerCase();
  const code = err?.code || err?.status || err?.response?.status;

  // 1) User từ chối ký
  if (code === 'ACTION_REJECTED' || msg.includes('user rejected')) {
    return 'Bạn đã từ chối giao dịch trên MetaMask';
  }

  // 2) Sai chain / chain mismatch
  if (msg.includes('chain') && msg.includes('mismatch')) {
    return 'Ví đang kết nối sai mạng. Vui lòng chuyển sang đúng network rồi thử lại';
  }

  // 3) Không đủ tiền gas
  if (code === 'INSUFFICIENT_FUNDS' || msg.includes('insufficient funds')) {
    return 'Không đủ số dư để trả phí gas';
  }

  // 4) Contract reject / invalid input
  if (code === 'CALL_EXCEPTION' || code === 'UNPREDICTABLE_GAS_LIMIT' || msg.includes('execution reverted')) {
    return 'Giao dịch bị từ chối bởi Smart Contract (vui lòng kiểm tra dữ liệu đầu vào)';
  }

  // 5) Circuit breaker / rate limit / overloaded / timeout
  if (isTransientRpcError(err)) {
    return 'Mạng blockchain hoặc RPC đang quá tải/tắc nghẽn, vui lòng thử lại sau ít phút';
  }

  // 6) Network lỗi chung
  if (code === 'NETWORK_ERROR' || msg.includes('network error')) {
    return 'Mất kết nối mạng. Vui lòng kiểm tra Internet';
  }

  // 7) Fallback chung
  return 'Có lỗi không xác định xảy ra';
};

// Retry wrapper (exponential backoff)
const withRetry = async <T,>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number } = {}
): Promise<T> => {
  const retries = options.retries ?? 3;
  const base = options.baseDelayMs ?? 800;

  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (attempt === retries || !isTransientRpcError(err)) {
        break;
      }
      const delay = base * Math.pow(2, attempt); // 0.8s, 1.6s, 3.2s
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
};

export const CreateShipmentForm: React.FC = () => {
  const [productName, setProductName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<Step>('init');
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);

  const handleRetry = () => {
    setError('');
    setCurrentStep('init');
    setIsLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!productName || !quantity || !timestamp) {
      setError('Vui lòng nhập đầy đủ thông tin (Tên, Số lượng, Thời gian)');
      return;
    }

    const quantityNum = parseInt(quantity, 10);
    const manufacturingDateISO = new Date(timestamp).toISOString();
    const manufactureTimestampUnix = Math.floor(new Date(timestamp).getTime() / 1000);

    if (isNaN(quantityNum) || quantityNum <= 0 || isNaN(manufactureTimestampUnix)) {
      setError('Số lượng hoặc Thời gian không hợp lệ');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentStep('connecting');

    let producerAddress = '';

    try {
      // 0) Kết nối ví & kiểm tra network (tùy chọn)
      if (typeof (window as any).ethereum === 'undefined') {
        throw new Error('MetaMask chưa được cài đặt!');
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // (Optional) kiểm tra chainId đúng mạng
      // const { chainId } = await provider.getNetwork();
      // if (Number(chainId) !== 11155111) { // ví dụ Sepolia
      //   throw new Error('CHAIN_MISMATCH');
      // }

      producerAddress = await signer.getAddress();
      setCurrentStep('signing');

      // 1) Gọi contract + mining với retry cho lỗi tạm thời
      setCurrentStep('mining');
      const tx = await withRetry(
        async () => {
          return await callCreateShipment({
            productName: productName,
            quantity: quantityNum,
            manufactureTimestamp: manufactureTimestampUnix
          });
        },
        { retries: 3, baseDelayMs: 800 }
      );

      const receipt: any = await withRetry(() => tx.wait(), { retries: 3, baseDelayMs: 800 });
      const hash = receipt?.hash || receipt?.transactionHash;
      setTxHash(hash || '');

      // 2) Gọi backend (không retry quá tích cực để tránh nhân bản ghi)
      setCurrentStep('backend');
      await IntegrationDev.sendToBackend({
        productName: productName,
        quantity: quantityNum,
        manufacturingDate: manufacturingDateISO,
        transactionHash: hash,
        producerAddress: producerAddress
      });

      // 3) Hoàn tất
      setCurrentStep('done');

      // Cập nhật danh sách lô hàng vừa tạo (giới hạn 5)
      setRecentShipments((prev) => [
        { productName, quantity, timestamp, txHash: hash },
        ...prev
      ].slice(0, 5));

      // Reset form
      setProductName('');
      setQuantity('');
      setTimestamp('');
    } catch (err: any) {
      console.error('Chi tiết lỗi:', err);
      const errorMsg = mapRpcErrorToMessage(err);
      setError(errorMsg);
      setCurrentStep('init');
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
            type="text"
            id="productName"
            value={productName}
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
            type="number"
            id="quantity"
            value={quantity}
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
            type="datetime-local"
            id="timestamp"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo Lô Hàng'}
        </button>
      </form>

      {/* Progress & Status */}
      <div className="mt-4 space-y-2">
        {/* Progress Steps */}
        {isLoading && currentStep !== 'init' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Spinner />
            <span>{stepMessages[currentStep]}</span>
          </div>
        )}

        {/* Success Message */}
        {currentStep === 'done' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Thành công! Lô hàng đã được tạo.
              {txHash && (
                <>
                  <span className="block mt-1 text-xs">
                    Transaction: <code className="bg-green-100 px-1">{txHash}</code>
                  </span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`} // Đổi explorer theo network bạn dùng
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-1 text-xs text-blue-600 hover:underline"
                  >
                    Xem giao dịch trên explorer
                  </a>
                </>
              )}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-red-600 flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="self-end px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                ↺ Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Recent Shipments List */}
        <ShipmentList shipments={recentShipments} title="Các Lô Hàng Vừa Tạo" />
      </div>
    </div>
  );
};
