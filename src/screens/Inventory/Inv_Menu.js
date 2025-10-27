import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';

import SubInvIcon from '../../assets/icons/sub_inv_transfer.svg';
import OrgTransferIcon from '../../assets/icons/org_transfer_icon.svg';
import InvAdjustIcon from '../../assets/icons/inv_adjustments_icon.svg';
import CardDecor from '../../assets/icons/Inv_Menu_bg.svg';
import { useReceivingStore } from '../../store/receivingStore';

const BG = '#FFFFFF';
const CARD_BG = '#F5F5F6';
const TEXT_DARK = '#233E55';
const SHADOW = 'rgba(0, 0, 0, 0.12)';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;


const Inv_Menu = ()=>{
  const { OrgData,removeOrgTransferDetails,resetOrgnaizationTransferItems,resetSubInvTransfer } = useReceivingStore();
  const navigation = useNavigation();
  const goHome = useCallback(() => navigation.navigate('SubInvTransfer'), [navigation]);
  const goOrgTransfer = useCallback(() => navigation.navigate('orgTransfer'), [navigation]);
  const goInvAdjstmnts = useCallback(() => navigation.navigate('Inv_Adjustment_AddScreen'), [navigation]);
  const onBack = useCallback(() => navigation.navigate('Home'), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

    useEffect(() => {
      removeOrgTransferDetails();
      resetOrgnaizationTransferItems();
      resetSubInvTransfer();
    }, []);

  return (
    <View style={styles.safe}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Inventory"
        notificationCount={0}
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
        cartCount={0}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.card}
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="Open Sub Inventory Transfer"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <View style={styles.leftIcon}>
            <SubInvIcon width={scale(36)} height={scale(36)} />
          </View>
          <Text style={styles.title}>Sub Inventory Transfer</Text>
          <View style={styles.decorWrap} pointerEvents="none">
            <CardDecor width="100%" height={scale(22)} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={goOrgTransfer}
          accessibilityRole="button"
          accessibilityLabel="Open Organization Transfer"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <View style={styles.leftIcon}>
            <OrgTransferIcon width={scale(36)} height={scale(36)} />
          </View>
          <Text style={styles.title}>Organization Transfer</Text>
          <View style={styles.decorWrap} pointerEvents="none">
            <CardDecor width="100%" height={scale(22)} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={goInvAdjstmnts}
          accessibilityRole="button"
          accessibilityLabel="Open Inventory Adjustments"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <View style={styles.leftIcon}>
            <InvAdjustIcon width={scale(36)} height={scale(36)} />
          </View>
          <Text style={styles.title}>Inventory Adjustments</Text>
          <View style={styles.decorWrap} pointerEvents="none">
            <CardDecor width="100%" height={scale(22)} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: {
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    gap: ms(16),
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: CARD_RADIUS,
    paddingVertical: ms(18),
    paddingHorizontal: ms(16),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,    
    elevation: 2,
  },
  leftIcon: {
    width: ms(44),
    height: ms(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(12),
  },
  title: {
    flex: 1,
    color: TEXT_DARK,
    fontFamily: 'Mulish',
    fontWeight: '800',
    fontSize: ms(16),
    letterSpacing: 0.2,
  },
  decorWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'stretch',
    marginBottom: -5,
  },
});
export default Inv_Menu;