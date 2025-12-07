import { Request, Response } from "express";
import { uploadFileToIPFS } from "../services/pinataService";
import fs from "fs";

export const uploadToIPFS = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // 1. Upload file tạm lên IPFS qua Pinata
    const cid = await uploadFileToIPFS(file.path);

    // 2. Xoá file tạm sau khi upload
    try {
      fs.unlinkSync(file.path);
    } catch {
      // lỗi xoá file tạm thì bỏ qua
    }

    // 3. Trả CID cho frontend
    return res.status(200).json({
      message: "Upload to IPFS success",
      cid,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
    });
  } catch (error: any) {
    console.error("Upload IPFS error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Server error when uploading to IPFS" });
  }
};
