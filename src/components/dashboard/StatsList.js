import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((width / base) * v);

export default function StatsList({ items }) {
  return (
    <View style={styles.wrap}>
      {items.map((it, idx) => (
        <View key={idx} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: it.color }]} />
          <Text style={styles.label}>{it.label}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.value}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingLeft: rs(8), paddingRight: rs(12),zIndex:-9 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(6) },
  dot: { width: rs(10), height: rs(10), borderRadius: rs(5), marginRight: rs(8) },
  label: { fontSize: rs(12), color: '#000000', marginRight: rs(10),fontWeight:600,letterSpacing:0.2 },
  value: { fontSize: rs(12), fontWeight: '600', color: '#000000' }
});
