import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: 'default' | 'warm';
};

export default function Card({ title, subtitle, children, style, accent = 'default' }: Props) {
  return (
    <View
      style={[
        styles.card,
        accent === 'warm' && styles.warm,
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
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
    marginBottom: 14,
  },
  warm: {
    backgroundColor: colors.bgSoft,
    borderColor: '#f9d5e3',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: colors.textSoft, marginBottom: 12 },
});
