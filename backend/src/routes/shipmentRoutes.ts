import express from "express";
import { getShipments, createShipment, getShipmentById,
     updateShipmentStatus, updateShipmentById, getShipmentStats  } from "../controllers/shipmentController";


const router = express.Router();

router.get("/stats", getShipmentStats); 
router.get("/", getShipments);
router.post("/", createShipment);  // lay ds shipment 
router.get('/:id', getShipmentById); // lay chi tiet 1 shipment theo id 
router.patch("/status", updateShipmentStatus); 
router.put("/:id", updateShipmentById); 



export default router;
