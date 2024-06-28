import express from 'express';
import { isAuth } from '../service/auth';
import { userOrders } from '../controllers/order.controller';
const router = express.Router();

// /api/user/order
router.get('/list', isAuth, userOrders); //學員-已購買課程

export default router;
