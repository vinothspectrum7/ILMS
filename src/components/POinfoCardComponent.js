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
                <View style={styles.cardLeft}>
                  <View style={styles.row}>
                    <Text style={styles.labelText}>Purchase Receipt</Text>
                    <Text style={styles.valueText}>{rn}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.labelText}>PO Number</Text>
                    <Text style={styles.valueText}>{po}</Text>
                  </View>
                </View>
    
                <View style={styles.cardRight}>
                  <View style={styles.row}>
                    <Text style={styles.labelText}>Supplier</Text>
                    <Text style={styles.valueText}>{sup}</Text>
                  </View>
                  <View style={styles.row}>
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
    marginTop:24,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardLeft: { flex: 1, paddingRight: 6 },
  cardRight: { flex: 1, paddingLeft: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  labelText: { fontSize: 12, color: '#555', flex: 1 },
  valueText: { fontSize: 12, fontWeight: 'bold', color: '#1C1C1C', flex: 1, textAlign: 'left' },
  openText: { color: 'green' },
  subLabel: { fontSize: 12, color: '#555', marginTop: 4, marginBottom: 2 },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  column: { flex: 1 },
});

export default POinfoCardComponent;
