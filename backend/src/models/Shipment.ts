import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
    shipmentId: string;
    productName: string;
    quantity: number;
    manufacturingDate: Date;
    status: 'CREATED' | 'SHIPPED' | 'RECEIVED' | 'AUDITED' | 'FOR_SALE';
    transactionHash: string;
    producerAddress: string;
    createdAt: Date; 
    updatedAt: Date; 
}

const ShipmentSchema: Schema = new Schema(
    {
        shipmentId: {
            type: String,
            required: [true, 'Vui lòng cung cấp ID lô hàng'],
            unique: true,
            trim: true,
            index: true, 
        },
        productName: {
            type: String,
            required: [true, 'Vui lòng cung cấp tên sản phẩm'],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Vui lòng cung cấp số lượng'],
            min: [1, 'Số lượng phải lớn hơn 0'],
        },
        manufacturingDate: {
            type: Date,
            required: [true, 'Vui lòng cung cấp ngày sản xuất'],
        },
        status: {
            type: String,
            required: true,
            enum: ['CREATED', 'SHIPPED', 'RECEIVED', 'AUDITED', 'FOR_SALE'],
            default: 'CREATED',
        },
        transactionHash: {
            type: String,
            required: [true, 'Vui lòng cung cấp mã hash giao dịch blockchain'],
            unique: true,
            trim: true,
        },
        producerAddress: {
            type: String,
            required: [true, 'Vui lòng cung cấp địa chỉ ví của nhà sản xuất'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);