import express from 'express';
import { isAuth, isCoach } from '../service/auth';
import {
  coachCancel,
  userCancel,
} from '../controllers/bookingCourse.controller';

const router = express.Router();

router.post('/:bookingCourseId/cancel', isAuth, isCoach, coachCancel); //教練取消授課
router.post('/:bookingCourseId/cancel', isAuth, isCoach, userCancel); //學員取消預約課程

export default router;
