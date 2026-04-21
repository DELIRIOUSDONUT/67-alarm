import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarm(date) {
  await cancelAlarm();
  const granted = await requestPermissions();
  if (!granted) {
    console.warn('Notification permission not granted');
    return;
  }

  const now = new Date();
  const trigger = new Date(date);

  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '67 Alarm',
      body: 'Time to wake up! Do your 67s!',
      sound: true,
      data: { type: 'alarm' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });

  console.log('Alarm scheduled for:', trigger.toLocaleString());
}

export async function cancelAlarm() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
