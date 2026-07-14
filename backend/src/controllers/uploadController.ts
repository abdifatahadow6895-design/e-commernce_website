import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError } from '../utils/AppError.js';
import { config } from '../config/index.js';

const uploadDir = path.join(process.cwd(), config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new ValidationError('Only image files are allowed') as unknown as null, false);
};

export const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter,
});

export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new ValidationError('No file uploaded');
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, url, filename: req.file.filename });
});

export const uploadMultiple = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw new ValidationError('No files uploaded');
  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.status(201).json({ success: true, urls });
});
