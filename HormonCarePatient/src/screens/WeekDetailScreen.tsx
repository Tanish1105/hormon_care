import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as api from '../api/client';
import { useLocale } from '../context/LocaleContext';
import Card from '../components/Card';
import FullscreenImage from '../components/FullscreenImage';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type RParam = RouteProp<RootStackParamList, 'WeekDetail'>;

function ContentCard({
  item,
  cookie,
}: {
  item: api.PlanContent;
  cookie: string | null;
}) {
  const { t } = useLocale();
  const [playYoutube, setPlayYoutube] = useState(false);

  const imageFromField = api.resolveMediaUrl(item.imageUrl);
  const imageFromUrl =
    item.type === 'IMAGE' ? api.resolveMediaUrl(item.url) : null;
  const videoFromField = api.resolveMediaUrl(item.videoUrl);
  const videoFromUrl =
    item.type === 'VIDEO' ? api.resolveMediaUrl(item.url) : null;
  const videoUri = videoFromField || videoFromUrl;

  const isYoutube = item.type === 'YOUTUBE';
  const youtubePage = isYoutube
    ? api.youtubeEmbedPageUrl(item.id, 'plan')
    : null;
  const youtubeThumb = isYoutube
    ? api.youtubeThumbUrl(item.id, 'plan')
    : null;

  return (
    <Card title={item.title || undefined}>
      {item.description ? (
        <Text style={styles.contentDesc}>{item.description}</Text>
      ) : null}

      {item.content ? (
        <Text style={styles.textContent}>{item.content}</Text>
      ) : null}

      {imageFromField ? (
        <FullscreenImage
          uri={imageFromField}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {imageFromUrl && imageFromUrl !== imageFromField ? (
        <FullscreenImage
          uri={imageFromUrl}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {isYoutube && youtubePage ? (
        playYoutube ? (
          <View style={styles.videoWrap}>
            <WebView
              source={{
                uri: youtubePage,
                headers: cookie ? { Cookie: cookie } : undefined,
              }}
              allowsFullscreenVideo
              javaScriptEnabled
              mediaPlaybackRequiresUserAction={false}
              style={{ flex: 1, backgroundColor: '#000' }}
            />
          </View>
        ) : (
          <Pressable
            onPress={() => setPlayYoutube(true)}
            style={styles.ytThumbWrap}>
            {youtubeThumb && cookie ? (
              <Image
                source={{
                  uri: youtubeThumb,
                  headers: { Cookie: cookie },
                }}
                style={styles.ytThumb}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.ytThumb, styles.ytThumbFallback]} />
            )}
            <View style={styles.playOverlay}>
              <View style={styles.playBtn}>
                <Text style={styles.playBtnText}>▶</Text>
              </View>
              <Text style={styles.playLabel}>{t('watchVideo')}</Text>
            </View>
          </Pressable>
        )
      ) : null}

      {videoUri ? (
        <Pressable
          onPress={() => Linking.openURL(videoUri)}
          style={styles.linkBtn}>
          <Text style={styles.linkText}>{t('openVideo')}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export default function WeekDetailScreen() {
  const route = useRoute<RParam>();
  const nav = useNavigation();
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<api.PlanWeek | null>(null);
  const [isDayWise, setIsDayWise] = useState(false);
  const [unlockedWeek, setUnlockedWeek] = useState(0);
  const [unlockedDay, setUnlockedDay] = useState(7);
  const [selectedDay, setSelectedDay] = useState(1);
  const [locked, setLocked] = useState(false);
  const [cookie, setCookie] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [d, session] = await Promise.all([
          api.getDashboard(),
          api.loadSession(),
        ]);
        setCookie(session);
        const unlocked = d.unlockedWeek ?? d.profile.currentWeek ?? 0;
        const day = d.unlockedDay ?? 7;
        setUnlockedWeek(unlocked);
        setUnlockedDay(day);

        const plan = d.profile.plan;
        const w = plan?.weeks.find(
          x => x.weekNumber === route.params.weekNumber,
        );
        const dayWise = Boolean(plan?.isDayWise);
        setIsDayWise(dayWise);

        if (w && w.weekNumber > unlocked) {
          setLocked(true);
          setWeek(null);
        } else {
          setLocked(false);
          setWeek(w || null);
          const maxDay =
            w && w.weekNumber < unlocked
              ? 7
              : Math.min(7, Math.max(1, day));
          setSelectedDay(maxDay);
        }
        nav.setOptions?.({
          title: w?.title || `Week ${route.params.weekNumber}`,
        } as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.weekNumber, nav]);

  const maxSelectableDay = useMemo(() => {
    if (!week) return 1;
    if (week.weekNumber < unlockedWeek) return 7;
    return Math.min(7, Math.max(1, unlockedDay));
  }, [week, unlockedWeek, unlockedDay]);

  const activeContents = useMemo(() => {
    if (!week) return [];
    if (isDayWise) {
      const day = week.days?.find(d => d.dayNumber === selectedDay);
      return day?.contents ?? [];
    }
    return week.contents ?? [];
  }, [week, isDayWise, selectedDay]);

  const activeDay = week?.days?.find(d => d.dayNumber === selectedDay);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (locked) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSoft }}>{t('weekLocked')}</Text>
      </View>
    );
  }
  if (!week) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSoft }}>{t('weekNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      testID="week-detail-screen">
      <View style={styles.hero}>
        <Text style={styles.kicker}>Week {week.weekNumber}</Text>
        <Text style={styles.title}>
          {isDayWise
            ? activeDay?.title || t('dayLabel', { day: selectedDay })
            : week.title || `Week ${week.weekNumber}`}
        </Text>
        {(isDayWise ? activeDay?.description : week.description) ? (
          <Text style={styles.desc}>
            {isDayWise ? activeDay?.description : week.description}
          </Text>
        ) : null}
      </View>

      {isDayWise && week.days?.length ? (
        <View style={styles.dayPicker}>
          <Text style={styles.dayPickerLabel}>{t('selectDay')}</Text>
          <View style={styles.dayRow}>
            {week.days
              .filter(d => d.dayNumber <= maxSelectableDay)
              .map(d => {
                const active = d.dayNumber === selectedDay;
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => setSelectedDay(d.dayNumber)}
                    style={[styles.dayChip, active && styles.dayChipActive]}>
                    <Text
                      style={[
                        styles.dayChipText,
                        active && styles.dayChipTextActive,
                      ]}>
                      {d.dayNumber}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </View>
      ) : null}

      {activeContents.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSoft }}>
            {isDayWise ? t('noDayContentYet') : t('noContentYet')}
          </Text>
        </Card>
      ) : (
        activeContents.map(c => (
          <ContentCard key={c.id} item={c} cookie={cookie} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xxl,
    padding: 22,
    marginBottom: 16,
    overflow: 'hidden',
  },
  kicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  desc: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  dayPicker: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginBottom: 14,
  },
  dayPickerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  dayChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dayChipText: { fontWeight: '700', color: colors.textSoft },
  dayChipTextActive: { color: '#fff' },
  contentDesc: { color: colors.textSoft, marginBottom: 12, lineHeight: 20 },
  videoWrap: {
    height: 210,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginTop: 8,
  },
  ytThumbWrap: {
    marginTop: 8,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  ytThumb: { width: '100%', height: 210 },
  ytThumbFallback: { backgroundColor: '#7f1d1d' },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    gap: 8,
  },
  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: { color: '#fff', fontSize: 22, marginLeft: 3 },
  playLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
  image: {
    width: '100%',
    height: 210,
    borderRadius: radius.lg,
    backgroundColor: '#eee',
    marginTop: 8,
  },
  linkBtn: {
    backgroundColor: colors.primaryTint,
    padding: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: { color: colors.primary, fontWeight: '700' },
  textContent: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: colors.bg,
    padding: 14,
    borderRadius: radius.lg,
    marginBottom: 4,
  },
});
