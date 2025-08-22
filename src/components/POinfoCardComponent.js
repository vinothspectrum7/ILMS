import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';

const dash = '—';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const POinfoCardComponent = ({ receiptNumber, supplier, poNumber, receiptDate }) => {
  const rn = (receiptNumber ?? '').toString().trim() || dash;
  const sup = (supplier ?? '').toString().trim() || dash;
  const po = (poNumber ?? '').toString().trim() || dash;
  const rd = (receiptDate ?? '').toString().trim() || dash;

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.toprow}>
          <Text style={styles.labelText}>Purchase Receipt</Text>
          <Text style={styles.valueText}>{rn}</Text>
        </View>
        <View style={styles.bottomrow}>
          <Text style={styles.labelText}>PO Number</Text>
          <Text style={styles.valueText}>{po}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={styles.toprow}>
          <Text style={styles.labelText}>Supplier</Text>
          <Text style={styles.valueText}>{sup}</Text>
        </View>
        <View style={styles.bottomrow}>
          <Text style={styles.labelText}>Receipt Date</Text>
          <Text style={styles.valueText}>{rd}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: scale(24),
    marginHorizontal: scale(12),
    marginVertical: scale(6),
    borderRadius: scale(12),
    padding: scale(12),
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: scale(3),
      },
    }),
  },
  cardLeft: { flex: 1, paddingRight: 6 },
  cardRight: { flex: 1, paddingLeft: 6 },
  toprow: { flex:2,flexDirection: 'row',minWidth:'100%', marginBottom: 10 },
  bottomrow: {flex:0, flexDirection: 'row',minWidth:'100%',  marginBottom: 10 },
  labelText: { fontSize: 10, color: '#555', flex: 1 },
  valueText: { fontSize: 10, fontWeight: 'bold', color: '#1C1C1C', flex: 1, textAlign: 'left' },
  openText: { color: 'green' },
  subLabel: { fontSize: ms(10), color: '#666666', marginTop: scale(4), marginBottom: scale(2) },
  column: { flex: 1 },
});

export default POinfoCardComponent;
