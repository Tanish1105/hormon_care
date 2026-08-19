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
import {
  PLAN_CONTENT_SECTIONS,
  firstFilledSection,
  groupContentsBySection,
  isSafeHttpUrl,
  sectionCounts,
  type PlanContentSection,
} from '../lib/plan-sections';

type RParam = RouteProp<RootStackParamList, 'WeekDetail'>;

function ContentCard({
  item,
  cookie,
  youtubeSource = 'plan',
}: {
  item: api.PlanContent;
  cookie: string | null;
  youtubeSource?: 'plan' | 'garbha' | 'child-guidance';
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
    ? api.youtubeEmbedPageUrl(item.id, youtubeSource)
    : null;
  const youtubeThumb = isYoutube
    ? api.youtubeThumbUrl(item.id, youtubeSource)
    : null;
  const linkUrl =
    item.type === 'LINK' && item.url && isSafeHttpUrl(item.url)
      ? item.url
      : null;

  return (
    <Card title={item.title && item.title !== 'Notes' ? item.title : undefined}>
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
          deferLayout
        />
      ) : null}

      {imageFromUrl && imageFromUrl !== imageFromField ? (
        <FullscreenImage
          uri={imageFromUrl}
          style={styles.image}
          resizeMode="cover"
          deferLayout
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

      {linkUrl ? (
        <Pressable
          onPress={() => Linking.openURL(linkUrl)}
          style={styles.linkBtn}>
          <Text style={styles.linkText}>{t('openLink')}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export default function WeekDetailScreen() {
  const route = useRoute<RParam>();
  const nav = useNavigation();
  const { t } = useLocale();
  const program = route.params.program || 'care';
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<api.PlanWeek | null>(null);
  const [isDayWise, setIsDayWise] = useState(false);
  const [unlockedWeek, setUnlockedWeek] = useState(0);
  const [unlockedDay, setUnlockedDay] = useState(7);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedSection, setSelectedSection] =
    useState<PlanContentSection>('RECIPE');
  const [locked, setLocked] = useState(false);
  const [cookie, setCookie] = useState<string | null>(null);
  const [youtubeSource, setYoutubeSource] = useState<
    'plan' | 'garbha' | 'child-guidance'
  >('plan');

  useEffect(() => {
    (async () => {
      try {
        const [d, session] = await Promise.all([
          api.getDashboard(),
          api.loadSession(),
        ]);
        setCookie(session);
        const assigned = api.getProgramFromDashboard(d, program);
        const unlocked = assigned?.unlockedWeek ?? 0;
        const day = assigned?.unlockedDay ?? 7;
        setUnlockedWeek(unlocked);
        setUnlockedDay(day);
        setYoutubeSource(assigned?.youtubeSource ?? 'plan');

        const plan = assigned?.plan;
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
  }, [route.params.weekNumber, program, nav]);

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
  const groupedContents = useMemo(
    () => groupContentsBySection(activeContents),
    [activeContents],
  );
  const contentCounts = useMemo(
    () => sectionCounts(activeContents),
    [activeContents],
  );
  const showSections = program === 'care';
  const visibleSections = showSections
    ? PLAN_CONTENT_SECTIONS.filter(section => contentCounts[section] > 0)
    : [];

  useEffect(() => {
    if (!showSections || activeContents.length === 0) return;
    if (contentCounts[selectedSection] === 0) {
      setSelectedSection(firstFilledSection(activeContents));
    }
  }, [showSections, activeContents, contentCounts, selectedSection]);

  const sectionTitle = (section: PlanContentSection) => {
    if (section === 'RECIPE') return t('sectionRecipes');
    if (section === 'EXERCISE') return t('sectionExercise');
    return t('sectionMeditation');
  };

  const renderContentCards = (items: api.PlanContent[]) =>
    items.map(c => (
      <ContentCard
        key={c.id}
        item={c}
        cookie={cookie}
        youtubeSource={youtubeSource}
      />
    ));

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

  const weekImage = api.resolveMediaUrl(week.imageUrl);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      testID="week-detail-screen">
      <View style={[styles.hero, !weekImage && styles.heroNoImage]}>
        {weekImage ? (
          <FullscreenImage
            uri={weekImage}
            style={styles.weekBanner}
            resizeMode="cover"
            deferLayout
          />
        ) : null}
        <View style={[styles.heroBody, !weekImage && styles.heroBodyCompact]}>
          <Text style={[styles.kicker, !weekImage && styles.kickerPlain]}>
            Week {week.weekNumber}
          </Text>
          <Text style={[styles.title, !weekImage && styles.titlePlain]}>
            {isDayWise
              ? activeDay?.title || t('dayLabel', { day: selectedDay })
              : week.title || `Week ${week.weekNumber}`}
          </Text>
          {(isDayWise ? activeDay?.description : week.description) ? (
            <Text style={[styles.desc, !weekImage && styles.descPlain]}>
              {isDayWise ? activeDay?.description : week.description}
            </Text>
          ) : null}
        </View>
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

      {showSections && visibleSections.length > 0 ? (
        <View style={styles.sectionTabs}>
          {visibleSections.map(section => {
            const active = section === selectedSection;
            return (
              <Pressable
                key={section}
                onPress={() => setSelectedSection(section)}
                style={[styles.sectionTab, active && styles.sectionTabActive]}>
                <Text
                  style={[
                    styles.sectionTabText,
                    active && styles.sectionTabTextActive,
                  ]}>
                  {sectionTitle(section)}
                </Text>
                <View
                  style={[
                    styles.sectionTabCount,
                    active && styles.sectionTabCountActive,
                  ]}>
                  <Text
                    style={[
                      styles.sectionTabCountText,
                      active && styles.sectionTabCountTextActive,
                    ]}>
                    {contentCounts[section]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {activeContents.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textSoft }}>
            {isDayWise ? t('noDayContentYet') : t('noContentYet')}
          </Text>
        </Card>
      ) : showSections ? (
        <View style={styles.sectionBlock}>
          {renderContentCards(groupedContents[selectedSection])}
        </View>
      ) : (
        renderContentCards(activeContents)
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
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroNoImage: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  weekBanner: {
    width: '100%',
    height: 180,
  },
  heroBody: {
    padding: 22,
  },
  heroBodyCompact: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  kicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  kickerPlain: {
    color: colors.textMuted,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  titlePlain: {
    color: colors.text,
  },
  desc: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  descPlain: {
    color: colors.textSoft,
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
  sectionTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sectionTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sectionTabText: {
    fontWeight: '700',
    color: colors.textSoft,
    fontSize: 13,
  },
  sectionTabTextActive: { color: '#fff' },
  sectionTabCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sectionTabCountActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  sectionTabCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  sectionTabCountTextActive: { color: '#fff' },
  sectionBlock: { marginBottom: 18 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionMarkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
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
