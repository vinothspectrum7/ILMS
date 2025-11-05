import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((width / base) * v);

const STATUS_BG = {
  Received: colors.tintGreen,
  Shipped: colors.tintBlue,
  Processing: colors.tintOrange,
  Default: '#F3F4F6'
};

const STATUS_COLOR = {
  Received: colors.statGreen,
  Shipped: colors.statBlue,
  Processing: colors.statOrange,
  Default: colors.textSecondary
};

export default function ActivityItem({ refId, status, ago, value, unit }) {
  const bg = STATUS_BG[status] || STATUS_BG.Default;
  const fg = STATUS_COLOR[status] || STATUS_COLOR.Default;
  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <Text style={styles.ref}>{refId}</Text>
        <View style={styles.subRow}>
          <View style={[styles.chip, { backgroundColor: bg }]}>
            <Text style={[styles.chipText, { color: fg }]}>{status}</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.time}>{ago} ago</Text>
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
    backgroundColor: '#FBFBFB',
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
