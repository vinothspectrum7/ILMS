import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const SummaryTabHdrComponent = ({ allSelected, onToggleAll }) => {
  const handleToggle = () => onToggleAll?.(!allSelected);

  return (
    <View style={styles.container} pointerEvents="box-none">
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
    backgroundColor: '#F6F8FA',
    paddingVertical: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  section1: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTouch: {
    width: 44,
    height: 32,
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
    minWidth: 120,
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
    marginRight: 12,
  },
});

export default SummaryTabHdrComponent;
