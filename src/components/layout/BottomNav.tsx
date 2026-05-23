import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, TrendingUp, Camera, Settings } from 'lucide-react';
import { useI18n } from '@/contexts/i18nContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useI18n();

  const leftItems = [
    { path: '/',       labelKey: 'home',     icon: LayoutDashboard },
    { path: '/diary',  labelKey: 'diary',    icon: BookOpen },
  ];
  const rightItems = [
    { path: '/analytics', labelKey: 'stats',    icon: TrendingUp },
    { path: '/settings',  labelKey: 'settings', icon: Settings },
  ];

  const isCameraActive =
    location.pathname === '/add-food' && location.search.includes('tab=camera');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-3">
        <div className="glass-strong rounded-2xl flex justify-around items-center h-16 px-2">
          {leftItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex flex-col items-center justify-center w-14 h-full btn-press relative ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ transition: 'color 0.18s ease' }}>
                <div className={`nav-indicator ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] mt-0.5 font-medium">{t(item.labelKey)}</span>
                {isActive && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary animate-bounce-in" />
                )}
              </Link>
            );
          })}

          {/* Central AI Camera button */}
          <Link to="/add-food?tab=camera"
            className="relative flex flex-col items-center justify-center -mt-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg btn-press ${
              isCameraActive
                ? 'bg-primary/80'
                : 'bg-primary hover:bg-primary/90'
            }`}
            style={{ transition: 'background-color 0.18s ease, transform 0.1s ease' }}>
              <Camera size={24} color="white" strokeWidth={2} />
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isCameraActive ? 'text-primary' : 'text-muted-foreground'}`}>
              AI
            </span>
          </Link>

          {rightItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex flex-col items-center justify-center w-14 h-full btn-press relative ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ transition: 'color 0.18s ease' }}>
                <div className={`nav-indicator ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] mt-0.5 font-medium">{t(item.labelKey)}</span>
                {isActive && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary animate-bounce-in" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
