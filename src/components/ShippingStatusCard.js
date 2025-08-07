import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const baseWidth = 375;
const scale = screenWidth / baseWidth;

const responsiveSize = (size) => Math.round(size * scale);

export function ShippingStatusCard({ label, count, icon: IconComponent, iconColor, onPress }) {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <View style={[styles.iconWrapper]}>
        {IconComponent && <IconComponent width={responsiveSize(24)} height={responsiveSize(24)} />}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: (screenWidth - responsiveSize(40) - responsiveSize(20)) / 3,
    maxWidth: responsiveSize(105),
    aspectRatio: 1 / 1,
    backgroundColor: '#FFFFFF',
    borderRadius: responsiveSize(10),
    padding: responsiveSize(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveSize(2) },
    shadowOpacity: 0.08,
    shadowRadius: responsiveSize(4),
    elevation: 3,
    marginBottom: responsiveSize(10),
  },
  iconWrapper: {
    width: responsiveSize(40),
    height: responsiveSize(40),
    borderRadius: responsiveSize(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSize(8),
  },
  count: {
    fontSize: responsiveSize(18),
    fontWeight: '700',
    color: '#1f2937',
  },
  label: {
    fontSize: responsiveSize(8),
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: responsiveSize(4),
  },
});
