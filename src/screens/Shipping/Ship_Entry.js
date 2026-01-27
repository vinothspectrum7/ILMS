import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';

import ShippingTransactionsIcon from '../../assets/icons/Ship_Icons/ShippingTransactionsIcon.svg';
import PickIcon from '../../assets/icons/Ship_Icons/PickIcon.svg';
import PackIcon from '../../assets/icons/Ship_Icons/PackIcon.svg';
import LabelPrintingIcon from '../../assets/icons/Ship_Icons/LabelPrintingIcon.svg';
import ShipConfirmIcon from '../../assets/icons/Ship_Icons/ShipConfirmIcon.svg';
import { useReceivingStore } from '../../store/receivingStore';

const BG = '#F5F5F6';
const TEXT_DARK = '#242424';

function ShipEntry() {
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const scale = size => (SCREEN_WIDTH / 375) * size;

  const CARD_GAP = scale(14);
  const CARD_WIDTH = (SCREEN_WIDTH - scale(22 * 2) - CARD_GAP * 2) / 3;
  const CARD_HEIGHT = CARD_WIDTH * 0.75; 

    const {
      OrgData,
    } = useReceivingStore();

  const MENU_ITEMS = [
    {
      id: 1,
      title: 'Shipping\nTransactions',
      route: 'ShipDashboard',
      Icon: ShippingTransactionsIcon,
      status: 'All',
    },
    {
      id: 2,
      title: 'Pick',
      route: 'ShipDashboard',
      Icon: PickIcon,
      status: 'Pick',
    },
    {
      id: 3,
      title: 'Pack',
      route: 'ShipDashboard',
      Icon: PackIcon,
      status: 'Ready To Pack',
    },
    {
      id: 4,
      title: 'Label\nPrinting',
      route: 'Ship_LabelPrintListScreen',
    },
    {
      id: 5,
      title: 'Ship\nConfirm',
      route: 'ShipDashboard',
      Icon: ShipConfirmIcon,
      status: 'Ready To Ship',
    },
  ];

  const renderCard = item => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.card,
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          marginBottom: scale(20),
        },
      ]}
      onPress={() => {
        if (item.route) {
          const params = item.status ? { status: item.status } : undefined;
          navigation.navigate(item.route, params);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={{ marginBottom: scale(6) }}>
        {item.Icon && (
          <item.Icon width={scale(22)} height={scale(22)} />
        )}
      </View>

      <Text
        style={[
          styles.cardTitle,
          {
            fontSize: scale(11),
            lineHeight: scale(13),
          },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safe}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <View style={{ backgroundColor: '#233E55' }}>
        <GlobalHeaderComponent
          screenTitle="Shipping"
          organizationName={OrgData?.selectedOrgCode || 'EnnVee'}
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: scale(40) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: scale(22), marginTop: scale(20) }}>
          <View style={styles.row}>
            {MENU_ITEMS.slice(0, 3).map(renderCard)}
          </View>

          <View style={styles.row}>
            {MENU_ITEMS.slice(3, 5).map(renderCard)}
            <View style={{ width: CARD_WIDTH }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    textAlign: 'center',
    color: TEXT_DARK,
    paddingHorizontal: 4,
  },
});


export default ShipEntry;
