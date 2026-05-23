import AsyncStorage from '@react-native-async-storage/async-storage';
// Use CJS build explicitly — Metro bundler has issues with the default .mjs entry
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PocketBase = require('pocketbase/cjs');

const pbUrl = process.env.EXPO_PUBLIC_POCKETBASE_URL ?? 'http://192.168.1.103:8090';

console.log('[PocketBase] URL:', pbUrl);

export const hasPocketBaseEnv = true; // URL is always set (hardcoded fallback)

export const pb: InstanceType<typeof PocketBase> = new PocketBase(pbUrl);

// Persist auth token in AsyncStorage so the session survives app restarts
pb.authStore.onChange(async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem('pb_auth_token', token);
      await AsyncStorage.setItem('pb_auth_model', JSON.stringify(pb.authStore.model));
    } else {
      await AsyncStorage.removeItem('pb_auth_token');
      await AsyncStorage.removeItem('pb_auth_model');
    }
  } catch (e) {
    console.warn('[PocketBase] Failed to persist auth:', e);
  }
});

// Restore session on startup
AsyncStorage.multiGet(['pb_auth_token', 'pb_auth_model'])
  .then(([[, token], [, modelRaw]]) => {
    if (token && modelRaw) {
      try {
        const model = JSON.parse(modelRaw);
        pb.authStore.save(token, model);
        console.log('[PocketBase] Session restored for:', model?.email);
      } catch {
        // ignore parse errors
      }
    }
  })
  .catch(() => {});
