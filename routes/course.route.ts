import express from 'express';
import { getCourses, getCoursesDetails, coursesEvaluation } from '../controllers/course.controller';
import { isAuth } from '../service/auth';

const router = express.Router();

// /api/course
router.get('/', getCourses); //取得課程列表
router.get('/:id/details', getCoursesDetails); //取得課程詳情
router.post('/:courseId/evaluation', isAuth, coursesEvaluation); //評價課程

export default router;
