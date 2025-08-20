import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const TableHeaderComponent = ({ allSelected, onToggleAll }) => {
  const handleToggle = () => onToggleAll?.(!allSelected);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.section1}>
        <Pressable onPress={handleToggle} hitSlop={12} style={styles.checkboxTouch}>
          <View pointerEvents="none">
            <CheckBox
              value={allSelected}
              style={styles.checkboxVisual}
              tintColors={{ true: '#233E55', false: '#666666' }}
              onCheckColor={Platform.OS === 'ios' ? '#FFFFFF' : undefined}
              onFillColor={Platform.OS === 'ios' ? '#233E55' : undefined}
              onTintColor={Platform.OS === 'ios' ? '#666666' : undefined}
              boxType={Platform.OS === 'ios' ? 'square' : undefined}
              lineWidth={Platform.OS === 'ios' ? 1.5 : undefined}
            />
          </View>
        </Pressable>
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
    backgroundColor: '#F6F8FA',
    paddingVertical: 5,
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
    fontWeight: '500',
    color: '#333',
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginRight: 12,
  },
});

export default TableHeaderComponent;
