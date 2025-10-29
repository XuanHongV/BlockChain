import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db'; // Giả sử bạn có file này
import userRoutes from './routes/userRoutes';
import shipmentRoutes from './routes/shipmentRoutes'; // Import shipment routes

dotenv.config();
connectDB(); // Kết nối CSDL

const app = express();
const PORT = process.env.PORT || 8000;

// === THÊM DÒNG NÀY ===
// Middleware để phân tích (parse) JSON body
// Cần thiết để `req.body` trong `createShipment` hoạt động
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ======================

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/shipments', shipmentRoutes); // Thêm route cho shipment

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
