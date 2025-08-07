import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import CardBackground from '../assets/icons/Card_background.svg';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

export function NavigationCard({ title, icon: IconComponent, onPress }) {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.backgroundWrapper}>
        <CardBackground width="100%" height={responsiveSize(40)} style={styles.cardBackground} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.iconWrapper}>
        {IconComponent && <IconComponent width={responsiveSize(46)} height={responsiveSize(46)} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: (screenWidth - responsiveSize(55)) / 3,
    height: responsiveSize(80),
    backgroundColor: '#FFFFFF',
    borderRadius: responsiveSize(16),
    marginStart: 0,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backgroundWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardBackground: {
    bottom: 0,
    left: 0,
    right: 0,
    resizeMode: 'stretch',
    marginBottom: -5,
  },
  title: {
    fontSize: responsiveSize(12),
    fontWeight: '600',
    color: '#000000',
    marginTop: responsiveSize(5),
    marginStart: responsiveSize(10),
  },
  iconWrapper: {
    position: 'absolute',
    bottom: responsiveSize(5),
    right: responsiveSize(5),
  },
});
