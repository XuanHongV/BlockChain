import { Request, Response } from "express";
import Shipment, { IShipment } from "../models/Shipment";
import mongoose from "mongoose";

export const getShipments = async (req: Request, res: Response) => {
  try {
    const {
      status,
      q,
      producerAddress,
      from,
      to,
      page = "1",
      limit = "20",
      sort = "-createdAt",
    } = req.query as Record<string, string>;

    const filter: any = {};
    if (status) filter.status = status;
    if (q) filter.productName = { $regex: q, $options: "i" };
    if (producerAddress)
      filter.producerAddress = String(producerAddress).toLowerCase();

    if (from || to) {
      filter.manufacturingDate = {};
      if (from) filter.manufacturingDate.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.manufacturingDate.$lte = end;
      }
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Shipment.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Shipment.countDocuments(filter),
    ]);

    return res.status(200).json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filter,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const createShipment = async (req: Request, res: Response) => {
  try {
    const {
      shipmentId,
      productName,
      quantity,
      manufacturingDate,
      status,
      transactionHash,
      producerAddress,
    } = req.body;

    // Validate bắt buộc
    if (!shipmentId || !productName || quantity == null || !manufacturingDate || !producerAddress) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["shipmentId", "productName", "quantity", "manufacturingDate", "producerAddress"],
      });
    }

    //Chuẩn hoá và kiểm tra dữ liệu
    const parsedQty = Number(quantity);
    const parsedDate = new Date(manufacturingDate);
    if (Number.isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({ message: "quantity must be a non-negative number" });
    }
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "manufacturingDate must be a valid ISO date string" });
    }

    //Kiểm tra trùng khoá trước khi tạo
    const existedById = await Shipment.findOne({ shipmentId }).lean();
    if (existedById) {
      return res.status(409).json({ message: "Duplicate shipmentId" });
    }
    if (transactionHash) {
      const existedByTx = await Shipment.findOne({ transactionHash }).lean();
      if (existedByTx) {
        return res.status(409).json({ message: "Duplicate transactionHash" });
      }
    }

    //Tạo document
    const doc = await Shipment.create({
      shipmentId,
      productName: String(productName).trim(),
      quantity: parsedQty,
      manufacturingDate: parsedDate,
      status,
      transactionHash: transactionHash ? String(transactionHash).trim() : undefined,
      producerAddress: String(producerAddress).toLowerCase().trim(),
    });

    return res.status(201).json(doc);
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "unique_field";
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Lấy chi tiết 1 shipment theo shipmentId hoặc _id (MongoDB)
export const getShipmentById = async (req: Request, res: Response) => {
  const id = req.params.id;

  const shipment = await Shipment.findOne({ shipmentId: id });

  if (!shipment) {
    // Nếu trình duyệt
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.status(404).send(`<h1> Không tìm thấy lô hàng: ${id}</h1>`);
    }

    // Nếu API
    return res.status(404).json({ error: 'Shipment not found' });
  }

  // Nếu browser mở route → trả HTML
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.send(`
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Thông tin lô hàng</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .box { border: 1px solid #ccc; padding: 16px; border-radius: 10px; }
        </style>
      </head>
      <body>
        <h1>Lô hàng ${shipment.shipmentId}</h1>
        <div class="box">
          <p><b>Tên SP:</b> ${shipment.productName}</p>
          <p><b>Số lượng:</b> ${shipment.quantity}</p>
          <p><b>Trạng thái:</b> ${shipment.status}</p>
          <p><b>Ngày SX:</b> ${new Date(shipment.manufacturingDate).toLocaleString('vi-VN')}</p>
        </div>
      </body>
      </html>
    `);
  }

  // Nếu là REST client / Axios → trả JSON
  return res.json(shipment);
};

// Cập nhật trạng thái lô hàng + transactionHash
export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const {
      shipmentId,
      newStatus,
      transactionHash,
    }: {
      shipmentId?: string;
      newStatus?: IShipment["status"];
      transactionHash?: string;
    } = req.body;

    // 1. Validate input
    if (!shipmentId || !newStatus || !transactionHash) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["shipmentId", "newStatus", "transactionHash"],
      });
    }

    // 2. Tìm shipment theo shipmentId
    const shipment = await Shipment.findOne({ shipmentId }).exec();
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // 3. Kiểm tra trùng transactionHash với lô hàng khác
    const existedByTx = await Shipment.findOne({
      transactionHash: transactionHash.trim(),
      _id: { $ne: shipment._id },
    }).lean();

    if (existedByTx) {
      return res.status(409).json({ message: "Duplicate transactionHash" });
    }

    // 4. Cập nhật status + transactionHash
    shipment.status = newStatus;
    shipment.transactionHash = transactionHash.trim();

    await shipment.save();

    // 5. Trả về kết quả
    return res.status(200).json({
      message: "Shipment status updated successfully",
      data: shipment,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Cập nhật lô hàng theo id (có thể là _id hoặc shipmentId)
// Cho phép cập nhật status, transactionHash, ipfsHash
export const updateShipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Lấy dữ liệu từ body (đều là OPTIONAL)
    const {
      status: newStatus,
      transactionHash,
      ipfsHash,
    }: {
      status?: IShipment["status"];
      transactionHash?: string;
      ipfsHash?: string;
    } = req.body;

    // Nếu không có gì để cập nhật thì báo lỗi
    if (!newStatus && !transactionHash && !ipfsHash) {
      return res.status(400).json({
        message: "No fields to update. You can send status, transactionHash or ipfsHash.",
      });
    }

    // Cho phép id là _id (ObjectId) hoặc shipmentId
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { shipmentId: id };

    // Tìm shipment
    const shipment = await Shipment.findOne(filter).exec();
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // 1. Xử lý transactionHash (nếu có gửi)
    if (transactionHash && transactionHash.trim() !== shipment.transactionHash) {
      const newTx = transactionHash.trim();

      // Check trùng hash với lô hàng khác
      const existedByTx = await Shipment.findOne({
        transactionHash: newTx,
        _id: { $ne: shipment._id },
      }).lean();

      if (existedByTx) {
        return res.status(409).json({ message: "Duplicate transactionHash" });
      }

      shipment.transactionHash = newTx;
    }

    // 2. Xử lý status (nếu có gửi)
    if (newStatus) {
      shipment.status = newStatus as IShipment["status"];
    }

    // 3. Xử lý ipfsHash (HASH IPFS)
    if (ipfsHash) {
      shipment.ipfsHash = String(ipfsHash).trim();
    }

    await shipment.save();

    return res.status(200).json({
      message: "Shipment updated successfully",
      data: shipment,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};


// Thống kê đơn giản: tổng số lô, số lô ở trạng thái cuối cùng
export const getShipmentStats = async (req: Request, res: Response) => {
  try {
    // truyền finalStatus qua query, mặc định là "FOR_SALE"
    const finalStatus =
      (req.query.finalStatus as IShipment["status"]) || "FOR_SALE";

    // Đếm song song
    const [total, finalCount] = await Promise.all([
      Shipment.countDocuments({}),                 // tổng số lô hàng
      Shipment.countDocuments({ status: finalStatus }), // số lô ở trạng thái cuối
    ]);

    return res.status(200).json({
      totalShipments: total,
      finalStatus,
      finalShipments: finalCount,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Server error" });
  }
};




