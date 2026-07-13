import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import WeekDetailScreen from '../screens/WeekDetailScreen';
import LifestyleAssessmentScreen from '../screens/LifestyleAssessmentScreen';
import FollowupScreen from '../screens/FollowupScreen';
import MainTabs, { type MainTabParamList } from './MainTabs';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  WeekDetail: { weekNumber: number };
  LifestyleAssessment: undefined;
  Followup: { week?: number } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { t, ready } = useLocale();

  if (loading || !ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
        }}
        testID="splash-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: colors.text,
          },
          contentStyle: { backgroundColor: colors.bg },
        }}>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WeekDetail"
              component={WeekDetailScreen}
              options={{ title: t('weekDetailTitle') }}
            />
            <Stack.Screen
              name="LifestyleAssessment"
              component={LifestyleAssessmentScreen}
              options={{ title: t('lifestyleTitle') }}
            />
            <Stack.Screen
              name="Followup"
              component={FollowupScreen}
              options={{ title: t('followupNavTitle') }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
