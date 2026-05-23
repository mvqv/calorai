import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'calorie-reminder-ids';

type ReminderType = 'meals' | 'water';
type ReminderMap = Record<ReminderType, string[]>;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function loadIds(): Promise<ReminderMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { meals: [], water: [] };

  try {
    return JSON.parse(raw) as ReminderMap;
  } catch {
    return { meals: [], water: [] };
  }
}

async function saveIds(value: ReminderMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function cancelReminder(type: ReminderType) {
  const ids = await loadIds();
  await Promise.all(ids[type].map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  ids[type] = [];
  await saveIds(ids);
}

export async function scheduleMealReminders() {
  await cancelReminder('meals');
  const ids = await loadIds();

  const mealTimes = [
    { hour: 8, minute: 0 },
    { hour: 12, minute: 0 },
    { hour: 18, minute: 0 },
  ];

  const created: string[] = [];
  for (const time of mealTimes) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍽 Meal reminder',
        body: 'Time to log your meal.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
    created.push(id);
  }

  ids.meals = created;
  await saveIds(ids);
}

export async function scheduleWaterReminders() {
  await cancelReminder('water');
  const ids = await loadIds();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Water reminder',
      body: 'Add one more glass of water.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2 * 60 * 60,
      repeats: true,
    },
  });

  ids.water = [id];
  await saveIds(ids);
}
