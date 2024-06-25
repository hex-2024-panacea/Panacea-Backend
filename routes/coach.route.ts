import express from 'express';
import { isAuth } from '../service/auth';
import { updateCoachBankAccount } from '../controllers/coach.controller';
import { getCourses, getCoursesDetails } from '../controllers/course.controller';
const router = express.Router();

router.post('/api/coach/update/payment-account', isAuth, updateCoachBankAccount); // 更新教練銀行帳戶
// /api/course
router.get('/api/course', getCourses); //取得課程列表
router.get('/api/course/:id/details', getCoursesDetails); //取得課程詳情

export default router;
