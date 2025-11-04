import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((width / base) * v);

export default function DonutChart({ size = rs(140), stroke = rs(16), segments, total, centerTop, centerBottom }) {
  const radius = (size - stroke) / 2.4;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke={colors.hairline} strokeWidth={stroke} fill="none" />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circumference;
          const circle = (
            <Circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={radius}
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              fill="none"
            />
          );
          offset += len;
          return circle;
        })}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.centerTop}>{centerTop}</Text>
        <Text style={styles.centerBottom}>{centerBottom}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerTop: { fontSize: rs(12), color: colors.textSecondary, textAlign: 'center' },
  centerBottom: { fontSize: rs(18), fontWeight: '700', color: colors.textPrimary }
});
