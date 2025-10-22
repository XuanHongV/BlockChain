import express from 'express';
import { getShipments } from '../controllers/shipmentController';

const router = express.Router();

router.get('/', getShipments);

export default router;