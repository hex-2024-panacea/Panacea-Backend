import express from 'express';
import { isAuth, isCoach } from '../service/auth';
import {
  coachGetCourse,
  coachGetCourses,
  createCourse,
  editPrice,
  editSchedule,
  getSchedule,
  purchaseCourse,
  spgatewayNotify,
  deleteCourse,
  spgatewayReturn,
  editCourse,
} from '../controllers/course.controller';

const router = express.Router();

// /api/coach/course
router.post('/', isAuth, isCoach, createCourse); //建立課程
router.post('/purchase', isAuth, purchaseCourse); //購買課程
router.post('/notify', spgatewayNotify); //接收金流通知
router.post('/return', spgatewayReturn); //回傳金流通知
router.post('/:courseId/price', isAuth, isCoach, editPrice); //建立編輯課程授課價格
router.post('/:courseId/schedule', isAuth, isCoach, editSchedule); //建立編輯課程授課時間
router.get('/:courseId', isAuth, isCoach, coachGetCourse); //教練課程詳情頁
router.get('/', isAuth, isCoach, coachGetCourses); //教練-課程列表
router.get('/:courseId/schedule', isAuth, getSchedule); //教練-取得課程授課時間
router.patch('/:courseId', isAuth, isCoach, editCourse); //教練-取得課程授課時間
router.delete('/:courseId', isAuth, isCoach, deleteCourse); //教練-刪除課程

export default router;
