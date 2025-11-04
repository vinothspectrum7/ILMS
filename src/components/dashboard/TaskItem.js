import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((width / base) * v);

const PRI_BG = { High: colors.tintOrange, Medium: colors.tintGreen, Critical: colors.tintRed, Default: '#F3F4F6' };
const PRI_COLOR = { High: colors.statOrange, Medium: colors.statGreen, Critical: colors.statRed, Default: colors.textSecondary };

export default function TaskItem({ label, priority, due, value, unit }) {
  const bg = PRI_BG[priority] || PRI_BG.Default;
  const fg = PRI_COLOR[priority] || PRI_COLOR.Default;
  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <Text style={styles.ref}>{label}</Text>
        <View style={styles.subRow}>
          <View style={[styles.chip, { backgroundColor: bg }]}>
            <Text style={[styles.chipText, { color: fg }]}>{priority}</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.time}>Due: {due}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.cardBg,
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: rs(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(10)
  },
  left: { flexShrink: 1, paddingRight: rs(8) },
  ref: { fontSize: rs(14), fontWeight: '600', color: colors.textPrimary, marginBottom: rs(6) },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  chip: { borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(2), marginRight: rs(6) },
  chipText: { fontSize: rs(11), fontWeight: '600' },
  dot: { marginHorizontal: rs(4), color: colors.textSecondary },
  time: { fontSize: rs(12), color: colors.textSecondary },
  right: { alignItems: 'flex-end' },
  value: { fontSize: rs(18), fontWeight: '700', color: colors.textPrimary },
  unit: { fontSize: rs(11), color: colors.textSecondary }
});
