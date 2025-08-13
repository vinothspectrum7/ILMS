import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

export const ShippingStatusCard = ({ label, count, icon: Icon, iconColor = '#000', onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconWrap}>
        {Icon ? <Icon width={30} height={30} fill={iconColor} /> : null}
      </View>

      <View style={styles.titleWrap}>
        <Text
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>

      <View style={styles.countWrap}>
        <Text style={styles.count}>{count}</Text>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',     
    elevation: 3,
    minWidth: width / 4,              
  },

  // Fixed heights so icon/count never shift
  iconWrap: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleWrap: {
    minHeight: 34,                    
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  countWrap: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
