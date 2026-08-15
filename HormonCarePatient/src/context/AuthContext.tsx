import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as api from '../api/client';

type AuthState = {
  user: api.PatientUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<api.PatientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Never leave the splash spinner forever (AsyncStorage / network hangs).
    const failSafe = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    (async () => {
      try {
        const session = await api.loadSession();
        const stored = await api.loadUser<api.PatientUser>();

        if (session && stored) {
          // Show home immediately; verify in background so splash never hangs.
          if (!cancelled) {
            setUser(stored);
            setLoading(false);
          }
          try {
            await api.getDashboard();
          } catch {
            /* Keep the saved session; home can retry. */
          }
          return;
        }
      } catch {
        /* fall through to login */
      }
      if (!cancelled) {
        setUser(null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(failSafe);
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const u = await api.login(username, password);
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
