import express from 'express';
import { isAuth } from '../service/auth';
import { updateCoachBankAccount } from '../controllers/coach.controller';
const router = express.Router();

// /api/coach
router.post('/update/payment-account', isAuth, updateCoachBankAccount); // 更新教練銀行帳戶

export default router;
