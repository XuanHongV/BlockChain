import axios from 'axios';

// API endpoint
const API_URL = 'http://localhost:8000/api/shipments';


interface BackendShipmentData {

  productName: string;
  quantity: number;
  manufacturingDate: string; 
  status?: string; 
  transactionHash: string;
  producerAddress: string; 
}

const sendToBackend = async (data: BackendShipmentData) => {
  console.log("IntegrationDev: Sending data to backend:", data);
  
  try {
    
    const requestBody = {
      
      productName: data.productName,
      quantity: data.quantity,
      manufacturingDate: data.manufacturingDate, 
      status: data.status || "CREATED", 
      transactionHash: data.transactionHash,
      producerAddress: data.producerAddress,
    };

    console.log("IntegrationDev: Request Body:", requestBody);

    const response = await axios.post(
      API_URL,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("IntegrationDev: Backend responded successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("IntegrationDev: Error sending data to backend:", error);
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.response?.statusText || error.message;
      throw new Error(`API Error (${error.response?.status}): ${errorMsg}`);
    } else {
      throw new Error("An unexpected error occurred while contacting the backend.");
    }
  }
};

export const IntegrationDev = {
  sendToBackend: sendToBackend,
};