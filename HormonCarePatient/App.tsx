/**
 * Hormon Care - Patient Mobile App
 * React Native CLI
 */
import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LocaleProvider } from './src/context/LocaleContext';
import {
  ScreenCaptureBlockOverlay,
  useScreenCaptureLock,
} from './src/hooks/useScreenCaptureLock';
import RootNavigator from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  const captureBlocked = useScreenCaptureLock();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#faf6f3" />
      <View style={{ flex: 1 }}>
        <LocaleProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </LocaleProvider>
        <ScreenCaptureBlockOverlay visible={captureBlocked} />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
