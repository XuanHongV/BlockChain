import express from "express";
import { getShipments, createShipment } from "../controllers/shipmentController";

const router = express.Router();

router.get("/", getShipments);
router.post("/", createShipment);  // ⬅️ endpoint bạn yêu cầu

export default router;
