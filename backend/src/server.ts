import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import shipmentRoutes from './routes/shipmentRoutes';

dotenv.config();
connectDB();

export const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});


// User routes
app.use('/api/users', userRoutes);

// Shipment routes
app.use('/api/shipments', shipmentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
