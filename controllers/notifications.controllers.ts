import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { NotificationsModel } from '../models/notifications.model';
// 取得通知列表
export const getNotifications = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  try {
    const notificationsModelData = await NotificationsModel.find({ receiver: _id, status: 'active' })
      .sort({ createdAt: -1 })
      .select('-receiver -__v');
    handleSuccess(res, 200, 'get success', notificationsModelData ? notificationsModelData : []);
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 已讀通知
export const readNotification = handleErrorAsync(async (req, res, next) => {
  const notificationId = req.params.id;
  try {
    const NotificationsModelData = await NotificationsModel.findByIdAndUpdate(
      notificationId,
      { status: 'seen' },
      { new: true }
    );
    if (!NotificationsModelData) return appErrorService(400, 'notification not found', next);
    handleSuccess(res, 200, 'read success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 刪除通知
export const deleteNotification = handleErrorAsync(async (req, res, next) => {
  const notificationId = req.params.id;
  try {
    const NotificationsModelData = await NotificationsModel.findByIdAndDelete(notificationId);
    if (!NotificationsModelData) return appErrorService(400, 'notification not found', next);
    handleSuccess(res, 200, 'delete success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 已讀全部通知
export const readAllNotifications = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  try {
    await NotificationsModel.updateMany({ receiver: _id }, { status: 'seen' });
    handleSuccess(res, 200, 'read all success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 刪除全部通知
export const deleteAllNotifications = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  try {
    await NotificationsModel.deleteMany({ receiver: _id });
    handleSuccess(res, 200, 'delete all success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
