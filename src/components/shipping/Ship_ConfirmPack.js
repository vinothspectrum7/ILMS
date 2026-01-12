import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import ShipConfirmationModal from './Ship_ConfirmationModal';
import { useShippingStore } from '../../store/shippingStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Ship_ConfirmPack = () => {
  const navigation = useNavigation();

  const selectedTransaction = useShippingStore(s => s.selectedTransaction);
  const setSelectedTransaction = useShippingStore(s => s.setSelectedTransaction);
  const setTransactionStatus = useShippingStore(s => s.setTransactionStatus);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        organizationName="ENV"
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.mainCard, { width: mainCardWidth, maxHeight: screenHeight * 0.72 }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mainCardContent}>
          {confirmList.map((item, index) => (
            <View key={index} style={[styles.itemCard, { width: itemCardWidth }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.headerLabel}>LPN</Text>
                <Text style={styles.headerValue}>{item.lpn}</Text>
              </View>

              <View style={styles.itemBody}>
                <View style={styles.twoColRow}>
                  <InfoBlock label="Delivery Number" value={item.deliveryNo} />
                  <InfoBlock label="Customer Name" value={item.customer} />
                </View>

                <View style={styles.twoColRow}>
                  <InfoBlock label="Carrier" value={item.carrier} />
                  <InfoBlock label="Pack Number" value={item.packNo} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
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
