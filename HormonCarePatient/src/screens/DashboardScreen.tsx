import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import type { RootStackParamList } from '../navigation/RootNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const nav = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<api.DashboardResponse | null>(null);
  const [gate, setGate] = useState<api.GateStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [d, g] = await Promise.all([api.getDashboard(), api.getGateStatus()]);
      setDashboard(d);
      setGate(g);
    } catch (e: any) {
      setError(e?.message || 'Data load failed');
      if (e?.status === 401) signOut();
    }
  }, [signOut]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function confirmLogout() {
    Alert.alert('Logout', 'શું તમે લોગઆઉટ કરવા માંગો છો?', [
      { text: 'ના', style: 'cancel' },
      { text: 'હા', style: 'destructive', onPress: signOut },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const plan = dashboard?.profile?.plan;
  const currentWeek = dashboard?.profile?.currentWeek ?? 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="dashboard-screen">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'P').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.hello}>નમસ્તે,</Text>
            <Text style={styles.name} testID="dashboard-patient-name">
              {user?.name}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={confirmLogout}
          style={styles.logoutBtn}
          testID="dashboard-logout-button">
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }>
        {error ? (
          <Card style={{ borderColor: colors.danger }}>
            <Text style={{ color: colors.danger }}>{error}</Text>
          </Card>
        ) : null}

        {/* Gate / lifestyle prompt */}
        {gate?.blocked && gate.blockType === 'lifestyle' ? (
          <Card accent="warm" title="જીવનશૈલી મૂલ્યાંકન બાકી છે">
            <Text style={{ color: colors.textSoft, marginBottom: 12 }}>
              {gate.blockMessage}
            </Text>
            <Button
              title="ફોર્મ ભરો"
              onPress={() => nav.navigate('LifestyleAssessment')}
              testID="lifestyle-cta-button"
            />
          </Card>
        ) : null}

        {gate?.followup?.showPrompt && !gate.blocked ? (
          <Card accent="warm" title="સાપ્તાહિક ફોલોઅપ">
            <Text style={{ color: colors.textSoft, marginBottom: 12 }}>
              Week {gate.followup.nextDueWeek} નું ફોલોઅપ ફોર્મ ભરવાનું બાકી છે.
            </Text>
            <Button
              title="Followup ભરો"
              onPress={() =>
                nav.navigate('Followup', {
                  week: gate.followup.nextDueWeek || 1,
                })
              }
              testID="followup-cta-button"
            />
          </Card>
        ) : null}

        {/* Plan hero */}
        {plan ? (
          <View style={styles.planHero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planKicker}>તમારો હાલનો પ્લાન</Text>
              <Text style={styles.planTitle}>{plan.title}</Text>
              {plan.description ? (
                <Text style={styles.planDesc}>{plan.description}</Text>
              ) : null}
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    Week {currentWeek} / {plan.totalWeeks}
                  </Text>
                </View>
                {plan.isDayWise ? (
                  <View style={[styles.pill, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.pillText, { color: '#92400e' }]}>
                      Day-wise
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            {plan.imageUrl ? (
              <Image
                source={{ uri: plan.imageUrl }}
                style={styles.planImg}
                resizeMode="cover"
              />
            ) : null}
          </View>
        ) : (
          <Card title="કોઈ પ્લાન એસાઈન કરેલ નથી">
            <Text style={{ color: colors.textSoft }}>
              તમારા ડૉક્ટર દ્વારા પ્લાન એસાઈન થયા બાદ અહીં દેખાશે.
            </Text>
          </Card>
        )}

        {/* Weeks list */}
        {plan?.weeks?.length ? (
          <>
            <Text style={styles.sectionTitle}>સપ્તાહો</Text>
            {plan.weeks.map(w => {
              const isCurrent = w.weekNumber === currentWeek;
              const isPast = w.weekNumber < currentWeek;
              const contentCount = w.contents?.length || 0;
              return (
                <Pressable
                  key={w.id}
                  onPress={() =>
                    nav.navigate('WeekDetail', { weekNumber: w.weekNumber })
                  }
                  style={({ pressed }) => [
                    styles.weekCard,
                    isCurrent && styles.weekCardCurrent,
                    pressed && { transform: [{ scale: 0.99 }] },
                  ]}
                  testID={`week-card-${w.weekNumber}`}>
                  <View
                    style={[
                      styles.weekNum,
                      isCurrent && { backgroundColor: colors.primary },
                      isPast && { backgroundColor: '#d1fae5' },
                    ]}>
                    <Text
                      style={[
                        styles.weekNumText,
                        isCurrent && { color: '#fff' },
                        isPast && { color: colors.success },
                      ]}>
                      {w.weekNumber}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.weekTitle}>
                      {w.title || `Week ${w.weekNumber}`}
                    </Text>
                    <Text style={styles.weekMeta}>
                      {contentCount} content{contentCount === 1 ? '' : 's'}
                      {isCurrent ? ' • ચાલુ' : isPast ? ' • પૂર્ણ' : ''}
                    </Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </Pressable>
              );
            })}
          </>
        ) : null}

        {/* Weekly followup entry */}
        {plan ? (
          <Card title="ફોલોઅપ ફોર્મ">
            <Text style={{ color: colors.textSoft, marginBottom: 12 }}>
              અઠવાડિયાના અંતે તમારો પ્રગતિ update કરો.
            </Text>
            <Button
              title="Followup ભરો"
              variant="secondary"
              onPress={() =>
                nav.navigate('Followup', { week: currentWeek })
              }
              testID="dashboard-followup-button"
            />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.bg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  hello: { color: colors.textSoft, fontSize: 12 },
  name: { color: colors.text, fontWeight: '700', fontSize: 17 },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logoutText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  planHero: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    gap: 12,
    overflow: 'hidden',
  },
  planKicker: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  planTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  planDesc: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontSize: 13,
  },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  planImg: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginTop: 6,
  },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  weekCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  weekNum: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumText: { fontSize: 16, fontWeight: '800', color: colors.primary },
  weekTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  weekMeta: { fontSize: 12, color: colors.textSoft, marginTop: 2 },
  chev: { fontSize: 26, color: colors.textMuted, marginLeft: 6 },
});
