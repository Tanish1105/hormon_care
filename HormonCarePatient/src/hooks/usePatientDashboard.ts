import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import * as api from '../api/client';

export function usePatientDashboard() {
  const { signOut } = useAuth();
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<api.DashboardResponse | null>(null);
  const [gate, setGate] = useState<api.GateStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [d, g] = await Promise.all([
        api.getDashboard(),
        api.getGateStatus(),
      ]);
      setDashboard(d);
      setGate(g);
    } catch (e: any) {
      setError(e?.message || t('dataLoadFailed'));
      if (e?.status === 401) signOut();
    }
  }, [signOut, t]);

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

  const plan = dashboard?.profile?.plan ?? null;
  const unlockedWeek =
    dashboard?.unlockedWeek ?? dashboard?.profile?.currentWeek ?? 0;
  const currentWeek =
    plan?.weeks?.find(w => w.weekNumber === unlockedWeek) ?? null;
  const historyWeeks =
    plan?.weeks?.filter(w => w.weekNumber < unlockedWeek) ?? [];
  const progressPct = plan
    ? Math.min(
        100,
        Math.round(
          (Math.max(unlockedWeek, 0) / Math.max(plan.totalWeeks, 1)) * 100,
        ),
      )
    : 0;

  return {
    loading,
    refreshing,
    onRefresh,
    dashboard,
    gate,
    error,
    plan,
    unlockedWeek,
    currentWeek,
    historyWeeks,
    progressPct,
    planImage: api.resolveMediaUrl(plan?.imageUrl),
    startDate: dashboard?.profile?.startDate ?? null,
  };
}

export function formatStartDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}
