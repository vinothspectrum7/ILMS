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
const formatDate = (date) => {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mmm = monthNames[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mmm} ${yyyy}`;
};
  return (
    <View style={styles.card}>
      
        <View style={styles.toprow}>
          <View style={styles.topcardLeft}>
          <Text style={styles.labelText}>Purchase Receipt</Text>
          <Text style={styles.valueText}>{rn}</Text>
          </View>
          <View style={styles.topcardRight}>
          <Text style={styles.labelText}>Supplier</Text>
          <Text style={styles.valueText}>{sup}</Text>
          </View>
        </View>
        <View style={styles.bottomrow}>
          <View style={styles.bottomcardLeft}>
          <Text style={styles.labelText}>PO Number</Text>
          <Text style={styles.valueText}>{po}</Text>
          </View>
          <View style={styles.bottomcardRight}>
          <Text style={styles.labelText}>Receipt Date</Text>
          <Text style={styles.valueText}>{formatDate(rd)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  topcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), paddingBottom: scale(6), minWidth: 0 },
  topcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), paddingBottom: scale(6), minWidth: 0 },
  bottomcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), minWidth: 0 },
  bottomcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), minWidth: 0 },
  toprow: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: scale(0),
  },
  bottomrow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  labelText: {
    fontSize: ms(10),
    color: '#666666',
    flex: 1,
    marginRight: scale(6),
  },
  valueText: {
    fontSize: ms(10),
    fontWeight: 'bold',
    color: '#1C1C1C',
    flex: 1,
    textAlign: 'left',
  },
  openText: { color: 'green' },
  subLabel: { fontSize: ms(10), color: '#666666', marginTop: scale(4), marginBottom: scale(2) },
  column: { flex: 1 },
});

export default POinfoCardComponent;
