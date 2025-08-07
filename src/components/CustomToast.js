import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomToast = ({ text1, props }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.strip, { backgroundColor: props?.stripColor || 'green' }]} />
      <Text style={styles.text}>{text1}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  strip: {
    width: 5,
    height: '100%',
    borderRadius: 2,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

export default CustomToast;
