import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WeekDetailScreen from '../screens/WeekDetailScreen';
import LifestyleAssessmentScreen from '../screens/LifestyleAssessmentScreen';
import FollowupScreen from '../screens/FollowupScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  WeekDetail: { weekNumber: number };
  LifestyleAssessment: undefined;
  Followup: { week?: number } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
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
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}>
        {user ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WeekDetail"
              component={WeekDetailScreen}
              options={{ title: 'Week Detail' }}
            />
            <Stack.Screen
              name="LifestyleAssessment"
              component={LifestyleAssessmentScreen}
              options={{ title: 'જીવનશૈલી મૂલ્યાંકન' }}
            />
            <Stack.Screen
              name="Followup"
              component={FollowupScreen}
              options={{ title: 'સાપ્તાહિક ફોલોઅપ' }}
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
