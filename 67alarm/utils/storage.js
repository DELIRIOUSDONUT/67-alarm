import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ALARM_TIME: 'nextAlarm',
  SIXTY_SEVEN_COUNT: 'sixtySevenCount',
};

export async function getAlarmTime() {
  const stored = await AsyncStorage.getItem(KEYS.ALARM_TIME);
  return stored ? new Date(stored) : null;
}

export async function saveAlarmTime(date) {
  await AsyncStorage.setItem(KEYS.ALARM_TIME, date.toISOString());
}

export async function getSixtySevenCount() {
  const stored = await AsyncStorage.getItem(KEYS.SIXTY_SEVEN_COUNT);
  return stored ? parseInt(stored, 10) : 10;
}

export async function saveSixtySevenCount(count) {
  await AsyncStorage.setItem(KEYS.SIXTY_SEVEN_COUNT, String(count));
}

export async function clearAlarm() {
  await AsyncStorage.removeItem(KEYS.ALARM_TIME);
}
