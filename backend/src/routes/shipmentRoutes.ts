import express from "express";
import { getShipments, createShipment, getShipmentById, updateShipmentStatus, } from "../controllers/shipmentController";


const router = express.Router();

router.get("/", getShipments);
router.post("/", createShipment);  
router.get('/:id', getShipmentById);
router.patch("/status", updateShipmentStatus); 


export default router;
