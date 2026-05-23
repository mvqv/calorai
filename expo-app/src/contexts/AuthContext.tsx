import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hasPocketBaseEnv, pb } from '@/lib/pocketbase';
import { createUserProfile } from '@/lib/calorieCalculator';
import type { ActivityLevel, Gender, Goal, UserProfile } from '@/types';

// Shape of the user profile stored in PocketBase's `users` collection.
// All profile fields live directly on the user record (no separate profiles table).
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: 'user' | 'admin';
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: Gender | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
  daily_calorie_target: number | null;
  protein_target: number | null;
  fat_target: number | null;
  carbs_target: number | null;
  onboarding_complete: boolean;
  created: string;
}

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  authEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function recordToProfile(record: Record<string, unknown>): Profile {
  return {
    id: record.id as string,
    email: (record.email as string) ?? '',
    display_name: (record.display_name as string | null) ?? null,
    role: (record.role as 'user' | 'admin') ?? 'user',
    age: (record.age as number | null) ?? null,
    weight: (record.weight as number | null) ?? null,
    height: (record.height as number | null) ?? null,
    gender: (record.gender as Gender | null) ?? null,
    activity_level: (record.activity_level as ActivityLevel | null) ?? null,
    goal: (record.goal as Goal | null) ?? null,
    daily_calorie_target: (record.daily_calorie_target as number | null) ?? null,
    protein_target: (record.protein_target as number | null) ?? null,
    fat_target: (record.fat_target as number | null) ?? null,
    carbs_target: (record.carbs_target as number | null) ?? null,
    onboarding_complete: Boolean(record.onboarding_complete),
    created: (record.created as string) ?? '',
  };
}

export function toUserProfile(profile: Profile | null): UserProfile | null {
  if (
    !profile ||
    profile.age == null ||
    profile.weight == null ||
    profile.height == null ||
    !profile.gender ||
    !profile.activity_level ||
    !profile.goal
  ) {
    return null;
  }

  const generated = createUserProfile({
    id: profile.id,
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    gender: profile.gender,
    activityLevel: profile.activity_level,
    goal: profile.goal,
  });

  return {
    ...generated,
    dailyCalorieTarget: profile.daily_calorie_target ?? generated.dailyCalorieTarget,
    proteinTarget: profile.protein_target ?? generated.proteinTarget,
    fatTarget: profile.fat_target ?? generated.fatTarget,
    carbsTarget: profile.carbs_target ?? generated.carbsTarget,
  };
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const record = await pb.collection('users').getOne(userId);
    return recordToProfile(record as unknown as Record<string, unknown>);
  } catch (err) {
    console.error('fetchProfile error:', err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(hasPocketBaseEnv);

  const refreshProfile = async () => {
    if (!hasPocketBaseEnv || !pb.authStore.isValid) {
      setProfile(null);
      return;
    }
    const model = pb.authStore.model;
    if (!model) return;
    const next = await fetchProfile(model.id);
    setProfile(next);
  };

  useEffect(() => {
    if (!hasPocketBaseEnv) {
      setLoading(false);
      return;
    }

    // Restore session from AsyncStorage and load profile
    const init = async () => {
      try {
        if (pb.authStore.isValid && pb.authStore.model) {
          // Refresh the token to make sure it's still valid
          await pb.collection('users').authRefresh();
          const next = await fetchProfile(pb.authStore.model.id);
          setProfile(next);
        }
      } catch {
        pb.authStore.clear();
      } finally {
        setLoading(false);
      }
    };

    init();

    // Subscribe to auth state changes
    const unsubscribe = pb.authStore.onChange(async (_token, model) => {
      if (model) {
        const next = await fetchProfile(model.id);
        setProfile(next);
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: profile,
      profile,
      loading,
      authEnabled: hasPocketBaseEnv,
      signIn: async (email: string, password: string) => {
        if (!hasPocketBaseEnv) {
          return { error: 'EXPO_PUBLIC_POCKETBASE_URL не настроен.' };
        }
        try {
          await pb.collection('users').authWithPassword(email, password);
          return { error: null };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          return { error: msg };
        }
      },
      signUp: async (email: string, password: string, displayName: string) => {
        if (!hasPocketBaseEnv) {
          return { error: 'EXPO_PUBLIC_POCKETBASE_URL не настроен.' };
        }
        try {
          await pb.collection('users').create({
            email,
            password,
            passwordConfirm: password,
            display_name: displayName || null,
          });
          // Auto sign-in after registration
          await pb.collection('users').authWithPassword(email, password);
          return { error: null };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registration failed';
          return { error: msg };
        }
      },
      signOut: async () => {
        pb.authStore.clear();
        setProfile(null);
      },
      refreshProfile,
    }),
    [loading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
