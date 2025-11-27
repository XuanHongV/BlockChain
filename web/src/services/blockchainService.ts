import { ethers, type Provider, type Signer, type TransactionResponse } from "ethers";
import ABI from "../ABI.json";

const CONTRACT_ADDRESS = "0xb9e430F61F4d7C86eD19CBD8937B4BC03A65FdD5";
const CONTRACT_ABI = ABI;

export enum ShipmentStatus {
  CREATED = 0,
  SHIPPED = 1,
  RECEIVED = 2,
  AUDITED = 3,
  FOR_SALE = 4
}

const getContractWithSigner = async () => {
  if (typeof (window as any).ethereum === 'undefined') throw new Error("MetaMask is not installed!");
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};


export const getBlockchainContract = (providerOrSigner: Provider | Signer) => {
  try {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
  } catch (error) {
    console.error("Lỗi khởi tạo Hợp đồng Thông minh:", error);
    throw new Error("Không thể khởi tạo hợp đồng.");
  }
};

const handleBlockchainError = (error: any): never => {
  console.error("Lỗi Blockchain gốc:", error);

  if (error.code === 'ACTION_REJECTED' || error.code === 4001 || error.message?.includes("user rejected")) {
    throw new Error(" Bạn đã từ chối giao dịch.");
  }

  let reason = error.reason || error.shortMessage || error.message || "";

  if (error.data?.message) reason = error.data.message;

  if (reason.includes("Not producer")) {
    throw new Error("Bạn KHÔNG phải là Nhà sản xuất của lô hàng này.");
  }
  if (reason.includes("Not shipper")) {
    throw new Error("Chỉ Bên vận chuyển mới có thể cập nhật trạng thái này.");
  }
  if (reason.includes("Not retailer")) {
    throw new Error("Chỉ Nhà bán lẻ mới có thể cập nhật trạng thái này.");
  }
  if (reason.includes("Invalid status transition")) {
    throw new Error("Chuyển đổi trạng thái không hợp lệ! Phải theo thứ tự: Đã tạo -> Đã gửi -> Đã nhận...");
  }
  if (reason.includes("Shipment does not exist")) {
    throw new Error("Lô hàng không tồn tại trên Blockchain.");
  }

  throw new Error(`Lỗi Blockchain: ${reason}`);
};

interface ShipmentData {
  productName: string;
  quantity: number | string;
  manufactureTimestamp: number | string;
}

export const callCreateShipment = async (data: ShipmentData) => {
  try {
    //Contract nhanh
    const contract = await getContractWithSigner();

    const tx = await contract.createShipment(
      data.productName,
      data.quantity,
      data.manufactureTimestamp
    );
    return tx;
  } catch (error: any) {
    handleBlockchainError(error);
  }
};

export const callUpdateStatus = async (id: string | number, newStatus: number): Promise<TransactionResponse> => {
  try {
    
    let numericId = id.toString();
    if (numericId.startsWith('SHP-')) numericId = numericId.replace('SHP-', '');

    const contract = await getContractWithSigner();
    
    const tx = await contract.updateStatus(numericId, newStatus);
    
    return tx;

  } catch (error: any) {
    handleBlockchainError(error);
  }
  throw new Error("Unknown error");
};

export interface ChainShipmentData {
  id: string;
  productName: string;
  quantity: string;
  manufactureDate: string;
  producer: string;
  status: string;
  rawStatus: number;
}

export const getShipmentStatusOnChain = async (id: string | number): Promise<ChainShipmentData | null> => {
  if (!(window as any).ethereum) {
    console.warn("Không tìm thấy MetaMask.");
    return null;
  }

  try {
    let numericId: string;
    if (typeof id === 'string' && id.startsWith('SHP-')) {
      numericId = id.replace('SHP-', '');
    } else {
      numericId = id.toString();
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const contract = getBlockchainContract(provider);

    console.log(`Đang đọc Blockchain cho ID: ${numericId}...`);

    const data = await contract.shipments(numericId);

    if (data[0] == 0n) {
      throw new Error("Lô hàng không tồn tại");
    }

    const statusMap = ["ĐÃ TẠO", "ĐÃ GỬI", "ĐÃ NHẬN", "ĐÃ KIỂM DUYỆT", "ĐANG BÁN"];
    const statusIdx = Number(data[5]);

    const result: ChainShipmentData = {
      id: `SHP-${data[0].toString()}`,
      productName: data[1],
      quantity: data[2].toString(),
      manufactureDate: new Date(Number(data[3]) * 1000).toLocaleString('vi-VN'),
      producer: data[4],
      status: statusMap[statusIdx] || "KHÔNG XÁC ĐỊNH",
      rawStatus: statusIdx
    };

    return result;

  } catch (error: any) {
    console.error("Lỗi đọc:", error);
    if (error.message.includes("Lô hàng không tồn tại")) {
      throw new Error(" Không tìm thấy lô hàng trên Blockchain.");
    }
    throw new Error("Lỗi kết nối hoặc không tìm thấy lô hàng.");
  }
};