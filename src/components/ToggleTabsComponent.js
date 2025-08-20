import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RadioGlossySelected from '../assets/icons/RadioGlossySelected.svg';
import RadioGlossyUnselected from '../assets/icons/RadioGlossyUnselected.svg';

const BRAND = '#0A395D';

const RadioIcon = ({ selected, size = 20 }) =>
  selected ? (
    <RadioGlossySelected width={size} height={size} />
  ) : (
    <RadioGlossyUnselected width={size} height={size} />
  );

const ToggleTabsComponent = ({ selectedTab, onSelectTab }) => {
  const isLine = selectedTab === 'lineItems';
  const isScan = selectedTab === 'scanItems';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => onSelectTab('lineItems')} activeOpacity={0.8}>
        <RadioIcon selected={isLine} size={20} />
        <Text style={[styles.tabText, isLine && styles.tabTextSelected]}>Line Items</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onSelectTab('scanItems')} activeOpacity={0.8}>
        <RadioIcon selected={isScan} size={20} />
        <Text style={[styles.tabText, isScan && styles.tabTextSelected]}>Scan items</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  tabText: {
    fontSize: 16,
    color: BRAND,
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextSelected: {
    fontWeight: '700',
  },
});

export default ToggleTabsComponent;
