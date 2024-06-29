import express from 'express';
import { isAuth } from '../service/auth';
import {
  getNotifications,
  readNotification,
  deleteNotification,
  readAllNotifications,
  deleteAllNotifications,
} from '../controllers/notifications.controllers';

const router = express.Router();

// /api/notifications
router.get('/', isAuth, getNotifications); // 取得通知列表
router.post('/read-all', isAuth, readAllNotifications); // 已讀全部通知
router.delete('/delete-all', isAuth, deleteAllNotifications); // 刪除全部通知
router.post('/:id', isAuth, readNotification); //已讀通知
router.delete('/:id', isAuth, deleteNotification); // 刪除通知

export default router;
