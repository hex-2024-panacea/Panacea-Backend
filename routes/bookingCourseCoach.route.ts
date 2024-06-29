import express from 'express';
import { isAuth, isCoach } from '../service/auth';
import { coachCancel, coachGetShow, coachGetIndex } from '../controllers/bookingCourse.controller';

const router = express.Router();

// bookingCourseCoach
router.post('/:id/cancel', isAuth, isCoach, coachCancel); //教練取消授課
router.get('/:id', isAuth, isCoach, coachGetShow); //教練-授課詳情
router.get('/', isAuth, isCoach, coachGetIndex); //教練-取得授課清單

export default router;
