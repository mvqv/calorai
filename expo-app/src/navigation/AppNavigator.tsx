import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth, toUserProfile } from '@/contexts/AuthContext';
import BottomTabs from './BottomTabs';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import AddFoodScreen from '@/screens/AddFoodScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import { useAppStore } from '@/stores/appStore';
import { COLORS, FONTS } from '@/constants/theme';

const Stack = createNativeStackNavigator();

function RootStack() {
  const { loading, user, profile } = useAuth();
  const setProfile = useAppStore((s) => s.setProfile);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  React.useEffect(() => {
    const mappedProfile = toUserProfile(profile);
    if (mappedProfile) {
      setProfile(mappedProfile);
    }
    setOnboardingComplete(Boolean(profile?.onboarding_complete));
  }, [profile, setOnboardingComplete, setProfile]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.background,
          gap: 12,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted, fontSize: 14, fontWeight: FONTS.medium }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !profile?.onboarding_complete ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_right' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
