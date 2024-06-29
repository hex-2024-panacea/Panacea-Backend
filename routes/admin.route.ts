import express from 'express';
import { isAuth, isAdmin } from '../service/auth';
import {
  adminUpdateCoachInfo,
  adminReviewCoach,
  adminUserList,
  adminUpdateUserInfo,
  adminCoachList,
  getCourseList,
  getOrderList,
  reviewCourse,
} from '../controllers/admin.controller';

const router = express.Router();

// /api/admin
router.get('/user/list', isAuth, adminUserList); // 後台 - 學員列表
router.put('/user/:id', isAuth, adminUpdateUserInfo); // 後台 - 學員編輯資料
router.get('/coach/list', isAuth, adminCoachList); // 後台 - 更新教練資料
router.put('/coach/:id', isAuth, adminUpdateCoachInfo); // 後台 - 更新教練資料
router.put('/coach/review/:id', isAuth, adminReviewCoach); // 後台 - 老師資料審核
router.get('/course/list', isAuth, isAdmin, getCourseList); // 後台 - 課程列表
router.get('/order/list', isAuth, isAdmin, getOrderList); // 後台 - 訂單列表
router.put('/course/review/:id', isAuth, isAdmin, reviewCourse); // 後台 - 課程審核

export default router;
