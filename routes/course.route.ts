import express from 'express';
import { isAuth, isCoach } from '../service/auth';
import {
  coachGetCourse,
  createCourse,
  editPrice,
  editSchedule,
  purchaseCourse,
  spgatewayNotify,
} from '../controllers/course.controller';

const router = express.Router();

router.post('/api/coach/course', isAuth, isCoach, createCourse); //建立課程
router.post('/api/coach/purchase', isAuth, purchaseCourse); //購買課程
router.post('/api/coach/notify', spgatewayNotify); //接收金流通知
router.post('/api/coach/course/:courseId/price', isAuth, isCoach, editPrice); //建立編輯課程授課價格
router.post('/api/coach/course/:courseId/schedule', isAuth, isCoach, editSchedule); //建立編輯課程授課時間
router.get('/api/coach/course/:courseId', isAuth, isCoach, coachGetCourse); //教練課程詳情頁

export default router;
