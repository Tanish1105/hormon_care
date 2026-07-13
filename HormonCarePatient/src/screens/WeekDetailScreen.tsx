import React, { useEffect, useState } from 'react';
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
import Card from '../components/Card';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type RParam = RouteProp<RootStackParamList, 'WeekDetail'>;

/**
 * Extracts the YouTube video ID from any YouTube URL variant.
 */
function ytId(url?: string | null): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{6,})/,
    /(?:youtu\.be\/)([\w-]{6,})/,
    /(?:youtube\.com\/embed\/)([\w-]{6,})/,
    /(?:youtube\.com\/shorts\/)([\w-]{6,})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function WeekDetailScreen() {
  const route = useRoute<RParam>();
  const nav = useNavigation();
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<api.PlanWeek | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await api.getDashboard();
        const w = d.profile.plan?.weeks.find(
          x => x.weekNumber === route.params.weekNumber,
        );
        setWeek(w || null);
        nav.setOptions?.({
          title: w?.title || `Week ${route.params.weekNumber}`,
        } as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.weekNumber, nav]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!week) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSoft }}>Week found nathi</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} testID="week-detail-screen">
      <View style={styles.hero}>
        <Text style={styles.kicker}>Week {week.weekNumber}</Text>
        <Text style={styles.title}>{week.title || `Week ${week.weekNumber}`}</Text>
        {week.description ? (
          <Text style={styles.desc}>{week.description}</Text>
        ) : null}
      </View>

      {(!week.contents || week.contents.length === 0) && (
        <Card>
          <Text style={{ color: colors.textSoft }}>
            આ સપ્તાહ માટે હજી કંઈ content ઉમેરાયું નથી.
          </Text>
        </Card>
      )}

      {week.contents?.map(c => {
        const vid = ytId(c.url || c.videoUrl);
        return (
          <Card key={c.id} title={c.title || undefined}>
            {c.description ? (
              <Text style={styles.contentDesc}>{c.description}</Text>
            ) : null}

            {c.type === 'YOUTUBE' && vid ? (
              <View style={styles.videoWrap}>
                <WebView
                  source={{ uri: `https://www.youtube.com/embed/${vid}?playsinline=1` }}
                  allowsFullscreenVideo
                  javaScriptEnabled
                  style={{ flex: 1 }}
                />
              </View>
            ) : c.type === 'YOUTUBE' && (c.url || c.videoUrl) ? (
              <Pressable
                onPress={() => Linking.openURL(c.url || c.videoUrl!)}
                style={styles.linkBtn}>
                <Text style={styles.linkText}>▶ YouTube પર જુઓ</Text>
              </Pressable>
            ) : null}

            {c.type === 'IMAGE' && c.imageUrl ? (
              <Image
                source={{ uri: c.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : null}

            {c.type === 'VIDEO' && c.videoUrl ? (
              <Pressable
                onPress={() => Linking.openURL(c.videoUrl!)}
                style={styles.linkBtn}>
                <Text style={styles.linkText}>▶ Video ખોલો</Text>
              </Pressable>
            ) : null}

            {c.type === 'TEXT' && c.content ? (
              <Text style={styles.textContent}>{c.content}</Text>
            ) : null}
          </Card>
        );
      })}
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  kicker: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  desc: { color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  contentDesc: { color: colors.textSoft, marginBottom: 12, lineHeight: 20 },
  videoWrap: {
    height: 210,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: '#eee',
  },
  linkBtn: {
    backgroundColor: colors.primaryTint,
    padding: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  linkText: { color: colors.primary, fontWeight: '700' },
  textContent: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
