import express from 'express';
import { isAuth } from '../service/auth';
import { adminUpdateCoachInfo } from '../controllers/admin.controller';

const router = express.Router();

router.put('/api/admin/coach/:id', isAuth, adminUpdateCoachInfo); // 後台 - 更新教練資料
router.put('/api/admin/coach/review/:id', isAuth, adminUpdateCoachInfo); // 後台 - 老師資料審核

export default router;
