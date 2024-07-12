import express from 'express';
import { upload } from '../controllers/upload.controller';

const router = express.Router();
const multer = require('multer');
const uploadMulter = multer({ storage: multer.memoryStorage() });

// /api/upload
router.post('/', uploadMulter.single('file'), upload); // 上傳圖片

export default router;
