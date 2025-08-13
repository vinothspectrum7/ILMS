import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';

import EnnVeeLogo from '../assets/icons/EnnVeeLogo.svg';

const BRAND_BG = '#233E55'; 
const NAV_BG   = '#5D768B'; 

const GlobalHeaderComponent = ({
  title = 'Receive',
  greetingName = 'Robert',
  dateText = '06-08-2025',
  onBack = () => {},
  onMenu = () => {},
}) => {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={BRAND_BG} />

      <View style={styles.brandingWrap}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <EnnVeeLogo width={160} height={40} />
          </View>

          <View style={styles.greetWrap}>
            <Text style={styles.helloText} numberOfLines={1} ellipsizeMode="tail">
              {`Hello ${greetingName}`}
            </Text>
            <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
              {dateText}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.navBar}>
        <View style={styles.leftCluster}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>{title}</Text>
        </View>

        <TouchableOpacity onPress={onMenu} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
          <Menu size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: BRAND_BG },

  
  brandingWrap: {
    backgroundColor: BRAND_BG,
    paddingHorizontal: 16,
    paddingTop: 8,     
    paddingBottom: 12, 
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrap: {
    flexShrink: 1,
    paddingRight: 12,
  },
  greetWrap: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  helloText: {
    color: '#FFFFFF',
    fontSize: 16,      
    fontStyle: 'italic',
    fontWeight: '600',
  },
  dateText: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 9,       
    marginTop: 4,
  },

  navBar: {
    backgroundColor: NAV_BG,
    paddingHorizontal: 16,
    height: 64,                 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 16,               
    fontWeight: '700',
    marginLeft: 14,             
    maxWidth: 240,
  },
});

export default GlobalHeaderComponent;
