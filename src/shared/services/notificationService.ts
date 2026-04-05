import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type NotificationType = 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'low_stock';

interface NotificationData {
  userId?: string;
  orderId?: string;
  productId?: string;
  productName?: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: any;
}

export const sendNotification = async (data: Omit<NotificationData, 'read' | 'createdAt'>) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log(`Notification sent: ${data.type} - ${data.message}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
