import express from 'express';
import { isAuth } from '../service/auth';
import { userCancel } from '../controllers/bookingCourse.controller';

const router = express.Router();

router.post('/:id/cancel', isAuth, userCancel); //學員取消預約課程

export default router;
