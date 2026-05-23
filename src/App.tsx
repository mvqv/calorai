import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/i18nContext';
import { routes } from './routes';

const AUTH_PATHS = ['/login', '/register', '/onboarding'];

/** Redirect logic based on auth state */
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-bg flex items-center justify-center min-h-screen">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → only allow auth + onboarding
  if (!user) {
    if (!AUTH_PATHS.includes(location.pathname)) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  // Logged in but onboarding not complete → force onboarding (profile setup)
  if (user && profile && !profile.onboarding_complete) {
    if (location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  }

  // Logged in + complete → redirect away from auth pages
  if (AUTH_PATHS.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HIDE_NAV = ['/login', '/register', '/onboarding'];

const AppLayout: React.FC = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  const showNav =
    !!user &&
    !!profile?.onboarding_complete &&
    !HIDE_NAV.includes(location.pathname);

  return (
    <div className="flex justify-center app-bg min-h-screen">
      <div className="w-full max-w-md relative min-h-screen">
        <main className={showNav ? 'pb-20' : ''}>
          <Routes>
            {routes.map((route, i) => (
              <Route key={i} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <I18nProvider>
      <AuthProvider>
        <RouteGuard>
          <AppLayout />
        </RouteGuard>
        <Toaster position="top-center" />
      </AuthProvider>
    </I18nProvider>
  </Router>
);

export default App;
