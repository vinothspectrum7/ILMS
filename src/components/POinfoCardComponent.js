import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const dash = '—';

const POinfoCardComponent = ({ receiptNumber, supplier, poNumber, receiptDate }) => {
  const rn = (receiptNumber ?? '').toString().trim() || dash;
  const sup = (supplier ?? '').toString().trim() || dash;
  const po = (poNumber ?? '').toString().trim() || dash;
  const rd = (receiptDate ?? '').toString().trim() || dash;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Purchase Receipt</Text>
          <Text style={styles.value}>{rn}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Supplier</Text>
          <Text style={styles.value}>{sup}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>PO Number</Text>
          <Text style={styles.value}>{po}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Receipt Date</Text>
          <Text style={styles.value}>{rd}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  column: { flex: 1 },
  label: { fontSize: 12, color: '#777' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#000' },
});

export default POinfoCardComponent;
