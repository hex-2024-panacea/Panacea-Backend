import { NotificationsModel } from '../models/notifications.model';

//創建通知
export const createNotification = async (
  receiverId: string,
  title: string,
  type: 'bookingSuccess' | 'classNotification'
) => {
  try {
    const notification = new NotificationsModel({
      receiver: receiverId,
      title,
      type,
      createdAt: Date.now(),
    });
    await notification.save();
    console.log('Notification created:', notification);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
