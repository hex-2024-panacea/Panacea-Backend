import express from 'express';
import { isAuth } from '../service/auth';
import {
  getNotifications,
  readNotification,
  deleteNotification,
  readAllNotifications,
} from '../controllers/notifications.controllers';

const router = express.Router();

router.get('/api/notifications', isAuth, getNotifications); // 取得通知列表
router.post('/api/notifications/:id', isAuth, readNotification); //已讀通知
router.delete('/api/notifications/:id', isAuth, deleteNotification); // 刪除通知
router.post('/api/notifications/read-all', isAuth, readAllNotifications); // 已讀全部通知

export default router;
