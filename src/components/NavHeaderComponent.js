import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const NavHeaderComponent = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <ArrowLeft color="#fff" size={24} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>New Receive</Text>

      <TouchableOpacity onPress={() => {}}>
        <Menu color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0A395D',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: -200,
  },
});

export default NavHeaderComponent;
