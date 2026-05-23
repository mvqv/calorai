export const COLORS = {
  primary: '#ff6b35',
  primaryLight: '#ff9a5c',
  primaryDark: '#e55a2b',
  background: '#f5f5f7',
  card: 'rgba(255,255,255,0.92)',
  cardBorder: 'rgba(255,255,255,0.6)',
  text: '#1c1c1e',
  textMuted: '#8e8e93',
  textInverse: '#ffffff',
  success: '#34c759',
  danger: '#ff3b30',
  warning: '#ff9500',
  info: '#007aff',
  blue: '#007aff',
  yellow: '#ffcc00',
  orange: '#ff9500',
  divider: 'rgba(0,0,0,0.06)',
};

export const SHADOW = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;
