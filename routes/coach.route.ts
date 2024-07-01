import express from 'express';
import { isAuth } from '../service/auth';
import { updateCoachBankAccount, getCoachCourseSchedule } from '../controllers/coach.controller';
const router = express.Router();

// /api/coach
router.post('/update/payment-account', isAuth, updateCoachBankAccount); // 更新教練銀行帳戶
router.get('/:coachId/course/:courseId/schedule', isAuth, getCoachCourseSchedule); // 取得課程可預約時間

export default router;
