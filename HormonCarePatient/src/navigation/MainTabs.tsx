import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme';
import type { PlanProgram } from '../api/client';
import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import PlanScreen from '../screens/PlanScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Plan: { program?: PlanProgram } | undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_CONTENT_HEIGHT = 54;

export default function MainTabs() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 6);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [
          styles.tabBar,
          {
            height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('tabHome'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          title: t('tabPlan'),
          tabBarIcon: ({ color }) => <TabBarIcon name="plan" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('tabProfile'),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="profile" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    paddingTop: 4,
    elevation: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
