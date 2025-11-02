import { ethers, type Provider, type Signer } from "ethers";

const CONTRACT_ADDRESS = "0xD7070F3e64aD987cb99A37d1A18877E407dC7586";

const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "qty",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "createShipment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "producer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "manufactureTimestamp",
                "type": "uint256"
            }
        ],
        "name": "ShipmentCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "shipments",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "manufactureTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "producer",
                "type": "address"
            },
            {
                "internalType": "enum SupplyChain.Status",
                "name": "currentStatus",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

/**
 * @param providerOrSigner 
 * @returns 
 */
export const getBlockchainContract = (providerOrSigner: Provider | Signer) => {
  try {
    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      providerOrSigner
    );
    
    return contractInstance;

  } catch (error) {
    console.error("Lỗi khi khởi tạo Smart Contract:", error);
    throw new Error("Không thể khởi tạo hợp đồng. Kiểm tra địa chỉ, ABI và kết nối.");
  }
};


interface ShipmentData {
  productName: string;
  quantity: number | string; 
  manufactureTimestamp: number | string;
}

export const callCreateShipment = async (data: ShipmentData) => {
  
  if (typeof window.ethereum === 'undefined') {
    throw new Error("MetaMask chưa được cài đặt!");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = getBlockchainContract(signer);

    if (!contract) {
      throw new Error("Không thể khởi tạo hợp đồng.");
    }

    const tx = await contract.createShipment(data.productName,
        data.quantity,
        data.manufactureTimestamp);
    
    return tx;

  } catch (error: any) {
    console.error("Lỗi khi gọi createShipment:", error);
    throw error; 
  }
};