import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  /** compact = header row; full = login / hero */
  size?: 'compact' | 'full';
  showTagline?: boolean;
};

export default function BrandTitle({
  size = 'compact',
  showTagline = true,
}: Props) {
  const isFull = size === 'full';

  return (
    <View
      style={[styles.wrap, isFull ? styles.wrapFull : styles.wrapCompact]}
      accessibilityRole="header">
      <Text
        style={[styles.name, isFull ? styles.nameFull : styles.nameCompact]}>
        JEEVANM
      </Text>

      {showTagline ? (
        <Text
          style={[
            styles.tagline,
            isFull ? styles.taglineFull : styles.taglineCompact,
          ]}
          numberOfLines={1}>
          Transforming Habits Into Health
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minWidth: 0,
    flexShrink: 1,
  },
  wrapCompact: {
    alignItems: 'flex-start',
  },
  wrapFull: {
    alignItems: 'center',
  },
  name: {
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  nameCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  nameFull: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 1.4,
  },
  tagline: {
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 1,
  },
  taglineCompact: {
    marginTop: 2,
    fontSize: 9,
    letterSpacing: 0.1,
  },
  taglineFull: {
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
