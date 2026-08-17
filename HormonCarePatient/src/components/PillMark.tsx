import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.5 4.5c-2.2 2.2-2.2 5.8 0 8l2 2c2.2 2.2 5.8 2.2 8 0 2.2-2.2 2.2-5.8 0-8l-2-2c-2.2-2.2-5.8-2.2-8 0Z"
          stroke={color}
          strokeWidth={2}
        />
        <Path
          d="M8.5 13.5 4.8 17.2c-1.2 1.2-1.2 3.1 0 4.3 1.2 1.2 3.1 1.2 4.3 0l3.7-3.7"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
