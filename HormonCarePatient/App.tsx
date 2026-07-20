/**
 * Hormon Care - Patient Mobile App
 * React Native CLI
 */
import React from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LocaleProvider } from './src/context/LocaleContext';
import {
  ScreenCaptureBlockOverlay,
  useScreenCaptureLock,
} from './src/hooks/useScreenCaptureLock';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

function App(): React.JSX.Element {
  const captureBlocked = useScreenCaptureLock();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <View style={{ flex: 1 }}>
          <LocaleProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </LocaleProvider>
          <ScreenCaptureBlockOverlay visible={captureBlocked} />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
