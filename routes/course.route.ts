import express from 'express';
import { isAuth, isCoach } from '../service/auth';
import {
  coachGetCourse,
  coachGetCourses,
  createCourse,
  editPrice,
  editSchedule,
} from '../controllers/course.controller';

const router = express.Router();

router.post('/api/coach/course', isAuth, createCourse); //建立課程
router.post('/api/coach/course/:courseId/price', isAuth, editPrice); //建立編輯課程授課價格
router.post('/api/coach/course/:courseId/schedule', isAuth, editSchedule); //建立編輯課程授課時間
router.get('/api/coach/course/:courseId', isAuth, coachGetCourse); //教練課程詳情頁
// router.get('/api/coach/course/list', isAuth, isCoach, coachGetCourses);
router.get('/api/coach/course', coachGetCourses);

export default router;
