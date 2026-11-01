import { Platform } from 'react-native';

// Stijlgids van Waarbenje: donkere ondergrond, één felle accentkleur (lime)
// en een vaste kleur per vriend. Contrast van tekst is minstens 4.5:1.
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

// De lettertypes worden op het web geladen via Google Fonts (zie app/+html.tsx).
// Op iOS en Android vallen we terug op het systeemlettertype.
export const fonts = {
  display: Platform.select({ web: '"Space Grotesk", Inter, system-ui, sans-serif', default: undefined }),
  body: Platform.select({ web: 'Inter, system-ui, sans-serif', default: undefined }),
};
