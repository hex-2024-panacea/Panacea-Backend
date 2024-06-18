import express from 'express';
import { isAuth, isCoach } from '../service/auth';
import { coachCancel, coachGetShow } from '../controllers/bookingCourse.controller';

const router = express.Router();

router.post('/:id/cancel', isAuth, isCoach, coachCancel); //教練取消授課
router.get('/:id', isAuth, isCoach, coachGetShow); //教練-授課詳情

export default router;
