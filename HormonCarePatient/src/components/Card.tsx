import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../theme';

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: 'default' | 'warm' | 'success';
};

export default function Card({
  title,
  subtitle,
  children,
  style,
  accent = 'default',
}: Props) {
  return (
    <View
      style={[
        styles.card,
        accent === 'warm' && styles.warm,
        accent === 'success' && styles.success,
        style,
      ]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
    marginBottom: 14,
  },
  warm: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.warmBorder,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBorder,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSoft,
    marginBottom: 12,
    lineHeight: 18,
  },
});
