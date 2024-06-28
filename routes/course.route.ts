import express from 'express';
import { getCourses, getCoursesDetails } from '../controllers/course.controller';
const router = express.Router();

// /api/course
router.get('/', getCourses); //取得課程列表
router.get('/:id/details', getCoursesDetails); //取得課程詳情

export default router;
