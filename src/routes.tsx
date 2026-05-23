import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DiaryPage from './pages/DiaryPage';
import AddFoodPage from './pages/AddFoodPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Login',      path: '/login',      element: <LoginPage />,     public: true },
  { name: 'Register',   path: '/register',   element: <RegisterPage />,  public: true },
  { name: 'Onboarding', path: '/onboarding', element: <OnboardingPage />, public: false },
  { name: 'Dashboard',  path: '/',           element: <DashboardPage /> },
  { name: 'Diary',      path: '/diary',      element: <DiaryPage /> },
  { name: 'Add Food',   path: '/add-food',   element: <AddFoodPage /> },
  { name: 'Analytics',  path: '/analytics',  element: <AnalyticsPage /> },
  { name: 'Profile',    path: '/profile',    element: <ProfilePage /> },
  { name: 'Settings',   path: '/settings',   element: <SettingsPage /> },
];

