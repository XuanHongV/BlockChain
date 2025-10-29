import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../src/models/User'; // Import User model

// Mở rộng kiểu Request của Express để có thể chứa thông tin user
declare global {
    namespace Express {
        interface Request {
            user?: any; // Bạn có thể định nghĩa kiểu User cụ thể ở đây
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Đọc JWT từ header 'Authorization'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token (loại bỏ 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };

            // Lấy thông tin user từ token và gắn vào req
            // Chúng ta loại bỏ mật khẩu khi lấy
            req.user = await User.findById(decoded._id).select('-password');

            if (!req.user) {
                 return res.status(401).json({ message: 'Không tìm thấy người dùng' });
            }

            next(); // Đi tiếp đến controller
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Xác thực thất bại, token không hợp lệ' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Xác thực thất bại, không tìm thấy token' });
    }
};
