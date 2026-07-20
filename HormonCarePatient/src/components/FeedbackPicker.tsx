import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { translate } from '../i18n/translations';
import type { Locale } from '../i18n/types';
import { colors, radius } from '../theme';

export type PlanFeedback = 'excellent' | 'moderate' | 'poor';

type Props = {
  value: string;
  onChange: (v: PlanFeedback) => void;
  locale: Locale;
};

const OPTIONS: {
  value: PlanFeedback;
  labelKey: 'feedbackExcellent' | 'feedbackModerate' | 'feedbackPoor';
  activeBg: string;
  activeBorder: string;
  activeText: string;
  iconColor: string;
}[] = [
  {
    value: 'excellent',
    labelKey: 'feedbackExcellent',
    activeBg: colors.successSoft,
    activeBorder: colors.successBorder,
    activeText: colors.success,
    iconColor: colors.success,
  },
  {
    value: 'moderate',
    labelKey: 'feedbackModerate',
    activeBg: colors.warningSoft,
    activeBorder: colors.accent,
    activeText: colors.warning,
    iconColor: colors.warning,
  },
  {
    value: 'poor',
    labelKey: 'feedbackPoor',
    activeBg: colors.dangerSoft,
    activeBorder: colors.dangerBorder,
    activeText: colors.primaryHover,
    iconColor: colors.danger,
  },
];

function FaceIcon({
  kind,
  color,
}: {
  kind: PlanFeedback;
  color: string;
}) {
  if (kind === 'excellent') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.75} />
        <Circle cx="9" cy="10" r="1" fill={color} />
        <Circle cx="15" cy="10" r="1" fill={color} />
        <Path
          d="M8.5 14.5c1.2 1.5 2.7 2.2 3.5 2.2s2.3-.7 3.5-2.2"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (kind === 'moderate') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.75} />
        <Circle cx="9" cy="10" r="1" fill={color} />
        <Circle cx="15" cy="10" r="1" fill={color} />
        <Path
          d="M9 15.5h6"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.75} />
      <Circle cx="9" cy="10" r="1" fill={color} />
      <Circle cx="15" cy="10" r="1" fill={color} />
      <Path
        d="M8.5 16.5c1.2-1.5 2.7-2.2 3.5-2.2s2.3.7 3.5 2.2"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function FeedbackPicker({ value, onChange, locale }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(opt => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.card,
              selected && {
                backgroundColor: opt.activeBg,
                borderColor: opt.activeBorder,
              },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}>
            <FaceIcon
              kind={opt.value}
              color={selected ? opt.iconColor : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                selected && { color: opt.activeText, fontWeight: '700' },
              ]}>
              {translate(locale, opt.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  card: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    textAlign: 'center',
  },
});
