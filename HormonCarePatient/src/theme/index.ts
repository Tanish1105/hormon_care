/**
 * Design tokens for Hormon Care.
 * Palette inspired by the pink/rose gynaecology web brand with warm cream neutrals.
 */
export const colors = {
  bg: '#faf6f3',
  bgSoft: '#fff1f5',
  bgAlt: '#fff7ed',
  surface: '#ffffff',
  border: '#eadfd6',
  borderLight: '#f0e8e1',

  primary: '#be185d', // deep rose
  primaryHover: '#9d174d',
  primaryTint: '#fce7f3',

  accent: '#fb923c', // warm apricot
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',

  text: '#1f172a',
  textSoft: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  shadow: 'rgba(15, 23, 42, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const font = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  micro: { fontSize: 11, fontWeight: '500' as const },
};
