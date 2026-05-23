import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '@/screens/DashboardScreen';
import DiaryScreen from '@/screens/DiaryScreen';
import AnalyticsScreen from '@/screens/AnalyticsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useI18n } from '@/contexts/i18nContext';
import { COLORS } from '@/constants/theme';
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.04)',
          elevation: 0,
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#8e8e93',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: t('home'), tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} /> }}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
        options={{ tabBarLabel: t('diary'), tabBarIcon: ({ color, size }) => <BookOpen size={size - 2} color={color} /> }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: t('stats'), tabBarIcon: ({ color, size }) => <BarChart3 size={size - 2} color={color} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('settings'), tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
