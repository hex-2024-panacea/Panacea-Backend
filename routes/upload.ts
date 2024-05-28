import express from 'express';
import dotenv from 'dotenv';
const multer = require('multer');
import { upload } from '../controllers/upload';
dotenv.config({ path: '../.env' });

const router = express.Router();
const uploadMulter = multer({ storage: multer.memoryStorage() });

router.post('/api/upload', uploadMulter.single('file'), upload); // 上傳圖片

export default router;
