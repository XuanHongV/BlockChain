import { ethers, type Provider, type Signer, type TransactionResponse } from "ethers";
import ABI from "../ABI.json";

const AMOY_CHAIN_ID_HEX = "0x13882";
const AMOY_CHAIN_ID_DECIMAL = 80002n;

const AMOY_CONFIG = {
  chainId: AMOY_CHAIN_ID_HEX,
  chainName: "Amoy",
  nativeCurrency: {
    name: "MATIC",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-amoy.polygon.technology/"], 
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};

const CONTRACT_ADDRESS = "0x9468ED35C5A8C2a766A1efE7ebCDB2CACc8C36e8";
const CONTRACT_ABI = ABI;

export enum ShipmentStatus {
  CREATED = 0,
  SHIPPED = 1,
  RECEIVED = 2,
  AUDITED = 3,
  FOR_SALE = 4
}

export const checkAndSwitchNetwork = async () => {
  if (typeof (window as any).ethereum === 'undefined') {
    throw new Error("Không tìm thấy ví MetaMask. Vui lòng cài đặt tiện ích này trên trình duyệt!");
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const network = await provider.getNetwork();
  
  if (network.chainId !== AMOY_CHAIN_ID_DECIMAL) {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AMOY_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.code === "4902" || switchError.message?.includes("Unrecognized chain ID")) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AMOY_CONFIG],
          });
        } catch (addError: any) {
          if (addError.code === 4001) throw new Error("Bạn đã từ chối thêm mạng Polygon Amoy.");
          throw new Error("Lỗi không thể thêm mạng Amoy vào ví.");
        }
      } 
      else if (switchError.code === 4001 || switchError.code === "4001") {
        throw new Error("Bạn đã từ chối chuyển sang mạng Amoy.");
      } 
      else {
        console.error(switchError);
        throw new Error("Lỗi chuyển mạng không xác định.");
      }
    }
  }
};

const getContractWithSigner = async () => {
  await checkAndSwitchNetwork();
  
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const getBlockchainContract = (providerOrSigner: Provider | Signer) => {
  try {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
  } catch (error) {
    console.error("Lỗi khởi tạo Contract:", error);
    throw new Error("Không thể khởi tạo hợp đồng.");
  }
};

const handleBlockchainError = (error: any): never => {
  console.error("Lỗi Blockchain gốc:", error);

  if (error.message && (error.message.includes("từ chối") || error.message.includes("MetaMask") || error.message.includes("mạng"))) {
      throw error; 
  }

  if (error.code === 'ACTION_REJECTED' || error.code === 4001 || error.message?.includes("user rejected")) {
    throw new Error("Bạn đã hủy giao dịch trên ví.");
  }

  let reason = error.reason || error.shortMessage || error.message || "";
  if (error.data?.message) reason = error.data.message;

  if (reason.includes("Not producer")) throw new Error("Bạn KHÔNG phải là chủ sở hữu (Producer) của lô này.");
  if (reason.includes("Not shipper")) throw new Error("Chỉ Bên vận chuyển mới được phép.");
  if (reason.includes("Invalid status")) throw new Error("Trạng thái không hợp lệ (Sai quy trình).");
  if (reason.includes("Shipment does not exist")) throw new Error("Lô hàng không tồn tại trên Chain.");

  throw new Error(` Lỗi hệ thống: ${reason}`);
};

interface ShipmentData {
  productName: string;
  quantity: number | string;
  manufactureTimestamp: number | string;
}

export const callCreateShipment = async (data: ShipmentData) => {
  try {
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
    let numericId = id.toString().replace('SHP-', '');
    const contract = await getContractWithSigner();
    const tx = await contract.updateStatus(numericId, newStatus);
    return tx;
  } catch (error: any) {
    handleBlockchainError(error);
  }
  throw new Error("Unknown error");
};

interface AddDocumentParams {
  shipmentId: string | number;
  fileHash: string; 
  docType: string;  
}

export const callAddDocumentHash = async (params: AddDocumentParams) => {
  try {
    const contract = await getContractWithSigner();
    let numericId = params.shipmentId.toString().replace('SHP-', '');

    console.log(`Adding Document Hash... ID: ${numericId}, Hash: ${params.fileHash}`);
    const tx = await contract.addDocumentHash(
      numericId,
      params.fileHash,
      // params.docType
    );
    return tx; 
  } catch (error: any) {
    handleBlockchainError(error);
  }
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
  try {
    let numericId = id.toString().replace('SHP-', '');
    let provider;

    if (typeof (window as any).ethereum !== 'undefined') {
        provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
        console.log("Không có ví, dùng Public RPC...");
        provider = new ethers.JsonRpcProvider("https://polygon-amoy.drpc.org");
    }

    const contract = getBlockchainContract(provider);
    console.log(`🔍 Reading Contract for ID: ${numericId}...`);

    const data = await contract.shipments(numericId);

    if (data[0] == 0n) throw new Error("Lô hàng không tồn tại");

    const statusMap = ["CREATED", "SHIPPED", "RECEIVED", "AUDITED", "FOR_SALE"];
    const statusIdx = Number(data[5]);

    return {
      id: `SHP-${data[0].toString()}`,
      productName: data[1],
      quantity: data[2].toString(),
      manufactureDate: new Date(Number(data[3]) * 1000).toLocaleString('vi-VN'),
      producer: data[4],
      status: statusMap[statusIdx] || "UNKNOWN",
      rawStatus: statusIdx
    };

  } catch (error: any) {
    console.error("Lỗi đọc:", error);
    if (error.message.includes("Lô hàng không tồn tại")) throw new Error(" Không tìm thấy lô hàng này trên Blockchain.");
    throw new Error("Lỗi kết nối hoặc lô hàng không tồn tại.");
  }
};