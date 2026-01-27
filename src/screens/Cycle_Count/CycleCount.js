import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import CreateCountIcon from '../../assets/icons/CycleCount_Icons/CreateCountIcon.svg';
import ViewCountsIcon from '../../assets/icons/CycleCount_Icons/OrgTransferIcon.svg';
import CountHistoryIcon from '../../assets/icons/CycleCount_Icons/CountHistoryIcon.svg';
import CountSettingsIcon from '../../assets/icons/CycleCount_Icons/CountSettingsIcon.svg';
import { useReceivingStore } from '../../store/receivingStore';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 3; 

const CycleCount = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

  const MenuCard = ({ title, Icon, onPress, description }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Icon width={32} height={32} />
      <Text style={styles.cardTitle}>{title}</Text>
      {description && <Text style={styles.cardDescription}>{description}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Cycle Count"
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      <View style={styles.content}>
    

        <View style={styles.grid}>
          <MenuCard
            title="Create Count"
            Icon={CreateCountIcon}
            onPress={() => navigation.navigate('CC_CreateCount')}
          />

          <MenuCard
            title="Active Cycle Counts"
            Icon={ViewCountsIcon}
            onPress={() => navigation.navigate('CC_ActiveCount')}
          />

          <MenuCard
            title="Count History"
            Icon={CountHistoryIcon}
            onPress={() => navigation.navigate('CC_CountHistoryScreen')}
          />

          <MenuCard
            title="Review Variances"
            Icon={CountSettingsIcon}
            onPress={() => navigation.navigate('CC_Settings')}
          />
        </View>

      </View>
    </View>
  );
};

export default CycleCount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 20,
  },


  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: 'Mulish',
    fontSize: 14,
    fontWeight: '700',
    color: '#242424',
    marginTop: 12,
    textAlign: 'center',
  },

 
});