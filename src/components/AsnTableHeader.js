import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import FilterIcon from '../assets/icons/filter.svg';

const FILTERS = ['Yet to Receive', 'Receive In progress', 'Partly Received'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const s = (n) => (SCREEN_WIDTH / BASE_WIDTH) * n;

const AsnHeaderComponent = ({ allSelected, onToggleAll, activeFilter, onChangeFilter }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handlePick = (value) => {
    const next = value === activeFilter ? null : value;
    onChangeFilter?.(next);
    setMenuOpen(false);
  };

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
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Details</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setMenuOpen((v) => !v)} activeOpacity={0.8}>
            <FilterIcon width={18} height={18} />
          </TouchableOpacity>
        </View>

        {menuOpen && (
          <View style={styles.menu}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.menuItem, activeFilter === f && styles.menuItemActive]}
                onPress={() => handlePick(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.menuText, activeFilter === f && styles.menuTextActive]}>{f}</Text>
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    zIndex: 5,
  },
  checkbox: {
    width: s(16),
    height: s(16),
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
    marginLeft: -s(15),
  },
  section1: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section2: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 15,
    position: 'relative',
  },
  section3: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 100,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',    
  },
  filterBtn: {
    padding: 4
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
  menu: {
    position: 'absolute',
    top: 34,
    left: -30,
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
    overflow: 'visible',
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 2,
  },
  menuItemActive: {
    backgroundColor: '#E6F0FA',
  },
  menuText: {
    fontSize: 14,
    color: '#111',
  },
  menuTextActive: {
    fontWeight: '600',
  },
});

export default AsnHeaderComponent;
