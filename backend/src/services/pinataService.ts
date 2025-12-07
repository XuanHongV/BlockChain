import dotenv from "dotenv";
dotenv.config();
import pinataSDK from "@pinata/sdk";
import fs from "fs";         
import path from "path"; 

const pinata = new pinataSDK(process.env.PINATA_API_KEY!,
    process.env.PINATA_API_SECRET!);
pinata.testAuthentication()
    .then((res) => console.log("Pinata Auth Success:", res))
    .catch((err) => console.error("Pinata Auth Failed:", err));

export default pinata;


// === Helper upload file lên Pinata IPFS ===
export const uploadFileToIPFS = async (filePath: string) => {
  const stream = fs.createReadStream(filePath);

  const result = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: {
      name: path.basename(filePath),
    },
  });

  // result.IpfsHash là CID
  return result.IpfsHash;
};

