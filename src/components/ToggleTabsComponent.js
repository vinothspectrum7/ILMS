import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ToggleTabsComponent = ({ selectedTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'lineItems' && styles.tabSelected,
        ]}
        onPress={() => onSelectTab('lineItems')}
      >
        <View style={styles.radioCircle}>
          {selectedTab === 'lineItems' && <View style={styles.radioDot} />}
        </View>
        <Text
          style={[
            styles.tabText,
            selectedTab === 'lineItems' && styles.tabTextSelected,
          ]}
        >
          Line Items
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'scanItems' && styles.tabSelected,
        ]}
        onPress={() => onSelectTab('scanItems')}
      >
        <View style={styles.radioCircle}>
          {selectedTab === 'scanItems' && <View style={styles.radioDot} />}
        </View>
        <Text
          style={[
            styles.tabText,
            selectedTab === 'scanItems' && styles.tabTextSelected,
          ]}
        >
          Scan items
        </Text>
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
  tabSelected: {},
  tabText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
  },
  tabTextSelected: {
    fontWeight: 'bold',
    color: '#0A395D',
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0A395D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#0A395D',
  },
});

export default ToggleTabsComponent;
