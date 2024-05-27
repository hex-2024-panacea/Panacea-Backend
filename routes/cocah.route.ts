import express from 'express';
import { isAuth } from '../service/auth';
import { updateCoachBankAccount } from '../controllers/cocah.controller';

const router = express.Router();

router.post('/api/coach/update/payment-account', isAuth, updateCoachBankAccount); // 更新教練銀行帳戶

export default router;
