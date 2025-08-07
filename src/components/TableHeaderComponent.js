import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const TableHeaderComponent = ({ allSelected, onToggleAll }) => {
  return (
    <View style={styles.container}>
      <View style={styles.section1}>
        <CheckBox
          value={allSelected}
          onValueChange={onToggleAll}
          tintColors={{ true: '#233E55', false: '#233E55' }}
          style={styles.checkbox}
        />
      </View>
      <View style={styles.section2}>
        <Text style={styles.label}>Items</Text>
      </View>
      <View style={styles.section3}>
        <Text style={styles.qtyLabel}>Qty To Receive</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingVertical: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    marginLeft: -15,
  },
  section1: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section2: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  section3: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 20,
  },
});

export default TableHeaderComponent;
