import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import FilterIcon from '../assets/icons/filter.svg';

const FILTERS = ['all', 'pending', 'received'];

const TableHeaderComponent = ({ allSelected, onToggleAll, activeFilter, onChangeFilter }) => {
  const handleToggle = () => onToggleAll?.(!allSelected);

    const [menuOpen, setMenuOpen] = useState(false);

  const handlePick = (value) => {
    onChangeFilter?.(value);
    setMenuOpen(false);
  };

  const pretty = (v) => {
    if (v === 'all') return 'All';
    if (v === 'pending') return 'Pending';
    if (v === 'received') return 'Received';
    return v;
  }

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
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Items</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setMenuOpen((v) => !v)} activeOpacity={0.8}>
            <FilterIcon width={18} height={18} />
          </TouchableOpacity>
        </View>

        {menuOpen && (
          <View style={styles.menu}>
            {FILTERS.map((f) => (
              <TouchableOpacity key={f} style={[styles.menuItem, activeFilter === f && styles.menuItemActive]} onPress={() => handlePick(f)}>
                <Text style={[styles.menuText, activeFilter === f && styles.menuTextActive]}>{pretty(f)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    zIndex: 5
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
    paddingLeft: 0,
    position: 'relative'
  },
  section3: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 100
  },
  label: {
    fontSize: 14,
    fontWeight: '300',
    color: '#242424',
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: '300',
    color: '#242424',
    marginRight: 12,
  },
   detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  filterBtn: {
    padding: 4
  },
  menu: {
    position: 'absolute',
    top: 34,
    left: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 6,
    minWidth: 150,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    zIndex: 100,
    elevation: 5,
    overflow: 'visible'
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  menuItemActive: {
    backgroundColor: '#E6F0FA'
  },
  menuText: {
    fontSize: 14,
    color: '#111'
  },
  menuTextActive: {
    fontWeight: '600'
  }
});

export default TableHeaderComponent;
