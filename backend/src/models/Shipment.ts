import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
    productName: string;
    status: string;
}

const ShipmentSchema: Schema = new Schema({
    productName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        // Bạn có thể dùng enum để giới hạn các trạng thái
        // enum: ['Created', 'InTransit', 'Delivered'],
        // default: 'Created'
    }
}, {
    timestamps: true
});

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);