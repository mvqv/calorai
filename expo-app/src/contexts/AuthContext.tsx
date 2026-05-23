import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { createUserProfile } from '@/lib/calorieCalculator';
import { hasSupabaseEnv, supabase } from '@/lib/supabase';
import type { ActivityLevel, Gender, Goal, UserProfile } from '@/types';

export interface Profile {
  id: string;
  email: string | null;
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
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('getProfile error:', error);
    return null;
  }

  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(hasSupabaseEnv);

  const refreshProfile = async () => {
    if (!hasSupabaseEnv || !user) {
      setProfile(null);
      return;
    }

    const nextProfile = await getProfile(user.id);
    setProfile(nextProfile);
  };

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const nextProfile = await getProfile(session.user.id);
          setProfile(nextProfile);
        }
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const nextProfile = await getProfile(session.user.id);
        setProfile(nextProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      loading,
      authEnabled: hasSupabaseEnv,
      signIn: async (email: string, password: string) => {
        if (!hasSupabaseEnv) {
          return { error: 'EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY not configured' };
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUp: async (email: string, password: string, displayName: string) => {
        if (!hasSupabaseEnv) {
          return { error: 'EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY not configured' };
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        if (hasSupabaseEnv) {
          await supabase.auth.signOut();
        }
        setUser(null);
        setProfile(null);
      },
      refreshProfile,
    }),
    [loading, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
