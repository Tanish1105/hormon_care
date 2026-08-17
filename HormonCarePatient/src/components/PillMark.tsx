import React from 'react';
import { View } from 'react-native';
import CapsuleIcon from './CapsuleIcon';
import { colors, radius } from '../theme';

type Props = {
  size?: number;
  iconSize?: number;
  color?: string;
  background?: string;
};

export default function PillMark({
  size = 40,
  iconSize = 20,
  color = colors.primary,
  background = colors.primaryTint,
}: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.md,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <CapsuleIcon size={iconSize} color={color} />
    </View>
  );
}
