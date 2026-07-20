/**
 * Shared design tokens — keep every screen on the same white / soft-brand system.
 * Palette aligned with Hormon Care logo (lavender, sage, soft rose) on white.
 */
export const colors = {
  bg: '#FFFFFF',
  bgSoft: '#F7F3FA',
  bgAlt: '#F4F7F5',
  surface: '#FFFFFF',
  border: '#E8E4EE',
  borderLight: '#F0ECF4',

  primary: '#7A4E8C',
  primaryHover: '#5F3A6E',
  primaryTint: '#EFE6F4',
  primarySoft: '#F8F4FA',

  accent: '#6F9A74',
  accentSoft: '#EFF6F0',
  accentWarm: '#D98EB3',
  accentWarmSoft: '#F9EFF4',

  success: '#6F9A74',
  successSoft: '#EFF6F0',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',
  warmBorder: '#E8D7EF',
  successBorder: '#C6E0C9',

  text: '#1E1A24',
  textSoft: '#5B5566',
  textMuted: '#9A93A6',
  textInverse: '#FFFFFF',

  shadow: 'rgba(30, 26, 36, 0.06)',
  shadowStrong: 'rgba(122, 78, 140, 0.16)',
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
    shadowColor: '#1E1A24',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  card: {
    shadowColor: '#1E1A24',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
};

/** Shared screen chrome — use these so every page feels the same */
export const layout = {
  screen: {
    flex: 1 as const,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  surfaceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
};
