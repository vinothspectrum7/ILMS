import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const ShippingStatusCard = ({ label, count, icon: Icon, iconColor = '#000', onPress }) => {
  return (
    <View style={styles.card}>
      {Icon && <Icon width={30} height={30} fill={iconColor} style={styles.icon} />}
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    minWidth: width / 4,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
