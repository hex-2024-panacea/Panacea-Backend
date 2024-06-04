import handleErrorAsync from '../service/handleErrorAsync';
import appErrorService from '../service/appErrorService';
import handleSuccess from '../service/handleSuccess';
import { UserModel } from '../models/users';
import { NotificationsModel } from '../models/notifications.model';

// 取得通知列表
export const getNotifications = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  try {
    const user = await UserModel.findById(_id).populate('notifications').select('notifications');
    handleSuccess(res, 200, '', user!.notifications);
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 已讀通知
export const readNotification = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  const notificationId = req.params.id;
  try {
    const user = await UserModel.findById(_id).populate('notifications').select('notifications');
    const notification = user!.notifications.id(notificationId);
    notification!.isRead = true;
    await user!.save();
    handleSuccess(res, 200, 'read success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 刪除通知
export const deleteNotification = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  const notificationId = req.params.id;
  try {
    const user = await UserModel.findById(_id).populate('notifications').select('notifications');
    user!.notifications.id(notificationId).remove();
    await user!.save();
    handleSuccess(res, 200, 'delete success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});

// 已讀全部通知
export const readAllNotifications = handleErrorAsync(async (req, res, next) => {
  const _id = req.user?.id;
  try {
    const user = await UserModel.findById(_id).populate('notifications').select('notifications');
    user!.notifications.forEach((notification) => {
      notification.isRead = true;
    });
    await user!.save();
    handleSuccess(res, 200, 'read all success');
  } catch (error) {
    return appErrorService(400, (error as Error).message, next);
  }
});
