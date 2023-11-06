import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

class NotificationService {
  configure = async (handleNotification) => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status !== 'granted') {
        alert('You have not enabled notifications');
        return;
      }
    }

    Notifications.setNotificationHandler({
      handleNotification,
    });

    Notifications.addNotificationReceivedListener(notification => {

      console.log('Notification received in foreground:', notification);
    });
  };

  sendNotification = async (title, message) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
      },
      trigger: null,
    });
  };
}

export default new NotificationService();
