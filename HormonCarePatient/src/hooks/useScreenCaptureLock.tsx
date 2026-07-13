/**
 * Enables screenshot / screen-recording / app-switcher blocking app-wide.
 * Requires a native rebuild after install.
 */
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import {
  CaptureEventType,
  CaptureProtection,
} from 'react-native-capture-protection';

async function lockCapture() {
  try {
    await CaptureProtection.prevent({
      screenshot: true,
      record: true,
      appSwitcher: true,
    });
  } catch {
    /* native module may be unavailable until rebuild */
  }
}

/**
 * Blocks screenshots, screen recording, and recent-apps preview.
 * If screen recording starts, covers the UI with a black overlay.
 */
export function useScreenCaptureLock() {
  const [blockedByRecording, setBlockedByRecording] = useState(false);

  useEffect(() => {
    lockCapture();

    const appSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        lockCapture();
      }
    });

    const subscription = CaptureProtection.addListener(event => {
      if (event === CaptureEventType.RECORDING) {
        setBlockedByRecording(true);
        lockCapture();
      }
      if (event === CaptureEventType.CAPTURED) {
        // Re-assert lock; Android already blanks the shot via FLAG_SECURE.
        lockCapture();
      }
      if (event === CaptureEventType.END_RECORDING) {
        setBlockedByRecording(false);
      }
    });

    const poll = setInterval(async () => {
      try {
        const recording = await CaptureProtection.isScreenRecording();
        setBlockedByRecording(Boolean(recording));
        if (recording) lockCapture();
      } catch {
        /* ignore */
      }
    }, 1500);

    return () => {
      appSub.remove();
      subscription?.remove();
      clearInterval(poll);
    };
  }, []);

  return blockedByRecording;
}

export function ScreenCaptureBlockOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Text style={styles.title}>Screen capture blocked</Text>
      <Text style={styles.body}>
        Screenshots and screen recording are not allowed in this app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
