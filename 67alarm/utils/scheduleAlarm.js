// Notifications removed for Expo Go compatibility
// These functions are now no-ops

export async function requestPermissions() {
  return true; // Always return granted
}

export async function scheduleAlarm(date) {
  // No-op: alarm scheduling removed
  console.log('Alarm scheduled for:', date);
}

export async function cancelAlarm() {
  // No-op: alarm cancellation removed
  console.log('Alarm cancelled');
}