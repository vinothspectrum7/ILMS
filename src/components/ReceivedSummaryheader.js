import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const SummaryTabHdrsComponent = ({ allSelected, onToggleAll }) => {
  const handleToggle = () => onToggleAll?.(!allSelected);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.section2}>
        <Text style={styles.label}>Items</Text>
      </View>
      <View style={styles.section3}>
        <Text style={styles.qtyLabel}>Qty Received</Text>
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
    marginTop: 12,
  },
  section1: {
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTouch: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxVisual: {
    width: 16,
    height: 16,
    marginLeft: -20,
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
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
    fontSize: 12,
    fontWeight: '300',
    color: '#242424',
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: '300',
    color: '#242424',
    marginRight: 12,
  },
});

export default SummaryTabHdrsComponent;
