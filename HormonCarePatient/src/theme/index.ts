/**
 * Shared design tokens — JEEVANM green / gold premium system.
 */
export const colors = {
  bg: '#F4F8F5',
  bgSoft: '#EAF2EC',
  bgAlt: '#F7F9F6',
  surface: '#FFFFFF',
  border: '#D5E2D8',
  borderLight: '#E6EEE8',

  primary: '#1F6B45',
  primaryHover: '#185738',
  primaryTint: '#E6F2EA',
  primarySoft: '#F1F7F3',

  accent: '#B8892D',
  accentSoft: '#F7F0DE',
  accentWarm: '#C9A227',
  accentWarmSoft: '#FBF6E8',

  success: '#1F6B45',
  successSoft: '#E6F2EA',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',
  warmBorder: '#E8D9A8',
  successBorder: '#B9D6C3',

  text: '#14201A',
  textSoft: '#45554C',
  textMuted: '#6F7F75',
  textInverse: '#FFFFFF',

  shadow: 'rgba(20, 32, 26, 0.06)',
  shadowStrong: 'rgba(31, 107, 69, 0.18)',
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
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.35 },
  h3: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const shadows = {
  soft: {
    shadowColor: '#14201A',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  card: {
    shadowColor: '#14201A',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 14,
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
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.9,
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
