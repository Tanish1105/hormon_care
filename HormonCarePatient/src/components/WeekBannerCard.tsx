import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as api from '../api/client';
import { useLocale } from '../context/LocaleContext';
import FullscreenImage from './FullscreenImage';
import { colors, radius, shadows } from '../theme';

type Props = {
  week: api.PlanWeek;
  isDayWise?: boolean;
  variant?: 'current' | 'history';
  onPress: () => void;
  testID?: string;
  style?: ViewStyle;
};

export default function WeekBannerCard({
  week,
  isDayWise,
  variant = 'current',
  onPress,
  testID,
  style,
}: Props) {
  const { t } = useLocale();
  const imageUri = api.resolveMediaUrl(week.imageUrl);
  const contentCount = api.countWeekContents(week, isDayWise);
  const isCurrent = variant === 'current';

  const weekFallback = (
    <View style={styles.fallback}>
      <Text style={styles.fallbackText}>
        {t('weekLabelShort', { week: week.weekNumber })}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isCurrent && styles.cardCurrent,
        style,
        pressed && { transform: [{ scale: 0.985 }], opacity: 0.96 },
      ]}
      testID={testID}>
      <View style={styles.bannerWrap}>
        {imageUri ? (
          <FullscreenImage
            uri={imageUri}
            style={styles.banner}
            resizeMode="cover"
            fallback={weekFallback}
          />
        ) : (
          weekFallback
        )}
        <View style={styles.scrim} pointerEvents="none" />
        <View style={styles.bannerTag} pointerEvents="none">
          <Text style={styles.bannerTagText}>
            {isCurrent ? t('thisWeek') : t('weekLabelShort', { week: week.weekNumber })}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={{ flex: 1 }}>
          {isCurrent ? (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>{t('current')}</Text>
            </View>
          ) : null}
          <Text style={styles.title} numberOfLines={2}>
            {week.title || t('weekLabelShort', { week: week.weekNumber })}
          </Text>
          <Text style={styles.meta}>
            {contentCount === 1
              ? t('contentOne')
              : t('contentMany', { count: contentCount })}
            {isCurrent ? '' : ` • ${t('completed')}`}
          </Text>
        </View>
        <View style={styles.openChip}>
          <Text style={styles.openChipText}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginTop: 16,
    ...shadows.soft,
  },
  cardCurrent: {
    borderColor: 'rgba(31,107,69,0.28)',
    ...shadows.glow,
  },
  bannerWrap: {
    height: 176,
    position: 'relative',
    backgroundColor: colors.primaryTint,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  fallbackText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,32,26,0.18)',
  },
  bannerTag: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20,32,26,0.45)',
  },
  bannerTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  liveBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSoft,
  },
  openChip: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openChipText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '500',
    marginTop: -2,
  },
});
