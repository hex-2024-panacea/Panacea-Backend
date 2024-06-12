import express from 'express';
import { isAuth } from '../service/auth';
import { createOrder } from '../controllers/goldFlow.controller';
const router = express.Router();

router.post('/order', createOrder); //建立訂單

export default router;
