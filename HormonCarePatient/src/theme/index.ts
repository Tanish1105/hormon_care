/**
 * Design tokens for Hormon Care.
 * Soft rose + warm cream clinical brand (matches patient web).
 */
export const colors = {
  bg: '#faf6f3',
  bgSoft: '#fff1f5',
  bgAlt: '#fff7ed',
  surface: '#ffffff',
  border: '#eadfd6',
  borderLight: '#f0e8e1',

  primary: '#be185d',
  primaryHover: '#9d174d',
  primaryTint: '#fce7f3',
  primarySoft: '#fdf2f8',

  accent: '#fb923c',
  accentSoft: '#fff7ed',
  success: '#059669',
  successSoft: '#ecfdf5',
  warning: '#d97706',
  warningSoft: '#fffbeb',
  danger: '#dc2626',
  dangerSoft: '#fef2f2',

  text: '#1f172a',
  textSoft: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowStrong: 'rgba(190, 24, 93, 0.18)',
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
  xxl: 28,
  pill: 999,
};

export const font = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.6 },
  h2: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.4 },
  h3: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
};

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
};
