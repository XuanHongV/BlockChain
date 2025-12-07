import express from "express";
import multer from "multer";
import path from "path";
import { uploadToIPFS } from "../controllers/ipfsController";

const upload = multer({
  dest: path.join(__dirname, "../../uploads"), // folder tạm
});

const router = express.Router();

// Frontend gửi form-data với key: "file"
router.post("/upload", upload.single("file"), uploadToIPFS);

export default router;
