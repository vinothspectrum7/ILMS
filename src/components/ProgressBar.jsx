import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

export const ProgressBar = ({ label, progress, color, count }) => (
  <View style={styles.progressBarContainer}>
    <View style={styles.progressBarHeader}>
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={[styles.progressBadge, { backgroundColor: color }]}>
        <Text style={styles.progressCount}>{count}</Text>
      </View>
    </View>
    <View style={styles.progressBarBackground}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${progress}%`, backgroundColor: color }
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  progressBarContainer: {
    marginBottom: responsiveSize(16),
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSize(8),
  },
  progressLabel: {
    fontSize: responsiveSize(12),
    fontWeight: '500',
    color: '#374151',
  },
  progressBadge: {
    paddingHorizontal: responsiveSize(8),
    paddingVertical: responsiveSize(2),
    borderRadius: responsiveSize(10),
    minWidth: responsiveSize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCount: {
    color: '#ffffff',
    fontSize: responsiveSize(12),
    fontWeight: '600',
  },
  progressBarBackground: {
    height: responsiveSize(6),
    backgroundColor: '#e5e7eb',
    borderRadius: responsiveSize(3),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: responsiveSize(3),
  },
});
