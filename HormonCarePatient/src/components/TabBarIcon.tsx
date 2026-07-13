import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';

type Props = {
  name: 'home' | 'plan' | 'profile';
  color: string;
};

export default function TabBarIcon({ name, color }: Props) {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      {name === 'home' ? (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.5L12 3l9 7.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5 9.5V20h14V9.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : name === 'plan' ? (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Rect
            x={4}
            y={5}
            width={16}
            height={15}
            rx={2}
            stroke={color}
            strokeWidth={2}
          />
          <Line x1={8} y1={3} x2={8} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Line x1={16} y1={3} x2={16} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Line x1={4} y1={10} x2={20} y2={10} stroke={color} strokeWidth={2} />
        </Svg>
      ) : (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={2} />
          <Path
            d="M5 20c1-4 3.5-6 7-6s6 2 7 6"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      )}
    </View>
  );
}
