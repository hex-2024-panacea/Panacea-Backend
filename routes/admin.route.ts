import express from 'express';
import { isAuth, isAdmin } from '../service/auth';
import {
  adminUpdateCoachInfo,
  adminReviewCoach,
  adminUserList,
  adminUpdateUserInfo,
  adminCoachList,
  getCourseList,
} from '../controllers/admin.controller';

const router = express.Router();

router.get('/user/list', isAuth, adminUserList); // 後台 - 學員列表
router.put('/user/:id', isAuth, adminUpdateUserInfo); // 後台 - 學員編輯資料
router.get('/coach/list', isAuth, adminCoachList); // 後台 - 更新教練資料
router.put('/coach/:id', isAuth, adminUpdateCoachInfo); // 後台 - 更新教練資料
router.put('/coach/review/:id', isAuth, adminReviewCoach); // 後台 - 老師資料審核
router.put('/course/list', isAuth, isAdmin, getCourseList); // 後台 - 課程列表

export default router;
