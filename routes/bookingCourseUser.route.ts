import express from 'express';
import { isAuth } from '../service/auth';
import { userCancel, userGetShow, userGetIndex, userCreate } from '../controllers/bookingCourse.controller';

const router = express.Router();

// /api/user/booking-course
router.post('/:id/cancel', isAuth, userCancel); //學員取消預約課程
router.get('/:id', isAuth, userGetShow); //學員-已預約詳情
router.get('/', isAuth, userGetIndex); //學員-已預約課程
router.post('/', isAuth, userCreate); //預約課程

export default router;
