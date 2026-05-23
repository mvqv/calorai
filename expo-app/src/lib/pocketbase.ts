import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase, { AsyncAuthStore } from 'pocketbase';

const pbUrl = process.env.EXPO_PUBLIC_POCKETBASE_URL;

export const hasPocketBaseEnv = Boolean(pbUrl);

// AsyncAuthStore persists the auth token in AsyncStorage between app launches.
// The initial value is loaded lazily — PocketBase will restore the session
// on the first call that checks authStore.isValid.
const store = new AsyncAuthStore({
  save: async (serialized) => {
    await AsyncStorage.setItem('pb_auth', serialized);
  },
  initial: '',
  clear: async () => {
    await AsyncStorage.removeItem('pb_auth');
  },
});

export const pb = new PocketBase(pbUrl ?? 'http://localhost:8090', store);

// Restore persisted auth on startup
AsyncStorage.getItem('pb_auth')
  .then((raw) => {
    if (raw) {
      store.save(raw);
    }
  })
  .catch(() => {});
