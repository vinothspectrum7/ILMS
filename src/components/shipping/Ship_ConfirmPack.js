import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import ShipConfirmationModal from './Ship_ConfirmationModal';
import { useShippingStore } from '../../store/shippingStore';
import { useReceivingStore } from '../../store/receivingStore';
import {
  GetShippingLpnDetailsData,
} from '../../api/ApiServices';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Ship_ConfirmPack = () => {
  const navigation = useNavigation();

  const setLPNitemsData = useShippingStore(s => s.setLpnItemsData);
  const selectedTransaction = useShippingStore(s => s.selectedTransaction);
  const setSelectedTransaction = useShippingStore(s => s.setSelectedTransaction);
  const setTransactionStatus = useShippingStore(s => s.setTransactionStatus);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { OrgData } = useReceivingStore();

  const getOrgCode = () => {
    const val = useReceivingStore.getState()?.OrgData?.selectedOrg;
    return parseInt(val, 10);
  };

  const [phase, setPhase] = useState('idle');
  const [LPNListItems, setLPNListItems] = useState([]);
  const [PackListOrders, setPackListOrders] = useState(null); 

  const maptoLPNitemslist = data =>
    data.map(backend => ({
      item_code: backend.item_code || '-',
      qty_to_pick: backend.qty_to_pick || '-',
      unit_of_measure: backend.unit_of_measure || '-',
      sub_inventory: backend.sub_inventory || '-',
      locator: backend.locator || '-',
      item_status: backend.status || '-',
    }));

  const mapToPickOrderHeader = backend => ({
    customer_name: backend?.customer_name || '-',
    carrier_name: backend?.carrier_name || '-',
    ship_from_location: backend?.ship_from_location || '-',
    pick_slip_number: backend?.pick_slip_number || '-',
  }); 

    useEffect(() => {
      if (!selectedTransaction?.deliveryId) return;
  
      const orgCode = getOrgCode();
      setPhase('loading');
  
      const loadLPNitemsData = async () => {
        try {
          const LPNitemsdata = await GetShippingLpnDetailsData(
            orgCode,
            selectedTransaction.deliveryId
          );
  
          if (LPNitemsdata?.lpn_details?.length) {
            setLPNListItems(maptoLPNitemslist(LPNitemsdata.lpn_details));
          } else {
            setLPNListItems([]);
          }
  
          setPhase('success');
        } catch (error) {
          setPhase('error');
          navigation.navigate('Ship_Entry');
        }
      };
  
      const loadPackOrderData = async () => {
        try {
          const Packorderdata = await GetShippingPackOrderData(
            orgCode,
            selectedTransaction.deliveryId
          );
  
          if (Packorderdata?.pack_order_result?.length) {
            setPackListOrders(
              mapToPickOrderHeader(Packorderdata.pack_order_result[0])
            );
          } else {
            setPackListOrders(null);
          }
  
          setPhase('success');
        } catch (error) {
          setPhase('error');
          navigation.navigate('Ship_Entry');
        }
      };
  
      loadLPNitemsData();
      loadPackOrderData();
    }, [selectedTransaction?.deliveryId]);


  const confirmList = useMemo(() => {
    const list = selectedTransaction?.confirm_data;
    return Array.isArray(list) ? list : [];
  }, [selectedTransaction]);

  const handleConfirm = () => {
    const items = Array.isArray(selectedTransaction?.items) ? selectedTransaction.items : [];
    const updatedItems = items.map(it => ({ ...it, status: 'Packed' }));

    const updatedTransaction = {
      ...(selectedTransaction || {}),
      items: updatedItems,
      status: 'Ready To Ship',
    };

    setSelectedTransaction(updatedTransaction);

    if (updatedTransaction?.deliveryId) {
      setTransactionStatus(updatedTransaction.deliveryId, 'Ready To Ship');
    }

    setShowConfirmModal(true);
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);

    const deliveryId = selectedTransaction?.deliveryId;
    if (deliveryId) {
      setTransactionStatus(deliveryId, 'Ready To Ship');
    }

    navigation.navigate('ShipDashboard', { status: 'All' });
  };

  const mainCardWidth = Math.min(372, screenWidth - 42);
  const itemCardWidth = Math.min(309, mainCardWidth - 32);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <GlobalHeaderComponent
        screenTitle="Confirm"
        organizationName={OrgData?.selectedOrgCode || 'EnnVee'}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={[styles.mainCard, { width: mainCardWidth, maxHeight: screenHeight * 0.72 }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mainCardContent}>
            {LPNListItems.map((item, index) => (
              <View key={index} style={[styles.itemCard, { width: itemCardWidth }]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.headerLabel}>LPN</Text>
                  <Text style={styles.headerValue}>{item.lpn_number ?? '-'}</Text>
                </View>

                <View style={styles.itemBody}>
                  <View style={styles.twoColRow}>
                    <InfoBlock label="Delivery Number" value={item.delivery_number ?? '-'} />
                    <InfoBlock label="Customer Name" value={item.customer_name ?? '-'} />
                  </View>

                  <View style={styles.twoColRow}>
                    <InfoBlock label="Carrier" value={item.carrier_name ?? '-'} />
                    <InfoBlock label="Pack Number" value={item.pack_number ?? '-'} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.footer}>
        <SingleFooterBtnComponent label="Confirm pack" onPress={handleConfirm} enabled />
      </View>

      <ShipConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onNo={handleConfirmNo}
        type="CONFIRM_PACK"
        itemCount={confirmList.length}
      />
    </View>
  );
};

const InfoBlock = ({ label, value }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default Ship_ConfirmPack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  content: {
    flex: 1,
  },

  mainCard: {
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },

  mainCardContent: {
    paddingVertical: 14,
    paddingBottom: 14,
  },

  itemCard: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },

  itemHeader: {
    height: 26,
    backgroundColor: '#F5F5F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  headerLabel: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  headerValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  itemBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  infoBlock: {
    width: '48%',
  },

  infoLabel: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  infoValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F4F6F8',
  },
});
