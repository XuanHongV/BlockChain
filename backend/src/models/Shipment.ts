import mongoose, { Schema, Document } from 'mongoose';

export type ShipmentStatus = 'CREATED' | 'SHIPPED' | 'RECEIVED' | 'AUDITED' | 'FOR_SALE';

// entry lịch sử trạng thái
export interface IStatusHistoryEntry {
  status: ShipmentStatus;
  transactionHash?: string;
  changedAt: Date;
}

export interface IShipment extends Document {
    shipmentId: string;
    productName: string;
    quantity: number;
    manufacturingDate: Date;
    status: ShipmentStatus;
    transactionHash: string;
    producerAddress: string;
    createdAt: Date; 
    updatedAt: Date; 
    statusHistory?: IStatusHistoryEntry[];
    ipfsHash?: string;
}

const statusEnum: ShipmentStatus[] = [
  'CREATED',
  'SHIPPED',
  'RECEIVED',
  'AUDITED',
  'FOR_SALE',
];

// Schema con bản ghi lịch sử
const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: statusEnum,
      required: true,
    },
    transactionHash: {
      type: String,
      trim: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);
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
            enum: ["CREATED", "SHIPPED", "RECEIVED", "AUDITED", "FOR_SALE"],
            default: "CREATED",
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
        statusHistory: {
            type: [StatusHistorySchema],
            default: [],
        },
        ipfsHash: {
            type: String,
            trim: true,
    },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);