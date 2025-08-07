import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const POinfoCardComponent = ({ receiptNumber, supplier, poNumber, receiptDate }) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Purchase Receipt</Text>
          <Text style={styles.value}>{receiptNumber}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Supplier</Text>
          <Text style={styles.value}>{supplier}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>PO Number</Text>
          <Text style={styles.value}>{poNumber}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Receipt Date</Text>
          <Text style={styles.value}>{receiptDate}</Text>
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
  column: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#777',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default POinfoCardComponent;
