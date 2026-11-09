import { Platform } from 'react-native';

export const colors = {
  background: '#0E0F13',
  surface: '#15171D',
  surfaceRaised: '#1A1D24',
  border: '#252832',
  borderStrong: '#3A3F4B',
  text: '#F2F3F5',
  textMuted: '#9AA0AC',
  accent: '#C6F432',
  onAccent: '#0E0F13',
  danger: '#FF8A6E',
  success: '#4ADE9B',
  warning: '#FFC24A',
} as const;

export const spacing = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const fonts = {
  display: Platform.select({ web: '"Space Grotesk", Inter, system-ui, sans-serif', default: undefined }),
  body: Platform.select({ web: 'Inter, system-ui, sans-serif', default: undefined }),
};
