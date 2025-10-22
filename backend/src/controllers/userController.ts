
import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password_hash, 
    });

    return res.status(201).json({
      _id: user._id,
      email: user.email,
      message: 'Đăng ký thành công',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Lỗi', error });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // So sánh password với hash đã lưu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Lỗi server: Thiếu JWT_SECRET' });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '30d' });

    return res.json({
      _id: user._id,
      email: user.email,
      token,
      message: 'Đăng nhập thành công',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Lỗi', error });
  }
};
