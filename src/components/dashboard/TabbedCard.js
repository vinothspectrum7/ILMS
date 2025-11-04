import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((width / base) * v);

export default function TabbedCard({ tabs, activeKey, onChange, right, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          {tabs.map(t => (
            <TouchableOpacity key={t.key} onPress={() => onChange(t.key)} style={styles.tabBtn}>
              <Text style={[styles.tabText, activeKey === t.key ? styles.tabTextActive : null]}>{t.label}</Text>
              {activeKey === t.key ? <View style={styles.underline} /> : null}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: rs(16),
    padding: rs(12),
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.08,
    shadowRadius: rs(6),
    borderColor: colors.cardBorder,
    borderWidth: 1
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(8) },
  tabs: { flexDirection: 'row', alignItems: 'center' },
  tabBtn: { marginRight: rs(18), alignItems: 'center' },
  tabText: { fontSize: rs(14), color: colors.tabInactive, fontWeight: '600' },
  tabTextActive: { color: colors.tabActive },
  underline: { marginTop: rs(6), height: rs(3), width: '100%', borderRadius: rs(2), backgroundColor: colors.tabActive },
  right: { flexDirection: 'row', alignItems: 'center' },
  body: { marginTop: rs(6) }
});
