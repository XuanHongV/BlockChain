import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { callAddDocumentHash } from '../../services/blockchainService';
import { useToast } from '../context/ToastContext';

const computeFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

interface Props {
  shipmentId: string | number;
  onSuccess?: () => void;
}

export const DocumentUpload: React.FC<Props> = ({ shipmentId, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('CERTIFICATE');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      console.log("Đang tính hash file...");
      const hash = await computeFileHash(file);
      console.log("Generated Hash:", hash);

      showToast("Đang mở ví MetaMask...", "pending");

      const tx = await callAddDocumentHash({
        shipmentId: shipmentId,
        fileHash: hash,
        docType: docType
      });

      if (tx) {
        showToast("Giao dịch đã gửi! Đang chờ xác nhận...", "pending", tx.hash);
        await tx.wait();

        showToast("Lưu tài liệu lên Blockchain thành công!", "success", tx.hash);

        setFile(null);
        if (onSuccess) onSuccess();
      }

    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Lỗi tải tài liệu";
      if (msg.includes("rejected")) msg = "Bạn đã hủy giao dịch.";

      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mt-4">
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Thêm tài liệu minh chứng
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại tài liệu</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
          >
            <option value="CERTIFICATE">Chứng chỉ chất lượng (CO/CQ)</option>
            <option value="INVOICE">Hóa đơn (Invoice)</option>
            <option value="SHIPPING_NOTE">Phiếu vận đơn</option>
            <option value="CONTRACT">Hợp đồng mua bán</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Chọn file (PDF, ảnh...)</label>
          <input
            type="file"
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 cursor-pointer"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm
            ${!file || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`
          }
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Đang xử lý...' : 'Ký & Lưu Hash lên Blockchain'}
        </button>
      </div>
    </div>
  );
};