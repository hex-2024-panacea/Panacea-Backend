import express from 'express';
import { isAuth, isCoach } from '../service/auth';
import { coachCancel } from '../controllers/bookingCourse.controller';

const router = express.Router();

router.post('/:id/cancel', isAuth, isCoach, coachCancel); //教練取消授課

export default router;
