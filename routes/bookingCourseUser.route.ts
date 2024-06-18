import express from 'express';
import { isAuth } from '../service/auth';
import { userCancel, userGetShow } from '../controllers/bookingCourse.controller';

const router = express.Router();

router.post('/:id/cancel', isAuth, userCancel); //學員取消預約課程
router.get('/:id', isAuth, userGetShow); //學員-已預約詳情

export default router;
