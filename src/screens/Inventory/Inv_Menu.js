import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';

import SubInvIcon from '../../assets/icons/CycleCount_Icons/SubInvIcon';
import OrgTransferIcon from '../../assets/icons/CycleCount_Icons/SubInvIcon.svg';
import InvAdjustIcon from '../../assets/icons/CycleCount_Icons/InvAdjustIcon.svg';
import CycleCountIcon from '../../assets/icons/CycleCount_Icons/InvAdjustIcon';
import ItemInquiryIcon from '../../assets/icons/CycleCount_Icons/InvAdjustIcon';
import ItemOnHandIcon from '../../assets/icons/CycleCount_Icons/InvAdjustIcon';

import { useReceivingStore } from '../../store/receivingStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 3; 

const Inv_Menu = () => {
  const navigation = useNavigation();
  const {
    OrgData,
    removeOrgTransferDetails,
    resetOrgnaizationTransferItems,
    resetSubInvTransfer,
    resetInvAdjustment,
  } = useReceivingStore();

  const onBack = useCallback(() => navigation.navigate('Home'), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

  useFocusEffect(
    useCallback(() => {
      removeOrgTransferDetails();
      resetOrgnaizationTransferItems();
      resetSubInvTransfer();
      resetInvAdjustment();
    }, [])
  );

  const MenuCard = ({ title, Icon, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Icon width={28} height={28} />
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );

  const goCycleCount = useCallback(
  () => navigation.navigate('CC_CreateCount'),
  [navigation]
);


  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Inventory"
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      <View style={styles.grid}>
        <MenuCard
          title="Sub Inventory Transfer"
          Icon={SubInvIcon}
          onPress={() => navigation.navigate('SubInvTransfer')}
        />

        <MenuCard
          title="Organization Transfer"
          Icon={OrgTransferIcon}
          onPress={() => navigation.navigate('orgTransfer')}
        />

        <MenuCard
          title="Inventory Adjustments"
          Icon={InvAdjustIcon}
          onPress={() => navigation.navigate('Inv_Adjustment_AddScreen')}
        />

        <MenuCard
          title="Cycle Count"
          Icon={CycleCountIcon}
          onPress={() => navigation.navigate('CycleCount')}
        />

        <MenuCard
          title="Item Inquiry"
          Icon={ItemInquiryIcon}
          onPress={() => navigation.navigate('ItemInquiry')}
        />

        <MenuCard
          title="Item On-Hand"
          Icon={ItemOnHandIcon}
          onPress={() => navigation.navigate('ItemOnHand')}
        />
      </View>
    </View>
  );
};

export default Inv_Menu;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6', 
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    marginTop: 20,
  },

  card: {
    width: CARD_WIDTH,
    height: 89,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },

  cardText: {
    marginTop: 8,
    fontFamily: 'Mulish',
    fontSize: 12,
    fontWeight: '700',
    color: '#242424',
    textAlign: 'center',
  },
});
